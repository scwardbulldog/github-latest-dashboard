/**
 * Config Loader - Loads user configuration from config.json with fallback defaults
 * @module config-loader
 * 
 * Supports both Pi (static file serving) and Vercel (CDN) deployments.
 * Config file is optional - defaults are used if config.json is not found or invalid.
 */

/**
 * Default configuration values
 * These match the original hardcoded values in main.js
 */
const DEFAULT_CONFIG = {
  // API refresh interval in milliseconds (5 minutes)
  refreshInterval: 5 * 60 * 1000,
  
  // Pages to display in the carousel (order matters)
  pages: ['vscode', 'visualstudio', 'blog', 'changelog', 'status', 'anthropic'],
  
  // Page rotation intervals in milliseconds
  pageIntervals: {
    default: 30000,      // 30 seconds per page
    blog: 80000,         // 80 seconds (5 items × 16s each)
    changelog: 80000,
    vscode: 80000,
    visualstudio: 80000,
    anthropic: 80000
  },
  
  // Item highlighting intervals in milliseconds
  itemIntervals: {
    default: 5333,       // ~5.3 seconds per item
    blog: 16000,         // 16 seconds per item
    changelog: 16000,
    vscode: 16000,
    visualstudio: 16000,
    anthropic: 16000
  },
  
  // Number of items to display per feed
  itemsPerFeed: {
    default: 5,
    blog: 5,
    changelog: 5,
    status: 10,
    vscode: 5,
    visualstudio: 5,
    anthropic: 5
  }
};

// Cached configuration (loaded once on startup)
let loadedConfig = null;
let configLoadAttempted = false;

/**
 * Validate a configuration object structure and values
 * @param {Object} config - Configuration object to validate
 * @returns {Object} Validation result with { valid: boolean, errors: string[] }
 */
function validateConfig(config) {
  const errors = [];
  
  // Validate refreshInterval
  if (config.refreshInterval !== undefined) {
    if (typeof config.refreshInterval !== 'number' || config.refreshInterval < 60000) {
      errors.push('refreshInterval must be a number >= 60000 (1 minute)');
    }
  }
  
  // Validate pages array
  if (config.pages !== undefined) {
    if (!Array.isArray(config.pages) || config.pages.length === 0) {
      errors.push('pages must be a non-empty array of strings');
    } else {
      const validPages = ['blog', 'changelog', 'status', 'vscode', 'visualstudio', 'anthropic'];
      const invalidPages = config.pages.filter(p => !validPages.includes(p));
      if (invalidPages.length > 0) {
        errors.push(`Invalid page names: ${invalidPages.join(', ')}. Valid: ${validPages.join(', ')}`);
      }
    }
  }
  
  // Validate interval objects
  const intervalFields = ['pageIntervals', 'itemIntervals'];
  intervalFields.forEach(field => {
    if (config[field] !== undefined) {
      if (typeof config[field] !== 'object' || config[field] === null) {
        errors.push(`${field} must be an object`);
      } else {
        Object.entries(config[field]).forEach(([key, value]) => {
          if (typeof value !== 'number' || value < 1000) {
            errors.push(`${field}.${key} must be a number >= 1000 (1 second)`);
          }
        });
      }
    }
  });
  
  // Validate itemsPerFeed object
  if (config.itemsPerFeed !== undefined) {
    if (typeof config.itemsPerFeed !== 'object' || config.itemsPerFeed === null) {
      errors.push('itemsPerFeed must be an object');
    } else {
      Object.entries(config.itemsPerFeed).forEach(([key, value]) => {
        if (typeof value !== 'number' || value < 1 || value > 20) {
          errors.push(`itemsPerFeed.${key} must be a number between 1 and 20`);
        }
      });
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Deep merge two objects, with source overriding target
 * @param {Object} target - Default configuration
 * @param {Object} source - User configuration
 * @returns {Object} Merged configuration
 */
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key of Object.keys(source)) {
    if (source[key] !== undefined && source[key] !== null) {
      if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
}

/**
 * Load configuration from config.json
 * Falls back to defaults if file not found or invalid
 * @returns {Promise<Object>} Configuration object
 */
export async function loadConfig() {
  // Return cached config if already loaded
  if (loadedConfig) {
    return loadedConfig;
  }
  
  // Prevent multiple load attempts
  if (configLoadAttempted) {
    return DEFAULT_CONFIG;
  }
  configLoadAttempted = true;
  
  try {
    // Try to fetch config.json from the same origin
    // Works on both Pi (static file) and Vercel (CDN)
    const response = await fetch('/config.json', {
      cache: 'no-cache' // Ensure fresh config on reload
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('📋 Config: No config.json found, using defaults');
      } else {
        console.warn(`📋 Config: Failed to load config.json (HTTP ${response.status}), using defaults`);
      }
      loadedConfig = DEFAULT_CONFIG;
      return loadedConfig;
    }
    
    const userConfig = await response.json();
    
    // Validate the loaded configuration
    const validation = validateConfig(userConfig);
    if (!validation.valid) {
      console.warn('📋 Config: Invalid config.json, using defaults. Errors:', validation.errors);
      loadedConfig = DEFAULT_CONFIG;
      return loadedConfig;
    }
    
    // Merge user config with defaults (user values override defaults)
    loadedConfig = deepMerge(DEFAULT_CONFIG, userConfig);
    console.log('📋 Config: Loaded custom configuration from config.json');
    
    return loadedConfig;
    
  } catch (error) {
    // JSON parse error or network error
    console.warn('📋 Config: Error loading config.json, using defaults:', error.message);
    loadedConfig = DEFAULT_CONFIG;
    return loadedConfig;
  }
}

/**
 * Get current configuration (synchronous, requires loadConfig() called first)
 * @returns {Object} Configuration object or defaults if not loaded
 */
export function getConfig() {
  return loadedConfig || DEFAULT_CONFIG;
}

/**
 * Get the default configuration
 * Useful for resetting or comparing
 * @returns {Object} Default configuration object
 */
export function getDefaultConfig() {
  return { ...DEFAULT_CONFIG };
}

/**
 * Get a specific page interval, with fallback to default
 * @param {string} pageName - Name of the page
 * @returns {number} Interval in milliseconds
 */
export function getPageInterval(pageName) {
  const config = getConfig();
  return config.pageIntervals[pageName] || config.pageIntervals.default;
}

/**
 * Get a specific item interval, with fallback to default
 * @param {string} pageName - Name of the page
 * @returns {number} Interval in milliseconds
 */
export function getItemInterval(pageName) {
  const config = getConfig();
  return config.itemIntervals[pageName] || config.itemIntervals.default;
}

/**
 * Get the number of items to display for a feed
 * @param {string} feedName - Name of the feed
 * @returns {number} Number of items
 */
export function getItemsPerFeed(feedName) {
  const config = getConfig();
  return config.itemsPerFeed[feedName] || config.itemsPerFeed.default;
}

/**
 * Reset cached configuration (for hot-reload support)
 */
export function resetConfig() {
  loadedConfig = null;
  configLoadAttempted = false;
}
