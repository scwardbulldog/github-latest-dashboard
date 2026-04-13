/**
 * SettingsManager - Unified localStorage settings persistence
 *
 * Stores all user preferences under a single 'github-dashboard-settings' key.
 * Provides graceful fallback to defaults when localStorage is unavailable or corrupted.
 * Supports schema versioning for future migrations.
 *
 * Storage Schema (v1):
 * {
 *   "version": 1,
 *   "theme": "dark",
 *   "refreshInterval": 300000,
 *   "lastCarouselPage": "blog",
 *   "githubStreak": { "lastIncidentDate": null, "currentStreak": 0, "lastChecked": null },
 *   "claudeStreak": { "lastDisruptionDate": null, "currentStreak": 0, "lastChecked": null }
 * }
 */

const STORAGE_KEY = 'github-dashboard-settings';
const SCHEMA_VERSION = 1;

const DEFAULTS = Object.freeze({
  version: SCHEMA_VERSION,
  theme: 'dark',
  refreshInterval: 300000, // 5 minutes in milliseconds
  lastCarouselPage: null,  // null = use first page from config
  githubStreak: Object.freeze({
    lastIncidentDate: null,
    currentStreak: 0,
    lastChecked: null,
    lastMilestone: 0
  }),
  claudeStreak: Object.freeze({
    lastDisruptionDate: null,
    currentStreak: 0,
    lastChecked: null,
    componentId: null
  })
});

export class SettingsManager {
  constructor() {
    this._storageAvailable = this._checkStorageAvailable();
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Load all settings from localStorage, merging with defaults.
   * Falls back to defaults on any error (unavailability, corruption, version mismatch).
   * @returns {Object} Complete settings object
   */
  loadSettings() {
    if (!this._storageAvailable) {
      console.info('SettingsManager: localStorage unavailable, using defaults');
      return this._cloneDefaults();
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        console.info('SettingsManager: No stored settings found, using defaults');
        return this._cloneDefaults();
      }

      const parsed = JSON.parse(raw);

      if (!parsed || typeof parsed !== 'object') {
        console.warn('SettingsManager: Corrupted settings (not an object), using defaults');
        return this._cloneDefaults();
      }

      // Version migration
      if (parsed.version !== SCHEMA_VERSION) {
        console.warn(`SettingsManager: Version mismatch (stored=${parsed.version}, current=${SCHEMA_VERSION}), migrating`);
        return this._migrateSettings(parsed);
      }

      // Deep-merge stored values on top of defaults to pick up any newly added fields
      return this._deepMerge(this._cloneDefaults(), parsed);

    } catch (error) {
      console.error('SettingsManager: Failed to load settings, using defaults', error);
      return this._cloneDefaults();
    }
  }

  /**
   * Save a partial or full settings object to localStorage.
   * Merges with the current stored settings so no field is accidentally lost.
   * @param {Object} settings - Settings fields to save (partial or full)
   */
  saveSettings(settings) {
    if (!this._storageAvailable) return;

    try {
      const current = this.loadSettings();
      const updated = this._deepMerge(current, settings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('SettingsManager: Failed to save settings', error);
      this._handleStorageError(error);
    }
  }

  /**
   * Read a specific setting by key (supports dot notation).
   * @param {string} key - Setting path, e.g. 'theme' or 'githubStreak.currentStreak'
   * @returns {*} Setting value, or undefined if not found
   */
  getSetting(key) {
    const settings = this.loadSettings();
    return this._getNestedValue(settings, key);
  }

  /**
   * Write a specific setting by key (supports dot notation).
   * Other settings are preserved.
   * @param {string} key - Setting path, e.g. 'lastCarouselPage'
   * @param {*} value - New value
   */
  setSetting(key, value) {
    if (!this._storageAvailable) return;

    try {
      const settings = this.loadSettings();
      this._setNestedValue(settings, key, value);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('SettingsManager: Failed to set setting', key, error);
    }
  }

  /**
   * Clear all stored settings and revert to defaults.
   * Also removes the legacy 'dashboard-theme' key used by the ThemeToggle module.
   * @returns {boolean} True if successful
   */
  resetToDefaults() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      // Also clear the legacy standalone theme key for a complete reset
      localStorage.removeItem('dashboard-theme');
      console.info('SettingsManager: Settings reset to defaults');
      return true;
    } catch (error) {
      console.error('SettingsManager: Failed to reset settings', error);
      return false;
    }
  }

  /**
   * Export current settings as a pretty-printed JSON string.
   * @returns {string} JSON representation of all settings
   */
  exportSettings() {
    return JSON.stringify(this.loadSettings(), null, 2);
  }

  /**
   * Import settings from a JSON string.
   * Validates the structure before writing.
   * @param {string} json - JSON string produced by exportSettings()
   * @returns {boolean} True if import succeeded
   */
  importSettings(json) {
    try {
      const parsed = JSON.parse(json);

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Import failed: not a JSON object');
      }
      if (typeof parsed.version !== 'number') {
        throw new Error('Import failed: missing version field');
      }

      this.saveSettings(parsed);
      console.info('SettingsManager: Settings imported successfully');
      return true;

    } catch (error) {
      console.error('SettingsManager: Failed to import settings', error);
      return false;
    }
  }

  /**
   * Whether localStorage is accessible in the current environment.
   * @returns {boolean}
   */
  isStorageAvailable() {
    return this._storageAvailable;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Test localStorage write/read/delete to confirm it is available.
   * @returns {boolean}
   * @private
   */
  _checkStorageAvailable() {
    try {
      const probe = '__sm_probe__';
      localStorage.setItem(probe, probe);
      localStorage.removeItem(probe);
      return true;
    } catch (_e) {
      return false;
    }
  }

  /**
   * Return a mutable deep clone of the default settings.
   * @returns {Object}
   * @private
   */
  _cloneDefaults() {
    return JSON.parse(JSON.stringify(DEFAULTS));
  }

  /**
   * Migrate settings from an older schema version.
   * Merges whatever valid fields exist with the current defaults.
   * @param {Object} old - Stored settings with an old version number
   * @returns {Object} Migrated settings at current version
   * @private
   */
  _migrateSettings(old) {
    console.info(`SettingsManager: Migrating settings from v${old.version} to v${SCHEMA_VERSION}`);
    const migrated = this._deepMerge(this._cloneDefaults(), old);
    migrated.version = SCHEMA_VERSION;
    // Persist the migrated settings immediately
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    } catch (_e) {
      // Non-critical: will retry on next save
    }
    return migrated;
  }

  /**
   * Deep-merge source into target.
   * Arrays in source replace arrays in target (no array merging).
   * @param {Object} target
   * @param {Object} source
   * @returns {Object} Merged copy
   * @private
   */
  _deepMerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      const srcVal = source[key];
      const tgtVal = target[key];
      if (
        srcVal !== null &&
        typeof srcVal === 'object' &&
        !Array.isArray(srcVal) &&
        tgtVal !== null &&
        typeof tgtVal === 'object' &&
        !Array.isArray(tgtVal)
      ) {
        result[key] = this._deepMerge(tgtVal, srcVal);
      } else if (srcVal !== undefined) {
        result[key] = srcVal;
      }
    }
    return result;
  }

  /**
   * Read a value from a nested object using dot notation.
   * Uses explicit null checks for Chromium 84 compatibility (no optional chaining).
   * @param {Object} obj
   * @param {string} key - Dot-separated path
   * @returns {*}
   * @private
   */
  _getNestedValue(obj, key) {
    return key.split('.').reduce((cur, k) => (cur != null ? cur[k] : undefined), obj);
  }

  /**
   * Write a value into a nested object using dot notation.
   * Missing intermediate objects are created automatically.
   * @param {Object} obj
   * @param {string} key - Dot-separated path
   * @param {*} value
   * @private
   */
  _setNestedValue(obj, key, value) {
    const keys = key.split('.');
    const last = keys.pop();
    let cursor = obj;
    for (const k of keys) {
      if (typeof cursor[k] !== 'object' || cursor[k] === null) {
        cursor[k] = {};
      }
      cursor = cursor[k];
    }
    cursor[last] = value;
  }

  /**
   * Check whether settings have been previously saved to localStorage.
   * @returns {boolean} True if a stored settings entry exists, false if using defaults or storage unavailable
   */
  hasStoredSettings() {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch (_e) {
      return false;
    }
  }

  /**
   * Handle errors thrown by localStorage (e.g. QuotaExceededError).
   * @param {Error} error
   * @private
   */
  _handleStorageError(error) {
    if (error && error.name === 'QuotaExceededError') {
      console.error('SettingsManager: localStorage quota exceeded');
      // The schema is tiny (~1 KB), so this is unexpected.
      // No automatic data removal to avoid destroying the user's preferences.
    }
  }
}
