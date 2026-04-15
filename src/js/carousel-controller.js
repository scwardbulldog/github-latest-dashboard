/**
 * CarouselController - Manages page rotation timing and state
 * @class
 * @requires Chrome/Chromium 84+ (ES6, classList, template literals)
 */
export class CarouselController {
  /**
   * Create a CarouselController instance
   * @param {Object} config - Configuration options
   * @param {number} config.interval - Default page rotation interval in milliseconds (default: 30000)
   * @param {string[]} config.pages - Array of page identifiers (default: ['blog', 'changelog', 'status'])
   * @param {Object<string, number>} config.pageIntervals - Optional per-page interval overrides
   */
  constructor({ interval = 30000, pages = ['blog', 'changelog', 'status'], pageIntervals = {} } = {}) {
    if (typeof interval !== 'number' || interval <= 0) {
      throw new TypeError(`CarouselController: interval must be a positive number, got ${interval}`);
    }
    this.defaultInterval = interval;
    this.pageIntervals = pageIntervals;
    this.interval = interval;
    this.pages = pages;
    this.currentPage = 0;      // Index of current page
    this.timer = null;          // Timer handle (setTimeout)
    this.onPageChange = null;   // Callback: (page: string) => void
    
    // Progress tracking properties
    this.progressBar = null;    // DOM element reference (bottom bar)
    this.octocat = null;        // Octocat traveler element
    this.startTime = null;      // Timestamp when current page started
    this.animationFrame = null; // requestAnimationFrame handle
    
    // Pause/resume state
    this.isPaused = false;
    this.elapsedBeforePause = 0; // Time elapsed before pause
    
    // Timer accuracy tracking (for burn-in testing)
    this.lastRotation = null;   // Timestamp of last rotation
    this.rotationCount = 0;     // Total rotations since start
    this.enableAccuracyLogging = false; // Enable via window.enableTimerLogging
  }
  
  /**
   * Start page rotation timer
   */
  start() {
    // Stop any existing timer to prevent memory leaks
    this.stop();
    
    // Initialize progress bar reference
    this.initProgressBar();
    
    // Reset progress and start animation for current page interval
    this.applyIntervalForCurrentPage();
    this.updateProgress();
    
    // Initialize timer accuracy tracking
    this.lastRotation = Date.now();
    this.rotationCount = 0;
    
    // Check if accuracy logging is enabled globally
    if (window.enableTimerLogging) {
      this.enableAccuracyLogging = true;
      console.log('📊 Carousel timer accuracy logging enabled');
    }
    
    // Start rotation loop with page-aware timing
    this.scheduleNextRotation();
  }
  
  /**
   * Stop page rotation timer and cleanup
   */
  stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    // Cancel progress animation
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
  
  /**
   * Pause rotation - freezes at current position
   */
  pause() {
    if (this.isPaused) return;
    this.isPaused = true;
    
    // Store elapsed time before stopping
    if (this.startTime) {
      this.elapsedBeforePause = Date.now() - this.startTime;
    }
    
    // Stop timer but preserve state
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    // Stop progress animation but preserve position
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
  
  /**
   * Resume rotation from paused position
   */
  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    
    // Initialize DOM refs if needed
    this.initProgressBar();
    
    // Calculate remaining time
    const remainingTime = Math.max(0, this.interval - this.elapsedBeforePause);
    
    // Adjust startTime so progress calculation continues correctly
    this.startTime = Date.now() - this.elapsedBeforePause;
    
    // Restart progress animation
    this.updateProgress();
    
    // Schedule next rotation with remaining time
    this.timer = setTimeout(() => {
      try {
        this.rotatePage();
      } catch (error) {
        console.error('CarouselController: rotatePage failed', error);
        this.stop();
      }
    }, remainingTime);
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
    // Timer accuracy measurement (for burn-in testing)
    const actualTime = Date.now();
    this.rotationCount++;
    
    if (this.lastRotation && this.enableAccuracyLogging) {
      const expectedTime = this.lastRotation + this.interval;
      const drift = actualTime - expectedTime;
      const driftSeconds = (drift / 1000).toFixed(3);
      
      // Log timing data for analysis
      console.log(`⏱️  Carousel Rotation #${this.rotationCount}: drift=${driftSeconds}s (expected=${new Date(expectedTime).toISOString()}, actual=${new Date(actualTime).toISOString()})`);
      
      // Warning if drift exceeds ±1 second threshold
      if (Math.abs(drift) > 1000) {
        console.warn(`⚠️  Carousel drift exceeds threshold: ${driftSeconds}s (tolerance: ±1.0s)`);
      }
    }
    
    this.lastRotation = actualTime;
    
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
        
        // Trigger callback AFTER new page is active (for ItemHighlighter coordination)
        // This ensures ItemHighlighter can query .carousel-page.active and get correct page
        if (this.onPageChange) {
          this.onPageChange(this.pages[this.currentPage]);
        }
      });
    }, 300); // Match CSS transition duration
    
    // Update state
    this.currentPage = nextIndex;
    
    // Apply interval for the newly active page and schedule next rotation
    this.applyIntervalForCurrentPage();
    this.scheduleNextRotation();
  }
  
  /**
   * Initialize progress bar and octocat DOM references
   * @private
   */
  initProgressBar() {
    this.progressBar = document.getElementById('refreshProgress');
    this.octocat = document.getElementById('octocatTraveler');
    if (!this.progressBar) {
      console.warn('CarouselController: Progress bar element not found');
    }
  }
  
  /**
   * Update progress bar width and octocat position based on elapsed time
   * Uses requestAnimationFrame for smooth animation
   * @private
   */
  updateProgress() {
    if (!this.progressBar || !this.startTime) return;
    
    const elapsed = Date.now() - this.startTime;
    const progress = Math.min((elapsed / this.interval) * 100, 100);
    
    this.progressBar.style.width = `${progress}%`;
    
    // Update octocat position to match progress
    if (this.octocat) {
      this.octocat.style.left = `${progress}%`;
    }
    
    // Continue animation loop
    this.animationFrame = requestAnimationFrame(() => this.updateProgress());
  }
  
  /**
   * Reset progress and octocat to 0%
   * @private
   */
  resetProgress() {
    this.startTime = Date.now();
    if (this.progressBar) {
      this.progressBar.style.width = '0%';
    }
    if (this.octocat) {
      this.octocat.style.left = '0%';
    }
  }
  
  /**
   * Apply page-specific interval settings and reset progress tracking
   * @private
   */
  applyIntervalForCurrentPage() {
    const currentPageName = this.pages[this.currentPage];
    this.interval = this.getIntervalForPage(currentPageName);
    this.resetProgress();
  }
  
  /**
   * Get interval for a specific page, falling back to default
   * @param {string} pageName
   * @returns {number}
   * @private
   */
  getIntervalForPage(pageName) {
    const pageSpecific = this.pageIntervals[pageName];
    if (typeof pageSpecific === 'number' && pageSpecific > 0) {
      return pageSpecific;
    }
    return this.defaultInterval;
  }
  
  /**
   * Schedule the next rotation with consistent error handling
   * @private
   */
  scheduleNextRotation() {
    this.timer = setTimeout(() => {
      try {
        this.rotatePage();
      } catch (error) {
        console.error('CarouselController: rotatePage failed', error);
        this.stop(); // Stop timer to prevent repeated failures
      }
    }, this.interval);
  }

  /**
   * Jump directly to a named page without triggering the onPageChange callback.
   * Intended for restoring the last-viewed page from persisted settings.
   * Must be called before start() to take effect.
   *
   * @param {string} pageName - Page name to navigate to (must be in this.pages)
   * @returns {boolean} True if the page was found and activated, false otherwise
   */
  goToPage(pageName) {
    if (this.timer !== null) {
      console.warn('CarouselController: goToPage() called after start() – call it before starting the carousel for predictable behavior.');
    }

    const pageIndex = this.pages.indexOf(pageName);
    if (pageIndex === -1) {
      console.warn(`CarouselController: goToPage('${pageName}') – page not found in pages:`, this.pages);
      return false;
    }

    // Update all page DOM elements: hide all, then show the target
    this.pages.forEach(page => {
      const el = document.getElementById(`page-${page}`);
      if (el) {
        el.classList.remove('active');
        el.style.display = 'none';
      }
    });

    const targetEl = document.getElementById(`page-${pageName}`);
    if (targetEl) {
      targetEl.style.display = 'flex';
      // Use requestAnimationFrame so the display change settles before adding
      // the .active class, allowing CSS transitions to fire correctly.
      requestAnimationFrame(() => {
        targetEl.classList.add('active');
      });
    }

    this.currentPage = pageIndex;
    console.info(`CarouselController: Restored to page '${pageName}' (index ${pageIndex})`);
    return true;
  }
  
  /**
   * Navigate to next or previous page by direction
   * Used for keyboard navigation (left/right arrow keys)
   * Triggers onPageChange callback for proper coordination with ItemHighlighter
   * @param {number} direction - 1 for next page, -1 for previous page
   */
  goToPageByDirection(direction) {
    // Calculate target index with wrapping
    let targetIndex = this.currentPage + direction;
    
    // Wrap around: going left from first page goes to last, going right from last goes to first
    if (targetIndex < 0) {
      targetIndex = this.pages.length - 1;
    } else if (targetIndex >= this.pages.length) {
      targetIndex = 0;
    }
    
    // Get DOM elements
    const currentPageElement = document.getElementById(`page-${this.pages[this.currentPage]}`);
    const targetPageElement = document.getElementById(`page-${this.pages[targetIndex]}`);
    
    if (!currentPageElement || !targetPageElement) {
      console.error('CarouselController.goToPageByDirection: Page elements not found');
      return;
    }
    
    // Perform page transition (similar to rotatePage but without scheduling next)
    // PHASE 1: Remove active from current page
    currentPageElement.classList.remove('active');
    
    // PHASE 2: Swap display properties after fade out
    setTimeout(() => {
      currentPageElement.style.display = 'none';
      targetPageElement.style.display = 'flex';
      
      // PHASE 3: Add active to target page
      requestAnimationFrame(() => {
        targetPageElement.classList.add('active');
        
        // Trigger callback AFTER new page is active
        if (this.onPageChange) {
          this.onPageChange(this.pages[targetIndex]);
        }
      });
    }, 300);
    
    // Update state
    this.currentPage = targetIndex;
    
    // Update progress for new page (reset the progress bar)
    this.applyIntervalForCurrentPage();
    
    console.log(`CarouselController: Navigated to page '${this.pages[targetIndex]}' (direction: ${direction})`);
  }
}
