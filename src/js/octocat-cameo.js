/**
 * OctocatCameo - Easter egg: Mona walks across the bottom of the screen
 * 
 * Appears every 30 minutes as a delightful surprise for regular viewers.
 * Non-intrusive: walks across bottom edge without blocking content.
 * 
 * @module octocat-cameo
 */

/**
 * Inline SVG representation of Mona (GitHub's modern Octocat mascot)
 * Simplified silhouette for performance on Raspberry Pi 3B
 * Using design tokens for colors where possible
 */
const MONA_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <!-- Mona body -->
  <ellipse cx="50" cy="60" rx="28" ry="25" fill="#f0f6fc"/>
  <!-- Mona head -->
  <circle cx="50" cy="32" r="22" fill="#f0f6fc"/>
  <!-- Left ear -->
  <path d="M32 18 L28 5 L38 15 Z" fill="#f0f6fc"/>
  <!-- Right ear -->
  <path d="M68 18 L72 5 L62 15 Z" fill="#f0f6fc"/>
  <!-- Left eye -->
  <ellipse cx="42" cy="30" rx="5" ry="6" fill="#0d1117"/>
  <!-- Right eye -->
  <ellipse cx="58" cy="30" rx="5" ry="6" fill="#0d1117"/>
  <!-- Nose -->
  <ellipse cx="50" cy="38" rx="3" ry="2" fill="#f97583"/>
  <!-- Mouth smile -->
  <path d="M44 43 Q50 48 56 43" stroke="#0d1117" stroke-width="1.5" fill="none"/>
  <!-- Left tentacle -->
  <ellipse cx="26" cy="72" rx="6" ry="12" fill="#f0f6fc"/>
  <!-- Right tentacle -->
  <ellipse cx="74" cy="72" rx="6" ry="12" fill="#f0f6fc"/>
  <!-- Front left tentacle -->
  <ellipse cx="38" cy="78" rx="5" ry="10" fill="#f0f6fc"/>
  <!-- Front right tentacle -->
  <ellipse cx="62" cy="78" rx="5" ry="10" fill="#f0f6fc"/>
  <!-- Heart accessory (Mona Lovelace signature) -->
  <path d="M45 52 C43 48, 38 50, 40 55 L50 65 L60 55 C62 50, 57 48, 55 52 L50 58 L45 52 Z" fill="#f97583"/>
</svg>
`;

/**
 * Buffer time (ms) added after animation to ensure clean removal
 * Accounts for any browser rendering delays
 * @constant {number}
 */
const CLEANUP_BUFFER_MS = 500;

/**
 * OctocatCameo class manages the Easter egg animation
 * @class
 */
export class OctocatCameo {
  /**
   * Create an OctocatCameo instance
   * @param {Object} config - Configuration options
   * @param {number} config.interval - Time between appearances in ms (default: 30 minutes)
   * @param {number} config.duration - Walk animation duration in ms (default: 18 seconds)
   */
  constructor({ interval = 30 * 60 * 1000, duration = 18000 } = {}) {
    this.interval = interval;       // 30 minutes default
    this.duration = duration;       // 18 seconds walk duration
    this.intervalId = null;         // Timer handle
    this.isAnimating = false;       // Animation state flag
    this.currentElement = null;     // Currently animating element
    this.animationTimeoutId = null; // Cleanup timeout handle
  }

  /**
   * Start the Easter egg timer
   * Schedules Mona to appear every 30 minutes
   */
  start() {
    // Clear any existing timer
    this.stop();
    
    // Schedule recurring appearances
    this.intervalId = setInterval(() => this.triggerWalk(), this.interval);
    
    console.log(`🐙 OctocatCameo: Started (appears every ${this.interval / 60000} minutes)`);
  }

  /**
   * Stop the Easter egg timer and cleanup
   * Prevents memory leaks for 24/7 kiosk operation
   */
  stop() {
    // Clear interval timer
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    // Clear animation cleanup timeout
    if (this.animationTimeoutId) {
      clearTimeout(this.animationTimeoutId);
      this.animationTimeoutId = null;
    }
    
    // Remove any active animation element
    if (this.currentElement && this.currentElement.parentNode) {
      this.currentElement.remove();
      this.currentElement = null;
    }
    
    this.isAnimating = false;
  }

  /**
   * Trigger Mona to walk across the screen
   * Creates element, adds to DOM, and removes after animation completes
   */
  triggerWalk() {
    // Prevent overlapping animations
    if (this.isAnimating) {
      console.log('🐙 OctocatCameo: Animation already in progress, skipping');
      return;
    }

    this.isAnimating = true;
    console.log('🐙 OctocatCameo: Mona is walking across the screen!');

    // Create the Mona element
    const mona = document.createElement('div');
    mona.className = 'mona-cameo';
    // Safe: MONA_SVG is a constant defined in this module (not user input)
    mona.innerHTML = MONA_SVG;
    mona.setAttribute('aria-hidden', 'true'); // Accessibility: decorative element
    
    // Set animation duration via CSS custom property
    mona.style.setProperty('--mona-duration', `${this.duration}ms`);
    
    // Add to DOM
    document.body.appendChild(mona);
    this.currentElement = mona;

    // Schedule cleanup after animation completes with buffer for rendering
    this.animationTimeoutId = setTimeout(() => {
      if (mona.parentNode) {
        mona.remove();
      }
      this.currentElement = null;
      this.isAnimating = false;
      console.log('🐙 OctocatCameo: Mona has exited the screen');
    }, this.duration + CLEANUP_BUFFER_MS);
  }

  /**
   * Manually trigger a walk (for testing/demo purposes)
   */
  demo() {
    console.log('🐙 OctocatCameo: Demo mode - triggering walk now');
    this.triggerWalk();
  }
}
