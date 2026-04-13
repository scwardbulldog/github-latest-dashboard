/**
 * Multi-Source Refresh Controller
 *
 * Manages independent refresh timers for each data source with:
 * - Per-source configurable refresh intervals
 * - Independent timer management for each source
 * - Backward compatibility with global refresh interval
 * - Proper timer cleanup to prevent memory leaks
 *
 * @module multi-source-refresh-controller
 */
export class MultiSourceRefreshController {
  /**
   * @param {Object} config - Configuration object
   * @param {Object} config.refreshIntervals - Per-source refresh intervals in ms
   * @param {number} config.defaultInterval - Fallback interval for unlisted sources (default: 5 minutes)
   */
  constructor(config = {}) {
    this.timers = new Map();
    this.intervals = config.refreshIntervals || {};
    this.defaultInterval = config.defaultInterval || 5 * 60 * 1000; // 5 minutes
    this.sources = new Map(); // Maps source name to fetch function
    
    // Minimum refresh interval to prevent abuse (1 minute)
    this.minInterval = 60 * 1000;
    
    console.log('🔄 MultiSourceRefreshController initialized with intervals:', this.intervals);
  }
  
  /**
   * Register a source with its fetch function
   * @param {string} sourceName - Name of the source (e.g., 'blog', 'changelog')
   * @param {Function} fetchFn - Async function to fetch data for this source
   */
  registerSource(sourceName, fetchFn) {
    if (typeof fetchFn !== 'function') {
      console.error(`registerSource: fetchFn for ${sourceName} must be a function`);
      return;
    }
    
    this.sources.set(sourceName, fetchFn);
    console.log(`🔄 Registered source: ${sourceName}`);
  }
  
  /**
   * Start refresh timer for a specific source
   * @param {string} sourceName - Name of the source to start
   */
  startSource(sourceName) {
    // Stop existing timer if any
    this.stopSource(sourceName);
    
    const fetchFn = this.sources.get(sourceName);
    if (!fetchFn) {
      console.warn(`startSource: No fetch function registered for ${sourceName}`);
      return;
    }
    
    // Get interval for this source, fall back to default
    let interval = this.intervals[sourceName] || this.defaultInterval;
    
    // Enforce minimum interval
    if (interval < this.minInterval) {
      console.warn(`startSource: Interval for ${sourceName} (${interval}ms) is below minimum, using ${this.minInterval}ms`);
      interval = this.minInterval;
    }
    
    // Start the timer
    const timer = setInterval(() => {
      console.log(`🔄 Auto-refresh triggered for ${sourceName}`);
      fetchFn().catch(err => {
        console.error(`Error refreshing ${sourceName}:`, err);
      });
    }, interval);
    
    this.timers.set(sourceName, timer);
    console.log(`🔄 Started refresh timer for ${sourceName}: ${interval / 1000}s interval`);
  }
  
  /**
   * Stop refresh timer for a specific source
   * @param {string} sourceName - Name of the source to stop
   */
  stopSource(sourceName) {
    const timer = this.timers.get(sourceName);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(sourceName);
      console.log(`🔄 Stopped refresh timer for ${sourceName}`);
    }
  }
  
  /**
   * Start all registered sources
   */
  startAll() {
    for (const sourceName of this.sources.keys()) {
      this.startSource(sourceName);
    }
  }
  
  /**
   * Stop all refresh timers
   */
  stopAll() {
    for (const sourceName of this.timers.keys()) {
      this.stopSource(sourceName);
    }
    console.log('🔄 All refresh timers stopped');
  }
  
  /**
   * Update the interval for a specific source and restart its timer
   * @param {string} sourceName - Name of the source
   * @param {number} intervalMs - New interval in milliseconds
   */
  updateInterval(sourceName, intervalMs) {
    if (intervalMs < this.minInterval) {
      console.warn(`updateInterval: Interval ${intervalMs}ms is below minimum ${this.minInterval}ms`);
      intervalMs = this.minInterval;
    }
    
    this.intervals[sourceName] = intervalMs;
    
    // Restart the source if it's currently running
    if (this.timers.has(sourceName)) {
      this.startSource(sourceName);
    }
    
    console.log(`🔄 Updated interval for ${sourceName}: ${intervalMs / 1000}s`);
  }
  
  /**
   * Update the default interval for all sources without specific intervals
   * @param {number} intervalMs - New default interval in milliseconds
   */
  updateDefaultInterval(intervalMs) {
    if (intervalMs < this.minInterval) {
      console.warn(`updateDefaultInterval: Interval ${intervalMs}ms is below minimum ${this.minInterval}ms`);
      intervalMs = this.minInterval;
    }
    
    this.defaultInterval = intervalMs;
    
    // Restart sources that use the default interval
    for (const sourceName of this.sources.keys()) {
      if (!this.intervals[sourceName] && this.timers.has(sourceName)) {
        this.startSource(sourceName);
      }
    }
    
    console.log(`🔄 Updated default interval: ${intervalMs / 1000}s`);
  }
  
  /**
   * Get the current interval for a source
   * @param {string} sourceName - Name of the source
   * @returns {number} Interval in milliseconds
   */
  getInterval(sourceName) {
    return this.intervals[sourceName] || this.defaultInterval;
  }
  
  /**
   * Check if a source is currently running
   * @param {string} sourceName - Name of the source
   * @returns {boolean} True if the source has an active timer
   */
  isRunning(sourceName) {
    return this.timers.has(sourceName);
  }
  
  /**
   * Get status of all sources
   * @returns {Object} Map of source names to their status
   */
  getStatus() {
    const status = {};
    for (const sourceName of this.sources.keys()) {
      status[sourceName] = {
        registered: true,
        running: this.isRunning(sourceName),
        interval: this.getInterval(sourceName)
      };
    }
    return status;
  }
  
  /**
   * Destroy the controller and clean up all timers
   */
  destroy() {
    this.stopAll();
    this.sources.clear();
    console.log('🔄 MultiSourceRefreshController destroyed');
  }
}
