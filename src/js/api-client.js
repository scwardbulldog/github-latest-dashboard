/**
 * API Client - Handles data fetching with in-memory caching and retry logic
 * @module api-client
 */

// Cache structure for all data sources
const cache = {
  blog: { data: null, timestamp: 0 },
  changelog: { data: null, timestamp: 0 },
  status: { data: null, timestamp: 0 },
  vscode: { data: null, timestamp: 0 }
};

// Cache duration: 5 minutes (matches existing auto-refresh interval)
const CACHE_DURATION = 5 * 60 * 1000;

// VS Code full content fetch configuration
const MAX_ITEMS_WITH_FULL_CONTENT = 10; // Limit items to fetch full content for
const MIN_CONTENT_LENGTH_THRESHOLD = 1000; // Min chars to consider content "full"
const MAX_BODY_CONTENT_LENGTH = 10000; // Max chars to extract from body fallback
const CONCURRENT_CONTENT_FETCHES = 3; // Max concurrent article fetches

/**
 * Retry a fetch operation with exponential backoff
 * @param {Function} fetchFn - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number[]} delays - Delay in ms between retries (default: [1000, 2000, 4000])
 * @returns {Promise<any>} Result from successful fetch
 * @throws {Error} Last error if all retries fail
 */
async function retryFetch(fetchFn, maxRetries = 3, delays = [1000, 2000, 4000]) {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fetchFn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries) {
        const delay = delays[i] || delays[delays.length - 1];
        console.warn(`Retry attempt ${i + 1}/${maxRetries} failed, retrying in ${delay}ms...`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error(`All ${maxRetries + 1} fetch attempts failed`);
  throw lastError;
}

// API endpoints (copy from existing main.js)
const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json';
const GITHUB_BLOG_RSS = 'https://github.blog/feed/';
const GITHUB_CHANGELOG_RSS = 'https://github.blog/changelog/feed/';
const GITHUB_STATUS_API = 'https://www.githubstatus.com/api/v2/incidents.json';
const VSCODE_UPDATES_RSS = 'https://code.visualstudio.com/feed.xml';

/**
 * Fetch GitHub Blog data with caching and retry logic
 * @returns {Promise<Object>} Blog RSS data
 * @throws {Error} If fetch fails and no cached data available
 */
export async function fetchBlog() {
  const now = Date.now();
  
  // Return cached data if still fresh
  if (cache.blog.data && now - cache.blog.timestamp < CACHE_DURATION) {
    console.log('fetchBlog: Using cached data');
    return cache.blog.data;
  }
  
  // Fetch new data with retry logic
  try {
    const data = await retryFetch(async () => {
      const url = `${RSS2JSON_API}?rss_url=${encodeURIComponent(GITHUB_BLOG_RSS)}`;
      console.log('fetchBlog: Fetching from API...');
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const jsonData = await response.json();
      
      // Validate response structure
      if (!jsonData || !jsonData.items || !Array.isArray(jsonData.items)) {
        throw new Error('Invalid RSS2JSON response structure');
      }
      
      return jsonData;
    });
    
    cache.blog = { data, timestamp: now };
    console.log(`fetchBlog: Fetched ${data.items.length} items`);
    return data;
  } catch (error) {
    console.error('fetchBlog: Error fetching blog data after retries:', error);
    
    // Return stale cache if available (graceful degradation)
    if (cache.blog.data) {
      console.warn('fetchBlog: Using stale cached data due to fetch error');
      return cache.blog.data;
    }
    
    // No cache available, propagate error
    throw error;
  }
}

/**
 * Fetch GitHub Changelog data with caching and retry logic
 * @returns {Promise<Object>} Changelog RSS data
 * @throws {Error} If fetch fails and no cached data available
 */
export async function fetchChangelog() {
  const now = Date.now();
  
  // Return cached data if still fresh
  if (cache.changelog.data && now - cache.changelog.timestamp < CACHE_DURATION) {
    console.log('fetchChangelog: Using cached data');
    return cache.changelog.data;
  }
  
  // Fetch new data with retry logic
  try {
    const data = await retryFetch(async () => {
      const url = `${RSS2JSON_API}?rss_url=${encodeURIComponent(GITHUB_CHANGELOG_RSS)}`;
      console.log('fetchChangelog: Fetching from API...');
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const jsonData = await response.json();
      
      // Validate response structure
      if (!jsonData || !jsonData.items || !Array.isArray(jsonData.items)) {
        throw new Error('Invalid RSS2JSON response structure');
      }
      
      return jsonData;
    });
    
    cache.changelog = { data, timestamp: now };
    console.log(`fetchChangelog: Fetched ${data.items.length} items`);
    return data;
  } catch (error) {
    console.error('fetchChangelog: Error fetching changelog data after retries:', error);
    
    // Return stale cache if available (graceful degradation)
    if (cache.changelog.data) {
      console.warn('fetchChangelog: Using stale cached data due to fetch error');
      return cache.changelog.data;
    }
    
    // No cache available, propagate error
    throw error;
  }
}

/**
 * Fetch GitHub Status data with caching and retry logic
 * @returns {Promise<Object>} Status API data
 * @throws {Error} If fetch fails and no cached data available
 */
export async function fetchStatus() {
  const now = Date.now();
  
  // Return cached data if still fresh
  if (cache.status.data && now - cache.status.timestamp < CACHE_DURATION) {
    console.log('fetchStatus: Using cached data');
    return cache.status.data;
  }
  
  // Fetch new data with retry logic
  try {
    const data = await retryFetch(async () => {
      console.log('fetchStatus: Fetching from API...');
      const response = await fetch(GITHUB_STATUS_API);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const jsonData = await response.json();
      
      // Validate response structure (incidents.json has incidents array)
      if (!jsonData || !jsonData.incidents || !Array.isArray(jsonData.incidents)) {
        throw new Error('Invalid GitHub Status API response structure');
      }
      
      return jsonData;
    });
    
    cache.status = { data, timestamp: now };
    console.log(`fetchStatus: Fetched ${data.incidents.length} incidents (active + resolved)`);
    return data;
  } catch (error) {
    console.error('fetchStatus: Error fetching status data after retries:', error);
    
    // Return stale cache if available (graceful degradation)
    if (cache.status.data) {
      console.warn('fetchStatus: Using stale cached data due to fetch error');
      return cache.status.data;
    }
    
    // No cache available, propagate error
    throw error;
  }
}

/**
 * Get cache entry for a specific source (used for timestamp display)
 * @param {string} source - Source name ('blog', 'changelog', 'status', 'vscode')
 * @returns {Object|null} Cache entry with data and timestamp
 */
export function getCacheEntry(source) {
  return cache[source] || null;
}

/**
 * Fetch full article content from VS Code updates page
 * Uses DOMParser for safe HTML parsing
 * @param {string} url - Article URL
 * @returns {Promise<string>} Full article HTML content
 */
async function fetchVSCodeArticleContent(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    
    // Use DOMParser for safe HTML parsing (prevents XSS and parsing issues)
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Try to extract main content from the VS Code updates page
    // Priority: <article> > <main> > limited <body> content
    
    const article = doc.querySelector('article');
    if (article) {
      return article.innerHTML;
    }
    
    const main = doc.querySelector('main');
    if (main) {
      return main.innerHTML;
    }
    
    // Last resort: return limited portion of body to avoid huge content
    const body = doc.querySelector('body');
    if (body) {
      const bodyContent = body.innerHTML;
      return bodyContent.substring(0, MAX_BODY_CONTENT_LENGTH);
    }
    
    return '';
  } catch (error) {
    console.warn(`Failed to fetch full content from ${url}:`, error.message);
    return '';
  }
}

/**
 * Process items with rate limiting to avoid server overload
 * Fetches full content with controlled concurrency
 * @param {Array} items - RSS items to process
 * @param {number} concurrency - Max concurrent fetches
 * @returns {Promise<Array>} Items with full content
 */
async function fetchItemsWithRateLimit(items, concurrency = CONCURRENT_CONTENT_FETCHES) {
  const results = [];
  
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (item) => {
        // If content field is already substantial, use it
        if (item.content && item.content.length > MIN_CONTENT_LENGTH_THRESHOLD) {
          return item;
        }
        
        // Otherwise, fetch full content from the article URL
        if (item.link) {
          const fullContent = await fetchVSCodeArticleContent(item.link);
          if (fullContent) {
            return {
              ...item,
              content: fullContent,
              // Keep original for fallback
              originalContent: item.content || item.description
            };
          }
        }
        
        return item;
      })
    );
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Fetch VS Code Updates data with caching and retry logic
 * Enhanced to fetch full article content for each item
 * @returns {Promise<Object>} VS Code Updates RSS data with full content
 * @throws {Error} If fetch fails and no cached data available
 */
export async function fetchVSCode() {
  const now = Date.now();

  // Return cached data if still fresh
  if (cache.vscode.data && now - cache.vscode.timestamp < CACHE_DURATION) {
    console.log('fetchVSCode: Using cached data');
    return cache.vscode.data;
  }

  // Fetch new data with retry logic
  try {
    const data = await retryFetch(async () => {
      const url = `${RSS2JSON_API}?rss_url=${encodeURIComponent(VSCODE_UPDATES_RSS)}`;
      console.log('fetchVSCode: Fetching from API...');
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const jsonData = await response.json();

      // Validate response structure
      if (!jsonData || !jsonData.items || !Array.isArray(jsonData.items)) {
        throw new Error('Invalid RSS2JSON response structure');
      }

      return jsonData;
    });

    // Fetch full content for each item with rate limiting to avoid server overload
    console.log('fetchVSCode: Fetching full article content for items...');
    const itemsWithFullContent = await fetchItemsWithRateLimit(
      data.items.slice(0, MAX_ITEMS_WITH_FULL_CONTENT)
    );

    // Replace items with enhanced versions
    const enhancedData = {
      ...data,
      items: itemsWithFullContent
    };

    cache.vscode = { data: enhancedData, timestamp: now };
    console.log(`fetchVSCode: Fetched ${enhancedData.items.length} items with full content`);
    return enhancedData;
  } catch (error) {
    console.error('fetchVSCode: Error fetching VS Code updates after retries:', error);

    // Return stale cache if available (graceful degradation)
    if (cache.vscode.data) {
      console.warn('fetchVSCode: Using stale cached data due to fetch error');
      return cache.vscode.data;
    }

    // No cache available, propagate error
    throw error;
  }
}

/**
 * Detect active outages from GitHub Status API data
 * @param {Object} statusData - GitHub Status API response
 * @returns {Object|null} Outage data or null if all operational
 */
export function detectActiveOutages(statusData) {
  // GitHub Status API uses incidents.json which has incidents array
  // But for component-level status, we need status.json or components.json
  // Since we're using incidents.json, check for active incidents
  
  if (!statusData || !statusData.incidents || !Array.isArray(statusData.incidents)) {
    console.warn('detectActiveOutages: Invalid status data structure');
    return null;
  }
  
  // Filter for active/ongoing incidents (not resolved)
  const activeIncidents = statusData.incidents.filter(incident => 
    incident.status !== 'resolved' && incident.status !== 'postmortem'
  );
  
  if (activeIncidents.length === 0) {
    return null; // All operational
  }
  
  // Determine most severe impact level
  // Impact levels: none, minor, major, critical
  let severity = 'degraded_performance'; // Default
  let hasMajor = false;
  
  activeIncidents.forEach(incident => {
    if (incident.impact === 'critical' || incident.impact === 'major') {
      hasMajor = true;
    }
  });
  
  if (hasMajor) {
    severity = 'major_outage';
  }
  
  // Extract affected services/components
  const services = activeIncidents.map(incident => ({
    name: incident.name || 'GitHub Services',
    status: severity
  }));
  
  return {
    severity,
    count: activeIncidents.length,
    services
  };
}

