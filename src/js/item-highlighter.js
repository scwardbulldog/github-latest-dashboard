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
    
    // Immediately highlight first item (don't wait 8 seconds)
    this.highlightItem(0);
    
    // Start interval for subsequent items
    this.timer = setInterval(() => this.highlightNext(), this.interval);
  }
  
  /**
   * Stop item highlighting timer and cleanup
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
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
   * Move to next item in rotation
   * @private
   */
  highlightNext() {
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
    // Get active page's list items
    const activePage = document.querySelector('.carousel-page.active');
    if (!activePage) {
      console.error('ItemHighlighter: No active page found');
      return;
    }
    
    const items = activePage.querySelectorAll('.list-item');
    console.log(`ItemHighlighter: Found ${items.length} items on page, highlighting index ${index}`);
    
    if (items.length === 0) {
      console.error('ItemHighlighter: No list items found on active page');
      return;
    }
    
    // Remove previous highlight from all items
    items.forEach(item => item.classList.remove('list-item--highlighted'));
    
    // Add highlight to current item
    if (items[index]) {
      items[index].classList.add('list-item--highlighted');
      console.log(`✓ Item ${index} highlighted with class 'list-item--highlighted'`);
      
      // Trigger callback for DetailPanel integration (Story 3.3)
      if (this.onItemHighlight) {
        this.onItemHighlight(items[index], index);
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
