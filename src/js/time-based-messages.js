/**
 * TimeBasedMessages - Easter Egg component that displays contextual,
 * humorous messages at specific times throughout the day.
 *
 * Features:
 * - Messages appear at predetermined times (local timezone)
 * - Auto-dismisses after 4-8 seconds (configurable per message)
 * - Each message shows only once per occurrence (no repeats)
 * - Resets daily at midnight
 * - Independent of carousel and item highlighting
 *
 * @class
 * @requires Chrome/Chromium 84+ (ES6, classList, template literals)
 */
export class TimeBasedMessages {
  constructor() {
    /**
     * Hardcoded message schedule
     * Each message has: time (HH:MM), text, and duration (ms)
     * @type {Array<{time: string, text: string, duration: number}>}
     */
    this.messages = [
      { time: '16:04', text: '404: Coffee Not Found ☕', duration: 4000 },
      { time: '17:00', text: 'Git committed? Time to commit to going home 🏠', duration: 5000 },
      { time: '12:00', text: 'Merge conflict resolved: Lunch vs. Keyboard ⌨️🍔', duration: 4000 },
      { time: '09:00', text: 'Morning standup: Coffee first, code second ☕→💻', duration: 5000 },
      { time: '15:33', text: 'Half-evil time (3.33/6.66) — Debug with caution 😈', duration: 4000 },
      { time: '11:11', text: 'Make a wish... for fewer bugs 🐛✨', duration: 4000 },
      { time: '23:11', text: 'Make a wish... for fewer bugs 🐛✨', duration: 4000 }
    ];

    /**
     * Track shown messages to avoid duplicates within the same occurrence
     * @type {Set<string>}
     */
    this.shownToday = new Set();

    /**
     * Timer handle for time checking interval
     * @type {number|null}
     */
    this.checkInterval = null;

    /**
     * Timer handle for fade-out (cleanup reference)
     * @type {number|null}
     */
    this.fadeOutTimer = null;

    /**
     * Timer handle for removal (cleanup reference)
     * @type {number|null}
     */
    this.removeTimer = null;
  }

  /**
   * Start the time-based message checker
   * Checks every 60 seconds for matching times
   */
  start() {
    // Clear any existing interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check every 60 seconds (FR-17: low-frequency polling)
    this.checkInterval = setInterval(() => this.checkTime(), 60000);

    // Immediate check on start
    this.checkTime();

    console.log('TimeBasedMessages: Started time check interval');
  }

  /**
   * Check current time against message schedule
   * Shows matching message if not already shown today
   */
  checkTime() {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5); // "HH:MM" format

    // Find matching message that hasn't been shown yet
    const matchingMessage = this.messages.find(
      (msg) => msg.time === timeString && !this.shownToday.has(msg.time)
    );

    if (matchingMessage) {
      this.showMessage(matchingMessage);
      this.shownToday.add(matchingMessage.time);
    }

    // Reset shown messages at midnight (FR-20)
    if (timeString === '00:00') {
      this.shownToday.clear();
      console.log('TimeBasedMessages: Reset shown messages at midnight');
    }
  }

  /**
   * Display a message overlay with fade animation
   * @param {{time: string, text: string, duration: number}} message - Message to display
   */
  showMessage(message) {
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'time-message-overlay';
    overlay.innerHTML = `
      <div class="time-message-card">
        <p class="time-message-text">${message.text}</p>
      </div>
    `;

    // Add to DOM
    document.body.appendChild(overlay);

    // Fade in (FR-15: 0.5s fade-in)
    // Small delay to ensure CSS transition triggers
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add('visible');
      });
    });

    console.log(`TimeBasedMessages: Showing "${message.text}" for ${message.duration / 1000}s`);

    // Fade out after duration (FR-15: hold 4-8s, then 0.5s fade-out)
    this.fadeOutTimer = setTimeout(() => {
      overlay.classList.remove('visible');

      // Remove from DOM after fade-out transition completes
      this.removeTimer = setTimeout(() => {
        if (overlay.parentNode) {
          overlay.remove();
        }
      }, 500); // Match CSS transition duration
    }, message.duration);
  }

  /**
   * Stop the time checker and cleanup
   * Prevents memory leaks for 24/7 kiosk operation
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    if (this.fadeOutTimer) {
      clearTimeout(this.fadeOutTimer);
      this.fadeOutTimer = null;
    }

    if (this.removeTimer) {
      clearTimeout(this.removeTimer);
      this.removeTimer = null;
    }

    // Remove any visible overlay
    const existingOverlay = document.querySelector('.time-message-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    console.log('TimeBasedMessages: Stopped and cleaned up');
  }
}
