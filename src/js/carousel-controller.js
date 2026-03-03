/**
 * CarouselController - Manages page rotation timing and state
 * @class
 * @requires Chrome/Chromium 84+ (ES6, classList, template literals)
 */
export class CarouselController {
  /**
   * Create a CarouselController instance
   * @param {Object} config - Configuration options
   * @param {number} config.interval - Page rotation interval in milliseconds (default: 30000)
   * @param {string[]} config.pages - Array of page identifiers (default: ['blog', 'changelog', 'status'])
   */
  constructor({ interval = 30000, pages = ['blog', 'changelog', 'status'] } = {}) {
    if (typeof interval !== 'number' || interval <= 0) {
      throw new TypeError(`CarouselController: interval must be a positive number, got ${interval}`);
    }
    this.interval = interval;
    this.pages = pages;
    this.currentPage = 0;      // Index of current page
    this.timer = null;          // setInterval handle
    this.onPageChange = null;   // Callback: (page: string) => void
  }
  
  /**
   * Start page rotation timer
   */
  start() {
    // Stop any existing timer to prevent memory leaks
    this.stop();
    
    this.timer = setInterval(() => {
      try {
        this.rotatePage();
      } catch (error) {
        console.error('CarouselController: rotatePage failed', error);
        this.stop(); // Stop timer to prevent repeated failures
      }
    }, this.interval);
  }
  
  /**
   * Stop page rotation timer and cleanup
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  
  /**
   * Rotate to next page in cycle
   * @private
   */
  rotatePage() {
    // Calculate next page index
    const nextIndex = (this.currentPage + 1) % this.pages.length;
    
    // Get DOM elements
    const currentPageElement = document.getElementById(`page-${this.pages[this.currentPage]}`);
    const nextPageElement = document.getElementById(`page-${this.pages[nextIndex]}`);
    
    // Null-check (defensive programming)
    if (!currentPageElement || !nextPageElement) {
      console.error('CarouselController: Page elements not found, stopping rotation');
      this.stop(); // Stop timer to prevent repeated failures
      return;
    }
    
    // Update visibility
    currentPageElement.classList.remove('active');
    nextPageElement.classList.add('active');
    
    // Update state
    this.currentPage = nextIndex;
    
    // Trigger callback for future coordination
    if (this.onPageChange) {
      this.onPageChange(this.pages[this.currentPage]);
    }
  }
}
