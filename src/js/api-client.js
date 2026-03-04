/**
 * API Client - Handles data fetching with in-memory caching and retry logic
 * @module api-client
 */

// Cache structure for all three data sources
const cache = {
  blog: { data: null, timestamp: 0 },
  changelog: { data: null, timestamp: 0 },
  status: { data: null, timestamp: 0 }
};

// Cache duration: 5 minutes (matches existing auto-refresh interval)
const CACHE_DURATION = 5 * 60 * 1000;

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
 * @param {string} source - Source name ('blog', 'changelog', 'status')
 * @returns {Object|null} Cache entry with data and timestamp
 */
export function getCacheEntry(source) {
  return cache[source] || null;
}
