/**
 * API Client - Handles data fetching with in-memory caching and retry logic
 * @module api-client
 */

// Cache structure for all data sources
const cache = {
  blog: { data: null, timestamp: 0 },
  changelog: { data: null, timestamp: 0 },
  status: { data: null, timestamp: 0 },
  vscode: { data: null, timestamp: 0 },
  visualstudio: { data: null, timestamp: 0 },
  anthropic: { data: null, timestamp: 0 }
};

// Cache duration: 5 minutes (matches existing auto-refresh interval)
const CACHE_DURATION = 5 * 60 * 1000;

// Status tracking for each data source
const sourceStatus = {
  blog: { state: 'idle', lastFetch: 0, nextRetry: null, retryAttempt: 0, cacheAge: 0, error: null },
  changelog: { state: 'idle', lastFetch: 0, nextRetry: null, retryAttempt: 0, cacheAge: 0, error: null },
  status: { state: 'idle', lastFetch: 0, nextRetry: null, retryAttempt: 0, cacheAge: 0, error: null },
  vscode: { state: 'idle', lastFetch: 0, nextRetry: null, retryAttempt: 0, cacheAge: 0, error: null },
  visualstudio: { state: 'idle', lastFetch: 0, nextRetry: null, retryAttempt: 0, cacheAge: 0, error: null },
  anthropic: { state: 'idle', lastFetch: 0, nextRetry: null, retryAttempt: 0, cacheAge: 0, error: null }
};

// Status change callbacks
const statusChangeCallbacks = [];

/**
 * Register a callback to be notified of status changes
 * @param {Function} callback - Function to call when status changes (sourceName, statusData)
 * @returns {Function} Unsubscribe function - call it to remove the callback and prevent memory leaks
 */
export function onStatusChange(callback) {
  statusChangeCallbacks.push(callback);

  return () => {
    const index = statusChangeCallbacks.indexOf(callback);
    if (index > -1) {
      statusChangeCallbacks.splice(index, 1);
    }
  };
}

/**
 * Emit status change event to all registered callbacks
 * @param {string} sourceName - Name of the data source
 * @param {Object} statusData - Current status data
 */
function emitStatusChange(sourceName, statusData) {
  statusChangeCallbacks.forEach(callback => {
    try {
      callback(sourceName, statusData);
    } catch (error) {
      console.error('Error in status change callback:', error);
    }
  });
}

/**
 * Update status for a data source
 * @param {string} sourceName - Name of the data source
 * @param {Object} updates - Status updates to apply
 */
function updateStatus(sourceName, updates) {
  if (!sourceStatus[sourceName]) return;
  
  Object.assign(sourceStatus[sourceName], updates);
  
  // Calculate cache age if we have cached data
  if (cache[sourceName].timestamp > 0) {
    sourceStatus[sourceName].cacheAge = Date.now() - cache[sourceName].timestamp;
  }
  
  emitStatusChange(sourceName, sourceStatus[sourceName]);
}

/**
 * Get current status for a data source
 * @param {string} sourceName - Name of the data source
 * @returns {Object} Current status data
 */
export function getSourceStatus(sourceName) {
  if (!sourceStatus[sourceName]) {
    return { state: 'unknown', lastFetch: 0, nextRetry: null, retryAttempt: 0, cacheAge: 0, error: null };
  }
  
  // Update cache age before returning
  if (cache[sourceName].timestamp > 0) {
    sourceStatus[sourceName].cacheAge = Date.now() - cache[sourceName].timestamp;
  }
  
  return { ...sourceStatus[sourceName] };
}

/**
 * Retry a fetch operation with exponential backoff
 * @param {Function} fetchFn - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number[]} delays - Delay in ms between retries (default: [1000, 2000, 4000])
 * @param {string} sourceName - Name of the data source (for status tracking)
 * @returns {Promise<any>} Result from successful fetch
 * @throws {Error} Last error if all retries fail
 */
async function retryFetch(fetchFn, maxRetries = 3, delays = [1000, 2000, 4000], sourceName = null) {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fetchFn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries) {
        const delay = delays[i] || delays[delays.length - 1];
        console.warn(`Retry attempt ${i + 1}/${maxRetries} failed, retrying in ${delay}ms...`, error.message);
        
        // Update status to retrying state
        if (sourceName) {
          updateStatus(sourceName, {
            state: 'retrying',
            retryAttempt: i + 1,
            nextRetry: Date.now() + delay,
            error: error.message
          });
        }
        
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
const VISUALSTUDIO_DEVBLOG_RSS = 'https://devblogs.microsoft.com/visualstudio/feed/';
// Official Claude Code changelog RSS feed
const ANTHROPIC_NEWS_RSS = 'https://code.claude.com/docs/en/changelog/rss.xml';

/**
 * Fetch GitHub Blog data with caching and retry logic
 * @returns {Promise<Object>} Blog RSS data
 * @throws {Error} If fetch fails and no cached data available
 */
export async function fetchBlog() {
  const sourceName = 'blog';
  const now = Date.now();
  
  // Return cached data if still fresh
  if (cache.blog.data && now - cache.blog.timestamp < CACHE_DURATION) {
    console.log('fetchBlog: Using cached data');
    updateStatus(sourceName, {
      state: 'success',
      lastFetch: cache.blog.timestamp,
      retryAttempt: 0,
      nextRetry: null,
      error: null
    });
    return cache.blog.data;
  }
  
  // Update status to fetching
  updateStatus(sourceName, {
    state: 'fetching',
    retryAttempt: 0,
    nextRetry: null,
    error: null
  });
  
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
    }, 3, [1000, 2000, 4000], sourceName);
    
    cache.blog = { data, timestamp: now };
    console.log(`fetchBlog: Fetched ${data.items.length} items`);
    
    // Update status to success
    updateStatus(sourceName, {
      state: 'success',
      lastFetch: now,
      retryAttempt: 0,
      nextRetry: null,
      error: null
    });
    
    return data;
  } catch (error) {
    console.error('fetchBlog: Error fetching blog data after retries:', error);
    
    // Return stale cache if available (graceful degradation)
    if (cache.blog.data) {
      console.warn('fetchBlog: Using stale cached data due to fetch error');
      updateStatus(sourceName, {
        state: 'cached',
        retryAttempt: 0,
        nextRetry: null,
        error: error.message
      });
      return cache.blog.data;
    }
    
    // No cache available, update to failed state
    updateStatus(sourceName, {
      state: 'failed',
      retryAttempt: 0,
      nextRetry: null,
      error: error.message
    });
    
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
  const sourceName = 'changelog';
  const now = Date.now();
  
  // Return cached data if still fresh
  if (cache.changelog.data && now - cache.changelog.timestamp < CACHE_DURATION) {
    console.log('fetchChangelog: Using cached data');
    updateStatus(sourceName, {
      state: 'success',
      lastFetch: cache.changelog.timestamp,
      retryAttempt: 0,
      nextRetry: null,
      error: null
    });
    return cache.changelog.data;
  }
  
  // Update status to fetching
  updateStatus(sourceName, {
    state: 'fetching',
    retryAttempt: 0,
    nextRetry: null,
    error: null
  });
  
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
    }, 3, [1000, 2000, 4000], sourceName);
    
    cache.changelog = { data, timestamp: now };
    console.log(`fetchChangelog: Fetched ${data.items.length} items`);
    
    // Update status to success
    updateStatus(sourceName, {
      state: 'success',
      lastFetch: now,
      retryAttempt: 0,
      nextRetry: null,
      error: null
    });
    
    return data;
  } catch (error) {
    console.error('fetchChangelog: Error fetching changelog data after retries:', error);
    
    // Return stale cache if available (graceful degradation)
    if (cache.changelog.data) {
      console.warn('fetchChangelog: Using stale cached data due to fetch error');
      updateStatus(sourceName, {
        state: 'cached',
        retryAttempt: 0,
        nextRetry: null,
        error: error.message
      });
      return cache.changelog.data;
    }
    
    // No cache available, update to failed state
    updateStatus(sourceName, {
      state: 'failed',
      retryAttempt: 0,
      nextRetry: null,
      error: error.message
    });
    
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
  const sourceName = 'status';
  const now = Date.now();
  
  // Return cached data if still fresh
  if (cache.status.data && now - cache.status.timestamp < CACHE_DURATION) {
    console.log('fetchStatus: Using cached data');
    updateStatus(sourceName, {
      state: 'success',
      lastFetch: cache.status.timestamp,
      retryAttempt: 0,
      nextRetry: null,
      error: null
    });
    return cache.status.data;
  }
  
  // Update status to fetching
  updateStatus(sourceName, {
    state: 'fetching',
    retryAttempt: 0,
    nextRetry: null,
    error: null
  });
  
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
    }, 3, [1000, 2000, 4000], sourceName);
    
    cache.status = { data, timestamp: now };
    console.log(`fetchStatus: Fetched ${data.incidents.length} incidents (active + resolved)`);
    
    // Update status to success
    updateStatus(sourceName, {
      state: 'success',
      lastFetch: now,
      retryAttempt: 0,
      nextRetry: null,
      error: null
    });
    
    return data;
  } catch (error) {
    console.error('fetchStatus: Error fetching status data after retries:', error);
    
    // Return stale cache if available (graceful degradation)
    if (cache.status.data) {
      console.warn('fetchStatus: Using stale cached data due to fetch error');
      updateStatus(sourceName, {
        state: 'cached',
        retryAttempt: 0,
        nextRetry: null,
        error: error.message
      });
      return cache.status.data;
    }
    
    // No cache available, update to failed state
    updateStatus(sourceName, {
      state: 'failed',
      retryAttempt: 0,
      nextRetry: null,
      error: error.message
    });
    
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
 * Fetch VS Code Updates data with caching and retry logic
 * @returns {Promise<Object>} VS Code Updates RSS data
 * @throws {Error} If fetch fails and no cached data available
 */
export async function fetchVSCode() {
  const sourceName = 'vscode';
  const now = Date.now();

  // Return cached data if still fresh
  if (cache.vscode.data && now - cache.vscode.timestamp < CACHE_DURATION) {
    console.log('fetchVSCode: Using cached data');
    updateStatus(sourceName, {
      state: 'success',
      lastFetch: cache.vscode.timestamp,
      retryAttempt: 0,
      nextRetry: null,
      error: null
    });
    return cache.vscode.data;
  }

  // Update status to fetching
  updateStatus(sourceName, {
    state: 'fetching',
    retryAttempt: 0,
    nextRetry: null,
    error: null
  });

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
    }, 3, [1000, 2000, 4000], sourceName);

    cache.vscode = { data, timestamp: now };
    console.log(`fetchVSCode: Fetched ${data.items.length} items`);
    
    // Update status to success
    updateStatus(sourceName, {
      state: 'success',
      lastFetch: now,
      retryAttempt: 0,
      nextRetry: null,
      error: null
    });
    
    return data;
  } catch (error) {
    console.error('fetchVSCode: Error fetching VS Code updates after retries:', error);

    // Return stale cache if available (graceful degradation)
    if (cache.vscode.data) {
      console.warn('fetchVSCode: Using stale cached data due to fetch error');
      updateStatus(sourceName, {
        state: 'cached',
        retryAttempt: 0,
        nextRetry: null,
        error: error.message
      });
      return cache.vscode.data;
    }

    // No cache available, update to failed state
    updateStatus(sourceName, {
      state: 'failed',
      retryAttempt: 0,
      nextRetry: null,
      error: error.message
    });

    // No cache available, propagate error
    throw error;
  }
}

/**
 * Fetch Visual Studio DevBlog data with caching and retry logic
 * @returns {Promise<Object>} Visual Studio DevBlog RSS data
 * @throws {Error} If fetch fails and no cached data available
 */
export async function fetchVisualStudio() {
  const sourceName = 'visualstudio';
  const now = Date.now();

  // Return cached data if still fresh
  if (cache.visualstudio.data && now - cache.visualstudio.timestamp < CACHE_DURATION) {
    console.log('fetchVisualStudio: Using cached data');
    updateStatus(sourceName, {
      state: 'success',
      lastFetch: cache.visualstudio.timestamp,
      retryAttempt: 0,
      nextRetry: null,
      error: null
    });
    return cache.visualstudio.data;
  }

  // Update status to fetching
  updateStatus(sourceName, {
    state: 'fetching',
    retryAttempt: 0,
    nextRetry: null,
    error: null
  });

  // Fetch new data with retry logic
  try {
    const data = await retryFetch(async () => {
      const url = `${RSS2JSON_API}?rss_url=${encodeURIComponent(VISUALSTUDIO_DEVBLOG_RSS)}`;
      console.log('fetchVisualStudio: Fetching from API...');
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
    }, 3, [1000, 2000, 4000], sourceName);

    cache.visualstudio = { data, timestamp: now };
    console.log(`fetchVisualStudio: Fetched ${data.items.length} items`);
    
    // Update status to success
    updateStatus(sourceName, {
      state: 'success',
      lastFetch: now,
      retryAttempt: 0,
      nextRetry: null,
      error: null
    });
    
    return data;
  } catch (error) {
    console.error('fetchVisualStudio: Error fetching Visual Studio updates after retries:', error);

    // Return stale cache if available (graceful degradation)
    if (cache.visualstudio.data) {
      console.warn('fetchVisualStudio: Using stale cached data due to fetch error');
      updateStatus(sourceName, {
        state: 'cached',
        retryAttempt: 0,
        nextRetry: null,
        error: error.message
      });
      return cache.visualstudio.data;
    }

    // No cache available, update to failed state
    updateStatus(sourceName, {
      state: 'failed',
      retryAttempt: 0,
      nextRetry: null,
      error: error.message
    });

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

// Cache for article content (separate from RSS cache)
const articleCache = new Map();
const ARTICLE_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for article content

/**
 * Clean up expired entries from the article cache
 * Removes entries older than ARTICLE_CACHE_DURATION to prevent unbounded memory growth
 * @private
 */
function cleanupArticleCache() {
  const now = Date.now();
  let removed = 0;
  
  for (const [url, entry] of articleCache.entries()) {
    if (now - entry.timestamp > ARTICLE_CACHE_DURATION) {
      articleCache.delete(url);
      removed++;
    }
  }
  
  if (removed > 0) {
    console.log(`articleCache: Cleaned ${removed} expired ${removed === 1 ? 'entry' : 'entries'} (${articleCache.size} remaining)`);
  }
}

// CORS proxy for fetching external pages
// Note: Using a public CORS proxy is necessary for this client-side only application.
// The proxy (allorigins.win) acts as an intermediary to bypass CORS restrictions.
// Security consideration: This proxy can see all fetched content. Only use for 
// public, non-sensitive content (VS Code update pages are public documentation).
// Alternative: Deploy your own CORS proxy or backend endpoint for production use.
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

/**
 * Fetch article content from a VS Code update page URL
 * @param {string} url - The full URL of the article page
 * @returns {Promise<string>} The extracted article HTML content
 * @throws {Error} If fetch fails
 */
export async function fetchArticleContent(url) {
  if (!url) {
    console.warn('fetchArticleContent: No URL provided');
    return null;
  }

  // Clean up expired cache entries (lazy cleanup on every fetch)
  cleanupArticleCache();

  const now = Date.now();
  
  // Check cache first
  const cached = articleCache.get(url);
  if (cached && now - cached.timestamp < ARTICLE_CACHE_DURATION) {
    console.log('fetchArticleContent: Using cached content for', url);
    return cached.content;
  }

  try {
    const content = await retryFetch(async () => {
      const proxyUrl = CORS_PROXY + encodeURIComponent(url);
      console.log('fetchArticleContent: Fetching from', url);
      
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // Extract main article content from the page
      return extractVSCodeArticleContent(html);
    }, 2, [1000, 2000]); // 2 retries with shorter delays

    // Cache the extracted content
    articleCache.set(url, { content, timestamp: now });
    console.log('fetchArticleContent: Successfully fetched and cached content');
    
    return content;
  } catch (error) {
    console.error('fetchArticleContent: Error fetching article content:', error);
    
    // Return cached content if available (stale cache)
    if (cached) {
      console.warn('fetchArticleContent: Using stale cached content due to fetch error');
      return cached.content;
    }
    
    return null;
  }
}

/**
 * Extract the main article content from VS Code update page HTML
 * @param {string} html - The full HTML of the page
 * @returns {string} The extracted article content HTML
 */
function extractVSCodeArticleContent(html) {
  if (!html) return '';
  
  // Selectors to remove from content (scripts, styles, navigation, etc.)
  const ELEMENTS_TO_REMOVE = [
    'script', 'style', 'nav', 'header', 'footer', 
    '.nav', '.header', '.footer', '.sidebar', '.toc', '.navigation'
  ];
  
  // Create a DOM parser to extract content
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // VS Code pages typically have main content in these selectors
  // Try multiple selectors in order of specificity
  const contentSelectors = [
    'main.docs-main-content',  // VS Code update pages - most specific
    '.docs-main-content',       // VS Code docs content
    'article',
    '.main-content',
    'main',                     // Generic fallback
    '.content',
    '#main-content',
    '.release-notes',
    '.update-notes'
  ];
  
  let contentEl = null;
  for (const selector of contentSelectors) {
    contentEl = doc.querySelector(selector);
    if (contentEl) break;
  }
  
  if (!contentEl) {
    // Fallback: try to get body content without nav/footer
    const body = doc.body;
    if (body) {
      // Remove navigation and footer elements from body before using as content
      ELEMENTS_TO_REMOVE.forEach(sel => {
        body.querySelectorAll(sel).forEach(el => el.remove());
      });
      contentEl = body;
    }
  }
  
  if (!contentEl) {
    console.warn('extractVSCodeArticleContent: Could not find main content');
    return '';
  }
  
  // Clean up the content - remove unwanted elements
  ELEMENTS_TO_REMOVE.forEach(sel => {
    contentEl.querySelectorAll(sel).forEach(el => el.remove());
  });
  
  // Remove event handlers from all elements
  contentEl.querySelectorAll('*').forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });
  });
  
  // Make all links open in new tab
  contentEl.querySelectorAll('a').forEach(a => {
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });
  
  // Get the cleaned HTML
  return contentEl.innerHTML;
}

/**
 * Clear the article cache (useful for testing or manual refresh)
 */
export function clearArticleCache() {
  articleCache.clear();
  console.log('Article cache cleared');
}

/**
 * Fetch Claude Code Changelog data with caching and retry logic
 * Uses the official Claude Code changelog RSS feed
 * @returns {Promise<Object>} Claude Code Changelog RSS data
 * @throws {Error} If fetch fails and no cached data available
 */
export async function fetchAnthropic() {
  const sourceName = 'anthropic';
  const now = Date.now();

  // Return cached data if still fresh
  if (cache.anthropic.data && now - cache.anthropic.timestamp < CACHE_DURATION) {
    console.log('fetchAnthropic: Using cached data');
    updateStatus(sourceName, {
      state: 'success',
      lastFetch: cache.anthropic.timestamp,
      retryAttempt: 0,
      nextRetry: null,
      error: null
    });
    return cache.anthropic.data;
  }

  // Update status to fetching
  updateStatus(sourceName, {
    state: 'fetching',
    retryAttempt: 0,
    nextRetry: null,
    error: null
  });

  // Fetch new data with retry logic
  try {
    const data = await retryFetch(async () => {
      const url = `${RSS2JSON_API}?rss_url=${encodeURIComponent(ANTHROPIC_NEWS_RSS)}`;
      console.log('fetchAnthropic: Fetching from API...');
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
    }, 3, [1000, 2000, 4000], sourceName);

    cache.anthropic = { data, timestamp: now };
    console.log(`fetchAnthropic: Fetched ${data.items.length} items`);
    
    // Update status to success
    updateStatus(sourceName, {
      state: 'success',
      lastFetch: now,
      retryAttempt: 0,
      nextRetry: null,
      error: null
    });
    
    return data;
  } catch (error) {
    console.error('fetchAnthropic: Error fetching Anthropic news after retries:', error);

    // Return stale cache if available (graceful degradation)
    if (cache.anthropic.data) {
      console.warn('fetchAnthropic: Using stale cached data due to fetch error');
      updateStatus(sourceName, {
        state: 'cached',
        retryAttempt: 0,
        nextRetry: null,
        error: error.message
      });
      return cache.anthropic.data;
    }

    // No cache available, update to failed state
    updateStatus(sourceName, {
      state: 'failed',
      retryAttempt: 0,
      nextRetry: null,
      error: error.message
    });

    // No cache available, propagate error
    throw error;
  }
}

