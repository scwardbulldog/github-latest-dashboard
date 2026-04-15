/**
 * KeyboardNavigationController - Manages keyboard-based navigation for the dashboard
 * 
 * Features:
 * - Arrow Up/Down: Navigate between items on the current page
 * - Arrow Left/Right: Navigate between pages
 * - Auto-resume: Returns to automatic rotation after a period of inactivity
 * 
 * @class
 * @requires Chrome/Chromium 84+ (ES6, classList, template literals)
 */

// Default auto-resume delay: 60 seconds (60000ms)
// This gives users enough time to read content while paused via keyboard navigation,
// but not so long that the dashboard stays paused indefinitely if left unattended.
// The TV display use case benefits from automatic recovery to continue cycling content.
const DEFAULT_AUTO_RESUME_DELAY = 60000;

export class KeyboardNavigationController {
  /**
   * Create a KeyboardNavigationController instance
   * @param {Object} config - Configuration options
   * @param {number} config.autoResumeDelay - Time in ms before auto-resuming (default: 60000 = 60s)
   * @param {CarouselController} config.carouselController - Reference to carousel controller
   * @param {ItemHighlighter} config.itemHighlighter - Reference to item highlighter
   * @param {Function} config.onPause - Callback to pause the dashboard
   * @param {Function} config.onResume - Callback to resume the dashboard
   * @param {Function} config.getIsPaused - Function that returns current pause state
   * @param {Function} config.onItemNavigate - Callback when item navigation occurs (for QR update)
   * @param {string[]} config.disabledPages - Array of page names where item navigation is disabled
   */
  constructor({
    autoResumeDelay = DEFAULT_AUTO_RESUME_DELAY,
    carouselController = null,
    itemHighlighter = null,
    onPause = null,
    onResume = null,
    getIsPaused = null,
    onItemNavigate = null,
    disabledPages = []
  } = {}) {
    this.autoResumeDelay = autoResumeDelay;
    this.carouselController = carouselController;
    this.itemHighlighter = itemHighlighter;
    this.onPause = onPause;
    this.onResume = onResume;
    this.getIsPaused = getIsPaused;
    this.onItemNavigate = onItemNavigate;
    this.disabledPages = disabledPages;
    
    // Auto-resume timer
    this.autoResumeTimer = null;
    
    // Track if we auto-paused (vs user manually paused)
    this.autoPausedByNavigation = false;
    
    // Bound handler for cleanup
    this.keydownHandler = null;
  }
  
  /**
   * Start listening for keyboard navigation events
   */
  start() {
    // Stop any existing listeners first
    this.stop();
    
    this.keydownHandler = (event) => this.handleKeydown(event);
    window.addEventListener('keydown', this.keydownHandler);
    
    console.log('KeyboardNavigationController: Started listening for arrow key navigation');
  }
  
  /**
   * Stop listening for keyboard events and cleanup timers
   */
  stop() {
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
    
    this.clearAutoResumeTimer();
    console.log('KeyboardNavigationController: Stopped');
  }
  
  /**
   * Handle keydown events for arrow key navigation
   * @param {KeyboardEvent} event
   * @private
   */
  handleKeydown(event) {
    // Ignore if user is typing in an input field
    if (event.target.tagName === 'INPUT' || 
        event.target.tagName === 'TEXTAREA' ||
        event.target.contentEditable === 'true') {
      return;
    }
    
    // Check for arrow keys
    switch (event.code) {
      case 'ArrowUp':
        event.preventDefault();
        this.navigateItem(-1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.navigateItem(1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.navigatePage(-1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.navigatePage(1);
        break;
      default:
        return; // Not an arrow key, don't process
    }
    
    // Reset auto-resume timer on any navigation
    this.resetAutoResumeTimer();
  }
  
  /**
   * Navigate to next/previous item on the current page
   * @param {number} direction - 1 for next, -1 for previous
   * @private
   */
  navigateItem(direction) {
    if (!this.itemHighlighter) {
      console.warn('KeyboardNavigationController: No itemHighlighter configured');
      return;
    }
    
    // Check if item navigation is disabled for current page
    if (this.isItemNavigationDisabled()) {
      console.log('KeyboardNavigationController: Item navigation disabled for current page');
      return;
    }
    
    // Pause dashboard if not already paused
    this.ensurePaused();
    
    // Navigate to the target item
    this.itemHighlighter.goToItem(direction);
    
    // Trigger callback to update QR code with new item
    if (this.onItemNavigate) {
      this.onItemNavigate();
    }
    
    console.log(`KeyboardNavigationController: Navigated item ${direction > 0 ? 'down' : 'up'}`);
  }
  
  /**
   * Check if item navigation is disabled for the current page
   * @returns {boolean} True if item navigation should be skipped
   * @private
   */
  isItemNavigationDisabled() {
    if (!this.carouselController || this.disabledPages.length === 0) {
      return false;
    }
    
    const currentPageName = this.carouselController.pages[this.carouselController.currentPage];
    return this.disabledPages.includes(currentPageName);
  }
  
  /**
   * Navigate to next/previous page
   * @param {number} direction - 1 for next, -1 for previous
   * @private
   */
  navigatePage(direction) {
    if (!this.carouselController) {
      console.warn('KeyboardNavigationController: No carouselController configured');
      return;
    }
    
    // Pause dashboard if not already paused
    this.ensurePaused();
    
    // Navigate to the target page
    this.carouselController.goToPageByDirection(direction);
    
    console.log(`KeyboardNavigationController: Navigated page ${direction > 0 ? 'right' : 'left'}`);
  }
  
  /**
   * Ensure dashboard is paused for manual navigation
   * @private
   */
  ensurePaused() {
    const isPaused = this.getIsPaused ? this.getIsPaused() : false;
    
    if (!isPaused && this.onPause) {
      this.autoPausedByNavigation = true;
      this.onPause();
      console.log('KeyboardNavigationController: Auto-paused for keyboard navigation');
    }
  }
  
  /**
   * Reset the auto-resume timer
   * Called after each navigation action to extend the idle period
   * @private
   */
  resetAutoResumeTimer() {
    this.clearAutoResumeTimer();
    
    // Only set auto-resume if we auto-paused (not if user manually paused)
    if (this.autoPausedByNavigation) {
      this.autoResumeTimer = setTimeout(() => {
        this.autoResume();
      }, this.autoResumeDelay);
      
      console.log(`KeyboardNavigationController: Auto-resume scheduled in ${this.autoResumeDelay / 1000}s`);
    }
  }
  
  /**
   * Clear the auto-resume timer
   * @private
   */
  clearAutoResumeTimer() {
    if (this.autoResumeTimer) {
      clearTimeout(this.autoResumeTimer);
      this.autoResumeTimer = null;
    }
  }
  
  /**
   * Auto-resume the dashboard after inactivity
   * @private
   */
  autoResume() {
    if (this.autoPausedByNavigation && this.onResume) {
      this.autoPausedByNavigation = false;
      this.onResume();
      console.log('KeyboardNavigationController: Auto-resumed after inactivity');
    }
    
    this.clearAutoResumeTimer();
  }
  
  /**
   * Called when user manually resumes the dashboard
   * Resets the auto-pause tracking state
   */
  onManualResume() {
    this.autoPausedByNavigation = false;
    this.clearAutoResumeTimer();
  }
  
  /**
   * Update the auto-resume delay
   * @param {number} delay - New delay in milliseconds
   */
  setAutoResumeDelay(delay) {
    if (typeof delay !== 'number' || delay <= 0) {
      console.warn(`KeyboardNavigationController: autoResumeDelay must be positive, got ${delay}`);
      return;
    }
    this.autoResumeDelay = delay;
  }
}
