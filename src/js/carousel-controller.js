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
    
    // Progress tracking properties
    this.progressBar = null;    // DOM element reference
    this.startTime = null;      // Timestamp when current page started
    this.animationFrame = null; // requestAnimationFrame handle
  }
  
  /**
   * Start page rotation timer
   */
  start() {
    // Stop any existing timer to prevent memory leaks
    this.stop();
    
    // Initialize progress bar reference
    this.initProgressBar();
    
    // Reset progress and start animation
    this.resetProgress();
    this.updateProgress();
    
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
    
    // Cancel progress animation
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
  
  /**
   * Rotate to next page in cycle with smooth transitions
   * 
   * Transition Coordination:
   * 1. Remove .active from current page → CSS fade out starts (300ms)
   * 2. Wait for fade out to complete
   * 3. Swap display properties (hide previous, show next)
   * 4. Add .active to next page → CSS fade in starts (300ms)
   * 
   * @private
   */
  rotatePage() {
    // Reset progress for new page
    this.resetProgress();
    
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
    
    // PHASE 1: Start fade out (remove .active class)
    currentPageElement.classList.remove('active');
    // CSS transition triggers: opacity: 1 → 0 over 300ms
    
    // PHASE 2: Wait for fade out, then swap display
    setTimeout(() => {
      // Hide previous page completely
      currentPageElement.style.display = 'none';
      
      // Show next page (still invisible - opacity: 0)
      nextPageElement.style.display = 'flex';
      
      // PHASE 3: Next frame, start fade in
      requestAnimationFrame(() => {
        nextPageElement.classList.add('active');
        // CSS transition triggers: opacity: 0 → 1 over 300ms
      });
    }, 300); // Match CSS transition duration
    
    // Update state
    this.currentPage = nextIndex;
    
    // Trigger callback for future coordination
    if (this.onPageChange) {
      this.onPageChange(this.pages[this.currentPage]);
    }
  }
  
  /**
   * Initialize progress bar DOM reference
   * @private
   */
  initProgressBar() {
    this.progressBar = document.getElementById('progressBar');
    if (!this.progressBar) {
      console.warn('CarouselController: Progress bar element not found');
    }
  }
  
  /**
   * Update progress bar width based on elapsed time
   * Uses requestAnimationFrame for smooth animation
   * @private
   */
  updateProgress() {
    if (!this.progressBar || !this.startTime) return;
    
    const elapsed = Date.now() - this.startTime;
    const progress = Math.min((elapsed / this.interval) * 100, 100);
    
    this.progressBar.style.width = `${progress}%`;
    
    // Continue animation loop
    this.animationFrame = requestAnimationFrame(() => this.updateProgress());
  }
  
  /**
   * Reset progress to 0%
   * @private
   */
  resetProgress() {
    this.startTime = Date.now();
    if (this.progressBar) {
      this.progressBar.style.width = '0%';
    }
  }
}
