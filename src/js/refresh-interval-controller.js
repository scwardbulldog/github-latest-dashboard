/**
 * Refresh Interval Controller
 *
 * Manages configurable dashboard timers with:
 * - Data Refresh slider (1–60 minutes, default: 5 minutes)
 * - Page Timer slider (30–180 seconds, default: 80 seconds)
 * - Card Timer slider (8–30 seconds, default: 16 seconds)
 * - localStorage persistence across sessions
 * - Visual toast confirmation when interval changes
 * - "Last refreshed X minutes ago" indicator
 * - "Refresh Now" button for immediate fetch
 *
 * @module refresh-interval-controller
 */
export class RefreshIntervalController {
  /**
   * @param {Object} options
   * @param {Function} options.onRefresh - Callback to trigger an immediate data refresh
   * @param {Function} [options.onIntervalChange] - Callback fired when the data refresh interval changes (ms)
   * @param {Function} [options.onPageTimerChange] - Callback fired when the page timer changes (ms)
   * @param {Function} [options.onCardTimerChange] - Callback fired when the card timer changes (ms)
   */
  constructor({ onRefresh, onIntervalChange, onPageTimerChange, onCardTimerChange } = {}) {
    this.onRefresh = onRefresh || (() => {});
    this.onIntervalChange = onIntervalChange || (() => {});
    this.onPageTimerChange = onPageTimerChange || (() => {});
    this.onCardTimerChange = onCardTimerChange || (() => {});

    // Data Refresh Interval settings
    this.storageKey = 'dashboard-refresh-interval';
    this.defaultInterval = 5 * 60 * 1000;  // 5 minutes
    this.minInterval = 1 * 60 * 1000;      // 1 minute
    this.maxInterval = 60 * 60 * 1000;     // 60 minutes

    // Page Timer settings
    this.pageTimerStorageKey = 'dashboard-page-timer';
    this.defaultPageTimer = 80 * 1000;     // 80 seconds (5 items × 16s each)
    this.minPageTimer = 30 * 1000;         // 30 seconds
    this.maxPageTimer = 180 * 1000;        // 180 seconds (3 minutes)

    // Card Timer settings
    this.cardTimerStorageKey = 'dashboard-card-timer';
    this.defaultCardTimer = 16 * 1000;     // 16 seconds
    this.minCardTimer = 8 * 1000;          // 8 seconds
    this.maxCardTimer = 30 * 1000;         // 30 seconds

    this.intervalId = null;
    this._isPaused = false;
    this.lastRefreshTime = null;

    this._lastRefreshDisplayId = null;
    this._toastTimeout = null;
    this._refreshBtnTimeout = null; // timeout to re-enable the Refresh Now button

    this.currentInterval = this._loadInterval();
    this.currentPageTimer = this._loadPageTimer();
    this.currentCardTimer = this._loadCardTimer();

    // Pre-bind handlers for consistent add/removeEventListener references
    this._handleTogglePanel = this._handleTogglePanel.bind(this);
    this._handleOutsideClick = this._handleOutsideClick.bind(this);
    this._handleSliderInput = this._handleSliderInput.bind(this);
    this._handleSliderChange = this._handleSliderChange.bind(this);
    this._handlePageTimerSliderInput = this._handlePageTimerSliderInput.bind(this);
    this._handlePageTimerSliderChange = this._handlePageTimerSliderChange.bind(this);
    this._handleCardTimerSliderInput = this._handleCardTimerSliderInput.bind(this);
    this._handleCardTimerSliderChange = this._handleCardTimerSliderChange.bind(this);
    this._handleRefreshNow = this._handleRefreshNow.bind(this);
    this._handleResetDefaults = this._handleResetDefaults.bind(this);
  }

  // ============================================================================
  // Lifecycle
  // ============================================================================

  /**
   * Bind UI event handlers and initialise display values.
   * Call this once the DOM is ready.
   */
  init() {
    this._bindUI();
    this._updateSlider();
    this._updatePageTimerSlider();
    this._updateCardTimerSlider();
    this._startLastRefreshDisplay();
  }

  /**
   * Start the auto-refresh timer.
   */
  start() {
    this._isPaused = false;
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      if (!this._isPaused) {
        this.onRefresh();
      }
    }, this.currentInterval);
  }

  /**
   * Pause the auto-refresh timer (preserves paused state).
   */
  pause() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Resume the auto-refresh timer from where it left off.
   */
  resume() {
    this._isPaused = false;
    this.start();
  }

  /**
   * Destroy timers and remove event listeners.
   */
  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this._lastRefreshDisplayId) {
      clearInterval(this._lastRefreshDisplayId);
      this._lastRefreshDisplayId = null;
    }

    if (this._toastTimeout) {
      clearTimeout(this._toastTimeout);
      this._toastTimeout = null;
    }

    if (this._refreshBtnTimeout) {
      clearTimeout(this._refreshBtnTimeout);
      this._refreshBtnTimeout = null;
    }

    const toggle = document.getElementById('settingsToggle');
    const slider = document.getElementById('refreshIntervalSlider');
    const pageTimerSlider = document.getElementById('pageTimerSlider');
    const cardTimerSlider = document.getElementById('cardTimerSlider');
    const refreshNowBtn = document.getElementById('refreshNowBtn');
    const resetBtn = document.getElementById('resetDefaultsBtn');

    if (toggle) toggle.removeEventListener('click', this._handleTogglePanel);
    if (slider) {
      slider.removeEventListener('input', this._handleSliderInput);
      slider.removeEventListener('change', this._handleSliderChange);
    }
    if (pageTimerSlider) {
      pageTimerSlider.removeEventListener('input', this._handlePageTimerSliderInput);
      pageTimerSlider.removeEventListener('change', this._handlePageTimerSliderChange);
    }
    if (cardTimerSlider) {
      cardTimerSlider.removeEventListener('input', this._handleCardTimerSliderInput);
      cardTimerSlider.removeEventListener('change', this._handleCardTimerSliderChange);
    }
    if (refreshNowBtn) refreshNowBtn.removeEventListener('click', this._handleRefreshNow);
    if (resetBtn) resetBtn.removeEventListener('click', this._handleResetDefaults);

    document.removeEventListener('click', this._handleOutsideClick);
  }

  // ============================================================================
  // Public API
  // ============================================================================

  /**
   * @returns {number} Current data refresh interval in ms
   */
  getInterval() {
    return this.currentInterval;
  }

  /**
   * @returns {number} Current page timer in ms
   */
  getPageTimer() {
    return this.currentPageTimer;
  }

  /**
   * @returns {number} Current card timer in ms
   */
  getCardTimer() {
    return this.currentCardTimer;
  }

  /**
   * Change the refresh interval immediately.
   * Cancels the existing timer and starts a new one.
   * @param {number} intervalMs - New interval in ms (must be within bounds)
   */
  setRefreshInterval(intervalMs) {
    if (intervalMs < this.minInterval || intervalMs > this.maxInterval) {
      console.error(
        `RefreshIntervalController: Interval ${intervalMs}ms is outside the ` +
        `allowed range [${this.minInterval}, ${this.maxInterval}]`
      );
      return;
    }

    const wasRunning = this.intervalId !== null;

    // Stop existing timer
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.currentInterval = intervalMs;
    this._saveInterval(intervalMs);

    // Notify main.js so REFRESH_INTERVAL and the progress bar can be updated
    this.onIntervalChange(intervalMs);

    // Restart timer if it was running
    if (wasRunning && !this._isPaused) {
      this.start();
    }

    const minutes = intervalMs / 60000;
    this._showToast(`Data refresh: ${minutes === 1 ? '1 minute' : `${minutes} minutes`}`);
  }

  /**
   * Change the page timer (carousel rotation).
   * @param {number} intervalMs - New interval in ms (must be within bounds)
   */
  setPageTimer(intervalMs) {
    if (intervalMs < this.minPageTimer || intervalMs > this.maxPageTimer) {
      console.error(
        `RefreshIntervalController: Page timer ${intervalMs}ms is outside the ` +
        `allowed range [${this.minPageTimer}, ${this.maxPageTimer}]`
      );
      return;
    }

    this.currentPageTimer = intervalMs;
    this._savePageTimer(intervalMs);

    // Notify main.js to update carousel timer
    this.onPageTimerChange(intervalMs);

    const seconds = intervalMs / 1000;
    this._showToast(`Page timer: ${seconds} seconds`);
  }

  /**
   * Change the card timer (item highlighting).
   * @param {number} intervalMs - New interval in ms (must be within bounds)
   */
  setCardTimer(intervalMs) {
    if (intervalMs < this.minCardTimer || intervalMs > this.maxCardTimer) {
      console.error(
        `RefreshIntervalController: Card timer ${intervalMs}ms is outside the ` +
        `allowed range [${this.minCardTimer}, ${this.maxCardTimer}]`
      );
      return;
    }

    this.currentCardTimer = intervalMs;
    this._saveCardTimer(intervalMs);

    // Notify main.js to update item highlighter timer
    this.onCardTimerChange(intervalMs);

    const seconds = intervalMs / 1000;
    this._showToast(`Card timer: ${seconds} seconds`);
  }

  /**
   * Trigger an immediate data refresh and restart all timers.
   * Resets carousel to first page and item highlighter to first item.
   */
  refreshNow() {
    this.markRefreshed();
    this.onRefresh();
    
    // Reset carousel to first page by stopping and restarting
    if (window.carouselInstance) {
      window.carouselInstance.currentPage = 0;
      window.carouselInstance.stop();
      window.carouselInstance.start();
    }
    
    // Reset item highlighter to first item
    if (window.itemHighlighterInstance) {
      window.itemHighlighterInstance.reset();
    }
    
    this._showToast('Dashboard refreshed');

    // Restart timer from now so the next auto-refresh is a full interval away
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (!this._isPaused) {
      this.start();
    }
  }

  /**
   * Record the current time as the last successful refresh.
   * Call this from main.js after each fetchAllData() completes.
   */
  markRefreshed() {
    this.lastRefreshTime = Date.now();
    this._updateLastRefreshDisplay();
  }

  // ============================================================================
  // localStorage
  // ============================================================================

  _loadInterval() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored === null) return this.defaultInterval;

      const parsed = parseInt(stored, 10);
      if (isNaN(parsed) || parsed < this.minInterval || parsed > this.maxInterval) {
        console.warn('RefreshIntervalController: Invalid stored interval, using default');
        return this.defaultInterval;
      }
      return parsed;
    } catch (error) {
      console.warn('RefreshIntervalController: localStorage unavailable, using default', error);
      return this.defaultInterval;
    }
  }

  _saveInterval(intervalMs) {
    try {
      localStorage.setItem(this.storageKey, intervalMs.toString());
    } catch (error) {
      console.error('RefreshIntervalController: Failed to persist interval', error);
    }
  }

  _loadPageTimer() {
    try {
      const stored = localStorage.getItem(this.pageTimerStorageKey);
      if (stored === null) return this.defaultPageTimer;

      const parsed = parseInt(stored, 10);
      if (isNaN(parsed) || parsed < this.minPageTimer || parsed > this.maxPageTimer) {
        console.warn('RefreshIntervalController: Invalid stored page timer, using default');
        return this.defaultPageTimer;
      }
      return parsed;
    } catch (error) {
      console.warn('RefreshIntervalController: localStorage unavailable, using default', error);
      return this.defaultPageTimer;
    }
  }

  _savePageTimer(intervalMs) {
    try {
      localStorage.setItem(this.pageTimerStorageKey, intervalMs.toString());
    } catch (error) {
      console.error('RefreshIntervalController: Failed to persist page timer', error);
    }
  }

  _loadCardTimer() {
    try {
      const stored = localStorage.getItem(this.cardTimerStorageKey);
      if (stored === null) return this.defaultCardTimer;

      const parsed = parseInt(stored, 10);
      if (isNaN(parsed) || parsed < this.minCardTimer || parsed > this.maxCardTimer) {
        console.warn('RefreshIntervalController: Invalid stored card timer, using default');
        return this.defaultCardTimer;
      }
      return parsed;
    } catch (error) {
      console.warn('RefreshIntervalController: localStorage unavailable, using default', error);
      return this.defaultCardTimer;
    }
  }

  _saveCardTimer(intervalMs) {
    try {
      localStorage.setItem(this.cardTimerStorageKey, intervalMs.toString());
    } catch (error) {
      console.error('RefreshIntervalController: Failed to persist card timer', error);
    }
  }

  // ============================================================================
  // UI Binding
  // ============================================================================

  _bindUI() {
    const toggle = document.getElementById('settingsToggle');
    const slider = document.getElementById('refreshIntervalSlider');
    const pageTimerSlider = document.getElementById('pageTimerSlider');
    const cardTimerSlider = document.getElementById('cardTimerSlider');
    const refreshNowBtn = document.getElementById('refreshNowBtn');
    const resetBtn = document.getElementById('resetDefaultsBtn');

    if (toggle) toggle.addEventListener('click', this._handleTogglePanel);

    if (slider) {
      // input → update label while dragging
      slider.addEventListener('input', this._handleSliderInput);
      // change → apply interval when drag ends
      slider.addEventListener('change', this._handleSliderChange);
    }

    if (pageTimerSlider) {
      pageTimerSlider.addEventListener('input', this._handlePageTimerSliderInput);
      pageTimerSlider.addEventListener('change', this._handlePageTimerSliderChange);
    }

    if (cardTimerSlider) {
      cardTimerSlider.addEventListener('input', this._handleCardTimerSliderInput);
      cardTimerSlider.addEventListener('change', this._handleCardTimerSliderChange);
    }

    if (refreshNowBtn) refreshNowBtn.addEventListener('click', this._handleRefreshNow);
    if (resetBtn) resetBtn.addEventListener('click', this._handleResetDefaults);

    // Close panel when clicking anywhere outside it
    document.addEventListener('click', this._handleOutsideClick);
  }

  _handleTogglePanel(event) {
    event.stopPropagation();
    const panel = document.getElementById('settingsPanel');
    if (!panel) return;

    panel.hidden = !panel.hidden;

    if (!panel.hidden) {
      // Refresh display values every time panel opens
      this._updateSlider();
      this._updatePageTimerSlider();
      this._updateCardTimerSlider();
      this._updateLastRefreshDisplay();
    }
  }

  _handleOutsideClick(event) {
    const panel = document.getElementById('settingsPanel');
    const toggle = document.getElementById('settingsToggle');

    if (!panel || panel.hidden) return;
    if (panel.contains(event.target) || (toggle && toggle.contains(event.target))) return;

    panel.hidden = true;
  }

  _handleSliderInput(event) {
    // Live label update while dragging
    this._updateIntervalValueDisplay(parseInt(event.target.value, 10));
  }

  _handleSliderChange(event) {
    // Apply interval when drag ends (FR-3: apply immediately)
    this.setRefreshInterval(parseInt(event.target.value, 10));
  }

  _handlePageTimerSliderInput(event) {
    // Live label update while dragging
    this._updatePageTimerValueDisplay(parseInt(event.target.value, 10));
  }

  _handlePageTimerSliderChange(event) {
    // Apply timer when drag ends
    this.setPageTimer(parseInt(event.target.value, 10));
  }

  _handleCardTimerSliderInput(event) {
    // Live label update while dragging
    this._updateCardTimerValueDisplay(parseInt(event.target.value, 10));
  }

  _handleCardTimerSliderChange(event) {
    // Apply timer when drag ends
    this.setCardTimer(parseInt(event.target.value, 10));
  }

  _handleRefreshNow() {
    this.refreshNow();

    // Brief spinner state on the button — ID stored for cleanup in destroy()
    const btn = document.getElementById('refreshNowBtn');
    if (btn) {
      btn.classList.add('refreshing');
      btn.disabled = true;
      if (this._refreshBtnTimeout) clearTimeout(this._refreshBtnTimeout);
      this._refreshBtnTimeout = setTimeout(() => {
        this._refreshBtnTimeout = null;
        btn.classList.remove('refreshing');
        btn.disabled = false;
      }, 2000);
    }
  }

  _handleResetDefaults() {
    // FR-16: Confirmation before resetting all settings
    if (!confirm('Reset all settings to defaults? This cannot be undone.')) {
      return;
    }
    // Reset all timers to defaults
    this.setRefreshInterval(this.defaultInterval);
    this.setPageTimer(this.defaultPageTimer);
    this.setCardTimer(this.defaultCardTimer);
    this._updateSlider();
    this._updatePageTimerSlider();
    this._updateCardTimerSlider();
    this._showToast('All timers reset to defaults');
  }

  // ============================================================================
  // Display Helpers
  // ============================================================================

  _updateSlider() {
    const slider = document.getElementById('refreshIntervalSlider');
    if (slider) slider.value = this.currentInterval;
    this._updateIntervalValueDisplay(this.currentInterval);
  }

  _updatePageTimerSlider() {
    const slider = document.getElementById('pageTimerSlider');
    if (slider) slider.value = this.currentPageTimer;
    this._updatePageTimerValueDisplay(this.currentPageTimer);
  }

  _updateCardTimerSlider() {
    const slider = document.getElementById('cardTimerSlider');
    if (slider) slider.value = this.currentCardTimer;
    this._updateCardTimerValueDisplay(this.currentCardTimer);
  }

  _updateIntervalValueDisplay(intervalMs) {
    const label = document.getElementById('intervalValueLabel');
    if (!label) return;
    const minutes = intervalMs / 60000;
    label.textContent = minutes === 1 ? '1 minute' : `${minutes} minutes`;
  }

  _updatePageTimerValueDisplay(intervalMs) {
    const label = document.getElementById('pageTimerValueLabel');
    if (!label) return;
    const seconds = intervalMs / 1000;
    label.textContent = seconds === 1 ? '1 second' : `${seconds} seconds`;
  }

  _updateCardTimerValueDisplay(intervalMs) {
    const label = document.getElementById('cardTimerValueLabel');
    if (!label) return;
    const seconds = intervalMs / 1000;
    label.textContent = seconds === 1 ? '1 second' : `${seconds} seconds`;
  }

  _showToast(message) {
    const toast = document.getElementById('refreshToast');
    if (!toast) return;

    toast.textContent = message;
    toast.hidden = false;

    // Force reflow so the transition replays even if called twice quickly
    // eslint-disable-next-line no-unused-expressions
    toast.offsetWidth;
    toast.classList.add('visible');

    if (this._toastTimeout) clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => { toast.hidden = true; }, 300);
    }, 3000);
  }

  _startLastRefreshDisplay() {
    // Update the "last refreshed" label every 30 seconds
    this._lastRefreshDisplayId = setInterval(() => {
      this._updateLastRefreshDisplay();
    }, 30000);
  }

  _updateLastRefreshDisplay() {
    const el = document.getElementById('lastRefreshTime');
    if (!el) return;

    if (!this.lastRefreshTime) {
      el.textContent = 'Just now';
      return;
    }

    const minutesAgo = Math.floor((Date.now() - this.lastRefreshTime) / 60000);
    if (minutesAgo < 1) {
      el.textContent = 'Just now';
    } else if (minutesAgo === 1) {
      el.textContent = '1 minute ago';
    } else {
      el.textContent = `${minutesAgo} minutes ago`;
    }
  }
}
