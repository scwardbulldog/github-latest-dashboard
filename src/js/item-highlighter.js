/**
 * ItemHighlighter - Manages item-level highlighting and rotation
 * @class
 */
export class ItemHighlighter {
  /**
   * Create an ItemHighlighter instance
   * @param {Object} config - Configuration options
   * @param {number} config.interval - Item highlight interval in milliseconds (default: 8000)
   */
  constructor({ interval = 8000 } = {}) {
    this.interval = interval;
    this.currentItem = 0;       // Index of currently highlighted item
    this.itemCount = 0;         // Total items on current page
    this.timer = null;          // setInterval handle
    this.onItemHighlight = null; // Callback: (itemIndex: number) => void
    this.cachedItems = null;    // Cached NodeList of list items (to reduce DOM queries)
    
    // Timer accuracy tracking (for burn-in testing)
    this.lastHighlight = null;  // Timestamp of last highlight
    this.highlightCount = 0;    // Total highlights since start
    this.enableAccuracyLogging = false; // Enable via window.enableTimerLogging
    
    // Pause/resume state
    this.isPaused = false;
    this.elapsedBeforePause = 0; // Time elapsed in current interval before pause
    this.intervalStartTime = null; // When current interval started
  }
  
  /**
   * Start item highlighting timer
   * @param {number} itemCount - Number of items to rotate through
   */
  start(itemCount) {
    // CRITICAL: Must stop existing timer before starting new one (prevent memory leaks)
    this.stop();
    
    // Store item count for this page
    this.itemCount = itemCount;
    this.currentItem = 0;
    
    // Cache list items on start to reduce DOM queries (Performance optimization)
    const activePage = document.querySelector('.carousel-page.active');
    if (activePage) {
      this.cachedItems = activePage.querySelectorAll('.list-item');
      console.log(`ItemHighlighter: Cached ${this.cachedItems.length} items for highlighting`);
    } else {
      this.cachedItems = [];
      console.warn('ItemHighlighter: No active page found during start, caching empty list');
    }
    
    // Initialize timer accuracy tracking
    this.lastHighlight = Date.now();
    this.highlightCount = 0;
    
    // Check if accuracy logging is enabled globally
    if (window.enableTimerLogging) {
      this.enableAccuracyLogging = true;
      console.log('📊 Item highlighter timer accuracy logging enabled');
    }
    
    // Immediately highlight first item (don't wait 8 seconds)
    this.highlightItem(0);
    
    // Track interval start time for pause/resume
    this.intervalStartTime = Date.now();
    
    // Start interval for subsequent items
    this.timer = setInterval(() => {
      this.intervalStartTime = Date.now();
      this.highlightNext();
    }, this.interval);
  }
  
  /**
   * Stop item highlighting timer and cleanup
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    // Clear cached items to free memory
    this.cachedItems = null;
  }
  
  /**
   * Pause highlighting - freezes at current item
   */
  pause() {
    if (this.isPaused || !this.timer) return;
    this.isPaused = true;
    
    // Store elapsed time in current interval
    if (this.intervalStartTime) {
      this.elapsedBeforePause = Date.now() - this.intervalStartTime;
    }
    
    // Stop timer but preserve state (current item, count, etc.)
    clearInterval(this.timer);
    this.timer = null;
  }
  
  /**
   * Resume highlighting from paused position
   */
  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    
    // Calculate remaining time in current interval
    const remainingTime = Math.max(0, this.interval - this.elapsedBeforePause);
    
    // Use setTimeout for remaining time, then restart setInterval
    this.timer = setTimeout(() => {
      this.intervalStartTime = Date.now();
      this.highlightNext();
      
      // Resume regular interval
      this.timer = setInterval(() => {
        this.intervalStartTime = Date.now();
        this.highlightNext();
      }, this.interval);
    }, remainingTime);
  }
  
  /**
   * Reset to first item (called on page change)
   */
  reset() {
    this.stop();
    this.currentItem = 0;
    // Remove all highlighting
    this.clearAllHighlights();
  }
  
  /**
   * Navigate to next or previous item by direction
   * Used for keyboard navigation (up/down arrow keys)
   * @param {number} direction - 1 for next item, -1 for previous item
   */
  goToItem(direction) {
    // Ensure we have cached items; if not, try to refresh
    if (!this.cachedItems || this.cachedItems.length === 0) {
      const activePage = document.querySelector('.carousel-page.active');
      if (activePage) {
        this.cachedItems = activePage.querySelectorAll('.list-item');
        this.itemCount = this.cachedItems.length;
      }
    }
    
    if (!this.cachedItems || this.cachedItems.length === 0) {
      console.warn('ItemHighlighter.goToItem: No items available to navigate');
      return;
    }
    
    // Calculate target index with wrapping
    let targetIndex = this.currentItem + direction;
    
    // Wrap around: going up from first item goes to last, going down from last goes to first
    if (targetIndex < 0) {
      targetIndex = this.cachedItems.length - 1;
    } else if (targetIndex >= this.cachedItems.length) {
      targetIndex = 0;
    }
    
    // Update current item and highlight
    this.currentItem = targetIndex;
    this.highlightItem(targetIndex);
    
    console.log(`ItemHighlighter: Navigated to item ${targetIndex} (direction: ${direction})`);
  }
  
  /**
   * Refresh cached items after DOM update (called on data refresh)
   * Preserves timer state and current position
   */
  refreshCache() {
    if (!this.timer) {
      // Not currently running (stopped or paused), no need to refresh
      return;
    }
    
    const activePage = document.querySelector('.carousel-page.active');
    if (activePage) {
      this.cachedItems = activePage.querySelectorAll('.list-item');
      console.log(`ItemHighlighter: Cache refreshed with ${this.cachedItems.length} items`);
    } else {
      console.warn('ItemHighlighter: Could not refresh cache, no active page found');
    }
  }
  
  /**
   * Update highlight interval with validation
   * @param {number} interval - Interval in milliseconds
   */
  setInterval(interval) {
    if (typeof interval !== 'number' || interval <= 0) {
      console.warn(`ItemHighlighter: interval must be positive, got ${interval}`);
      return;
    }
    this.interval = interval;
  }
  
  /**
   * Move to next item in rotation
   * @private
   */
  highlightNext() {
    // Timer accuracy measurement (for burn-in testing)
    const actualTime = Date.now();
    this.highlightCount++;
    
    if (this.lastHighlight && this.enableAccuracyLogging) {
      const expectedTime = this.lastHighlight + this.interval;
      const drift = actualTime - expectedTime;
      const driftSeconds = (drift / 1000).toFixed(3);
      
      // Log timing data for analysis
      console.log(`⏱️  Item Highlight #${this.highlightCount}: drift=${driftSeconds}s (expected=${new Date(expectedTime).toISOString()}, actual=${new Date(actualTime).toISOString()})`);
      
      // Warning if drift exceeds ±0.5 second threshold
      if (Math.abs(drift) > 500) {
        console.warn(`⚠️  Item highlight drift exceeds threshold: ${driftSeconds}s (tolerance: ±0.5s)`);
      }
    }
    
    this.lastHighlight = actualTime;
    
    // Calculate next index (wraps around to 0 after last item)
    const nextIndex = (this.currentItem + 1) % this.itemCount;
    
    // Update highlighting
    this.highlightItem(nextIndex);
    
    // Update state
    this.currentItem = nextIndex;
  }
  
  /**
   * Highlight specific item by index
   * @param {number} index - Item index to highlight
   * @private
   */
  highlightItem(index) {
    // Use cached items to avoid repeated querySelectorAll() calls (eliminates ~10,800 DOM queries/day)
    if (!this.cachedItems || this.cachedItems.length === 0) {
      console.error('ItemHighlighter: No cached items found');
      return;
    }
    
    console.log(`ItemHighlighter: Found ${this.cachedItems.length} items on page, highlighting index ${index}`);
    
    // Remove previous highlight from all items
    this.cachedItems.forEach(item => item.classList.remove('list-item--highlighted'));
    
    // Add highlight to current item
    if (this.cachedItems[index]) {
      this.cachedItems[index].classList.add('list-item--highlighted');
      console.log(`✓ Item ${index} highlighted with class 'list-item--highlighted'`);
      
      // Trigger callback for DetailPanel integration (Story 3.3)
      if (this.onItemHighlight) {
        this.onItemHighlight(this.cachedItems[index], index);
      }
    }
  }
  
  /**
   * Clear all highlighting across all pages
   * @private
   */
  clearAllHighlights() {
    const items = document.querySelectorAll('.list-item');
    items.forEach(item => item.classList.remove('list-item--highlighted'));
    console.log('ItemHighlighter: All highlights cleared');
  }
}
