/**
 * Refresh Interval Controller
 *
 * Manages configurable data refresh intervals with:
 * - Slider UI in settings panel (accessible via gear icon in header)
 * - localStorage persistence across sessions
 * - Visual toast confirmation when interval changes
 * - "Last refreshed X minutes ago" indicator
 * - "Refresh Now" button for immediate fetch
 *
 * Configurable range: 1 – 60 minutes (default: 5 minutes)
 * Does NOT affect carousel rotation (stays 30 s).
 *
 * @module refresh-interval-controller
 */
export class RefreshIntervalController {
  /**
   * @param {Object} options
   * @param {Function} options.onRefresh - Callback to trigger an immediate data refresh
   * @param {Function} [options.onIntervalChange] - Callback fired when the interval changes (ms)
   */
  constructor({ onRefresh, onIntervalChange } = {}) {
    this.onRefresh = onRefresh || (() => {});
    this.onIntervalChange = onIntervalChange || (() => {});

    this.storageKey = 'dashboard-refresh-interval';
    this.defaultInterval = 5 * 60 * 1000;  // 5 minutes
    this.minInterval = 1 * 60 * 1000;      // 1 minute
    this.maxInterval = 60 * 60 * 1000;     // 60 minutes

    this.intervalId = null;
    this._isPaused = false;
    this.lastRefreshTime = null;

    this._lastRefreshDisplayId = null;
    this._toastTimeout = null;
    this._refreshBtnTimeout = null; // timeout to re-enable the Refresh Now button

    this.currentInterval = this._loadInterval();

    // Pre-bind handlers for consistent add/removeEventListener references
    this._handleTogglePanel = this._handleTogglePanel.bind(this);
    this._handleOutsideClick = this._handleOutsideClick.bind(this);
    this._handleSliderInput = this._handleSliderInput.bind(this);
    this._handleSliderChange = this._handleSliderChange.bind(this);
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
    const refreshNowBtn = document.getElementById('refreshNowBtn');
    const resetBtn = document.getElementById('resetDefaultsBtn');

    if (toggle) toggle.removeEventListener('click', this._handleTogglePanel);
    if (slider) {
      slider.removeEventListener('input', this._handleSliderInput);
      slider.removeEventListener('change', this._handleSliderChange);
    }
    if (refreshNowBtn) refreshNowBtn.removeEventListener('click', this._handleRefreshNow);
    if (resetBtn) resetBtn.removeEventListener('click', this._handleResetDefaults);

    document.removeEventListener('click', this._handleOutsideClick);
  }

  // ============================================================================
  // Public API
  // ============================================================================

  /**
   * @returns {number} Current interval in ms
   */
  getInterval() {
    return this.currentInterval;
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
    this._showToast(`Refresh interval updated to ${minutes === 1 ? '1 minute' : `${minutes} minutes`}`);
  }

  /**
   * Trigger an immediate data refresh and restart the timer from now.
   */
  refreshNow() {
    this.markRefreshed();
    this.onRefresh();
    this._showToast('Data refresh triggered');

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

  // ============================================================================
  // UI Binding
  // ============================================================================

  _bindUI() {
    const toggle = document.getElementById('settingsToggle');
    const slider = document.getElementById('refreshIntervalSlider');
    const refreshNowBtn = document.getElementById('refreshNowBtn');
    const resetBtn = document.getElementById('resetDefaultsBtn');

    if (toggle) toggle.addEventListener('click', this._handleTogglePanel);

    if (slider) {
      // input → update label while dragging
      slider.addEventListener('input', this._handleSliderInput);
      // change → apply interval when drag ends
      slider.addEventListener('change', this._handleSliderChange);
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
    this.setRefreshInterval(this.defaultInterval);
    this._updateSlider();
  }

  // ============================================================================
  // Display Helpers
  // ============================================================================

  _updateSlider() {
    const slider = document.getElementById('refreshIntervalSlider');
    if (slider) slider.value = this.currentInterval;
    this._updateIntervalValueDisplay(this.currentInterval);
  }

  _updateIntervalValueDisplay(intervalMs) {
    const label = document.getElementById('intervalValueLabel');
    if (!label) return;
    const minutes = intervalMs / 60000;
    label.textContent = minutes === 1 ? '1 minute' : `${minutes} minutes`;
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
