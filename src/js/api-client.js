/**
 * API Client - Handles data fetching with in-memory caching
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

// API endpoints (copy from existing main.js)
const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json';
const GITHUB_BLOG_RSS = 'https://github.blog/feed/';
const GITHUB_CHANGELOG_RSS = 'https://github.blog/changelog/feed/';
const GITHUB_STATUS_API = 'https://www.githubstatus.com/api/v2/incidents.json';

/**
 * Fetch GitHub Blog data with caching
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
  
  // Fetch new data
  try {
    const url = `${RSS2JSON_API}?rss_url=${encodeURIComponent(GITHUB_BLOG_RSS)}`;
    console.log('fetchBlog: Fetching from API...');
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data || !data.items || !Array.isArray(data.items)) {
      throw new Error('Invalid RSS2JSON response structure');
    }
    
    cache.blog = { data, timestamp: now };
    console.log(`fetchBlog: Fetched ${data.items.length} items`);
    return data;
  } catch (error) {
    console.error('fetchBlog: Error fetching blog data:', error);
    
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
 * Fetch GitHub Changelog data with caching
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
  
  // Fetch new data
  try {
    const url = `${RSS2JSON_API}?rss_url=${encodeURIComponent(GITHUB_CHANGELOG_RSS)}`;
    console.log('fetchChangelog: Fetching from API...');
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data || !data.items || !Array.isArray(data.items)) {
      throw new Error('Invalid RSS2JSON response structure');
    }
    
    cache.changelog = { data, timestamp: now };
    console.log(`fetchChangelog: Fetched ${data.items.length} items`);
    return data;
  } catch (error) {
    console.error('fetchChangelog: Error fetching changelog data:', error);
    
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
 * Fetch GitHub Status data with caching
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
  
  // Fetch new data
  try {
    console.log('fetchStatus: Fetching from API...');
    const response = await fetch(GITHUB_STATUS_API);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate response structure (incidents.json has incidents array)
    if (!data || !data.incidents || !Array.isArray(data.incidents)) {
      throw new Error('Invalid GitHub Status API response structure');
    }
    
    cache.status = { data, timestamp: now };
    console.log(`fetchStatus: Fetched ${data.incidents.length} incidents (active + resolved)`);
    return data;
  } catch (error) {
    console.error('fetchStatus: Error fetching status data:', error);
    
    // Return stale cache if available (graceful degradation)
    if (cache.status.data) {
      console.warn('fetchStatus: Using stale cached data due to fetch error');
      return cache.status.data;
    }
    
    // No cache available, propagate error
    throw error;
  }
}
