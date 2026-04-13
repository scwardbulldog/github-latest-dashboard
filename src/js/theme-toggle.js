/**
 * Theme Toggle Module
 *
 * Manages dark/light theme switching for the dashboard with:
 * - localStorage persistence across sessions
 * - System preference auto-detection via prefers-color-scheme
 * - Accessible button with aria-label updates
 * - Smooth token-based theme switching
 */

const STORAGE_KEY = 'dashboard-theme';
const DARK = 'dark';
const LIGHT = 'light';

/**
 * Detect the user's OS/browser preferred colour scheme.
 * @returns {'dark'|'light'}
 */
function getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return LIGHT;
    }
    return DARK;
}

/**
 * Read the persisted theme from localStorage.
 * Returns null when no preference has been stored yet.
 * @returns {'dark'|'light'|null}
 */
function getStoredTheme() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === DARK || stored === LIGHT) {
            return stored;
        }
    } catch (_e) {
        // localStorage may be unavailable (e.g. private-browsing restrictions)
    }
    return null;
}

/**
 * Persist the chosen theme to localStorage.
 * @param {'dark'|'light'} theme
 */
function storeTheme(theme) {
    try {
        localStorage.setItem(STORAGE_KEY, theme);
    } catch (_e) {
        // Ignore write failures
    }
}

/**
 * Apply the given theme to the document element and update the toggle button.
 * @param {'dark'|'light'} theme
 * @param {HTMLElement} button - The toggle button element
 */
function applyTheme(theme, button) {
    if (theme === LIGHT) {
        document.documentElement.setAttribute('data-theme', LIGHT);
        if (button) {
            button.setAttribute('aria-label', 'Switch to dark mode');
            button.title = 'Switch to dark mode';
            const icon = button.querySelector('#themeToggleIcon');
            const label = button.querySelector('#themeToggleLabel');
            if (icon) icon.textContent = '🌙';
            if (label) label.textContent = 'Dark';
        }
    } else {
        document.documentElement.removeAttribute('data-theme');
        if (button) {
            button.setAttribute('aria-label', 'Switch to light mode');
            button.title = 'Switch to light mode';
            const icon = button.querySelector('#themeToggleIcon');
            const label = button.querySelector('#themeToggleLabel');
            if (icon) icon.textContent = '☀️';
            if (label) label.textContent = 'Light';
        }
    }
}

/**
 * ThemeToggle - initialise and manage theme switching.
 *
 * Usage:
 *   import { ThemeToggle } from './theme-toggle.js';
 *   const themeToggle = new ThemeToggle();
 *   themeToggle.init();
 */
export class ThemeToggle {
    constructor() {
        this._button = null;
        this._currentTheme = DARK;
        this._mediaQuery = null;
    }

    /**
     * Initialise the toggle: read preference, apply theme, bind events.
     */
    init() {
        this._button = document.getElementById('themeToggle');

        // Resolve initial theme: stored preference > system preference
        const stored = getStoredTheme();
        this._currentTheme = stored !== null ? stored : getSystemPreference();

        applyTheme(this._currentTheme, this._button);

        // Click handler
        if (this._button) {
            this._button.addEventListener('click', () => this._toggle());
        }

        // React to OS-level theme changes only when no explicit preference stored
        if (window.matchMedia) {
            this._mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
            this._mediaQuery.addEventListener('change', (e) => {
                if (getStoredTheme() === null) {
                    this._currentTheme = e.matches ? LIGHT : DARK;
                    applyTheme(this._currentTheme, this._button);
                }
            });
        }
    }

    /**
     * Toggle between dark and light themes.
     */
    _toggle() {
        this._currentTheme = this._currentTheme === DARK ? LIGHT : DARK;
        applyTheme(this._currentTheme, this._button);
        storeTheme(this._currentTheme);
    }

    /**
     * Programmatically set the theme.
     * @param {'dark'|'light'} theme
     */
    setTheme(theme) {
        if (theme !== DARK && theme !== LIGHT) return;
        this._currentTheme = theme;
        applyTheme(this._currentTheme, this._button);
        storeTheme(this._currentTheme);
    }

    /**
     * @returns {'dark'|'light'} Current active theme
     */
    getTheme() {
        return this._currentTheme;
    }
}
