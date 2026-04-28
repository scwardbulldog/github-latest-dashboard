/**
 * AccessibilityController - Font size and high contrast controls
 *
 * Provides runtime adjustments for font size (Small/Medium/Large) and
 * a WCAG AAA high contrast mode.  Preferences are persisted via the
 * shared SettingsManager so they survive page reloads.
 */

export class AccessibilityController {
  /**
   * @param {import('./settings-manager.js').SettingsManager} settingsManager
   */
  constructor(settingsManager) {
    this.settingsManager = settingsManager;

    /** Available font-size scale factors keyed by preset name. */
    this.fontSizes = {
      small: 0.75,
      medium: 1.0,
      large: 1.5
    };

    /** Human-readable labels for each preset. */
    this.fontSizeLabels = {
      small: 'Small (75%)',
      medium: 'Medium (100%)',
      large: 'Large (150%)'
    };

    this.currentFontSize = 'medium';
    this.highContrastEnabled = false;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Load saved preferences from storage and apply them.
   * Call once after the DOM is ready.
   */
  initialize() {
    this.currentFontSize = this.settingsManager.getSetting('fontSize') || 'medium';
    this.highContrastEnabled = this.settingsManager.getSetting('highContrast') || false;

    this.applyFontSize(this.currentFontSize);
    this.applyHighContrast(this.highContrastEnabled);

    this.updateFontSizeUI();
    this.updateHighContrastUI();
  }

  /**
   * Set font size preset.
   * @param {string} size - 'small', 'medium', or 'large'
   */
  setFontSize(size) {
    if (!this.fontSizes[size]) {
      console.error(`AccessibilityController: Invalid font size "${size}"`);
      return;
    }

    this.currentFontSize = size;
    this.applyFontSize(size);
    this.settingsManager.setSetting('fontSize', size);
    this.updateFontSizeUI();
  }

  /**
   * Toggle high contrast mode on/off.
   */
  toggleHighContrast() {
    this.highContrastEnabled = !this.highContrastEnabled;
    this.applyHighContrast(this.highContrastEnabled);
    this.settingsManager.setSetting('highContrast', this.highContrastEnabled);
    this.updateHighContrastUI();
  }

  /**
   * Reset accessibility settings to defaults and update UI.
   */
  resetToDefaults() {
    this.currentFontSize = 'medium';
    this.highContrastEnabled = false;

    this.applyFontSize(this.currentFontSize);
    this.applyHighContrast(this.highContrastEnabled);

    this.updateFontSizeUI();
    this.updateHighContrastUI();
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Apply font-size scale via CSS custom property on the document root.
   * @param {string} size - Preset key
   */
  applyFontSize(size) {
    const scale = this.fontSizes[size] || 1.0;
    document.documentElement.style.setProperty('--font-scale', scale);
    console.info(`AccessibilityController: Font size set to ${size} (${scale * 100}%)`);
  }

  /**
   * Apply or remove the high-contrast class on the document root.
   * @param {boolean} enabled
   */
  applyHighContrast(enabled) {
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    console.info(`AccessibilityController: High contrast mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Sync the active state of font-size buttons in the settings panel.
   */
  updateFontSizeUI() {
    const buttons = document.querySelectorAll('.font-size-btn');
    buttons.forEach(btn => {
      const size = btn.dataset.size;
      btn.classList.toggle('active', size === this.currentFontSize);
      btn.setAttribute('aria-pressed', size === this.currentFontSize ? 'true' : 'false');
    });

    const label = document.getElementById('font-size-label');
    if (label) {
      label.textContent = this.fontSizeLabels[this.currentFontSize] || 'Medium (100%)';
    }
  }

  /**
   * Sync the high-contrast toggle checkbox in the settings panel.
   */
  updateHighContrastUI() {
    const toggle = document.getElementById('high-contrast-toggle');
    if (toggle) {
      toggle.checked = this.highContrastEnabled;
    }
  }
}
