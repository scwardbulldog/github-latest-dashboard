/**
 * Claude Uptime Streak Counter
 * Displays consecutive days since last major/critical Claude service incident
 * Uses Anthropic Status API at status.claude.com
 * @module claude-streak-counter
 */

// Time constants
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Anthropic Status API endpoint for all incidents (includes historical)
const CLAUDE_STATUS_API = 'https://status.claude.com/api/v2/incidents.json';

/**
 * ClaudeStreakCounter class manages the uptime streak badge for Claude services
 * Shows days since last major/critical incident with localStorage persistence
 */
export class ClaudeStreakCounter {
  /**
   * Initialize streak counter
   */
  constructor() {
    this.storageKey = 'claude-uptime-streak';
    this.badgeElement = null;
    this.intervalId = null;
    this.midnightTimeoutId = null;
    this.pollIntervalId = null;
    this.currentStreak = 0;
    this.lastIncidentDate = null;
    this.lastMilestone = 0;
    this.milestones = [30, 60, 90, 365];
    this.isOperational = true; // Track current operational status
  }

  /**
   * Initialize the streak counter
   * Starts by checking Anthropic Status API then calculating streak
   */
  async initialize() {
    // Load persisted data first
    this.loadFromStorage();
    
    // Check current status via API
    await this.checkStatus();
    
    // Calculate streak based on stored/updated incident data
    this.calculateStreak();
    
    // Render the badge
    this.render();
    
    // Start daily update scheduler
    this.startDailyUpdate();
    
    // Start periodic status polling (every 5 minutes)
    this.startPolling();
    
    console.log(`ClaudeStreakCounter: Initialized with ${this.currentStreak} days streak`);
  }

  /**
   * Check Claude service status via Anthropic Status API
   * Fetches incident history to find the most recent major/critical incident
   * @returns {boolean|null} true if operational, false if incident, null on API failure
   */
  async checkStatus() {
    try {
      console.log('ClaudeStreakCounter: Checking Anthropic Status API...');
      const response = await fetch(CLAUDE_STATUS_API);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Find the most recent major/critical incident from history
      const lastSignificantIncident = this.getLastSignificantIncidentDate(data);
      
      if (lastSignificantIncident) {
        // Check if this is a new incident (more recent than stored)
        if (!this.lastIncidentDate || lastSignificantIncident > this.lastIncidentDate) {
          this.lastIncidentDate = lastSignificantIncident;
          this.lastMilestone = 0; // Reset milestone tracking on new incident
          this.saveToStorage();
          console.log('ClaudeStreakCounter: Found significant incident', lastSignificantIncident);
        }
      }
      
      // Check if there's currently an active incident
      const hasActiveIncident = this.hasActiveSignificantIncident(data);
      this.isOperational = !hasActiveIncident;
      
      return !hasActiveIncident;
    } catch (error) {
      console.warn('ClaudeStreakCounter: Status check failed, using cached data', error);
      // Don't assume down on API failure - use last known state
      return null;
    }
  }

  /**
   * Get the most recent MAJOR or CRITICAL incident date from status data
   * @param {Object} data - Anthropic Status API response
   * @returns {Date|null} Date of last significant incident or null if none
   */
  getLastSignificantIncidentDate(data) {
    if (!data || !data.incidents || !Array.isArray(data.incidents)) {
      console.log('ClaudeStreakCounter: No incidents array in API response');
      return null;
    }

    // Filter for major/critical impact incidents
    const significantIncidents = data.incidents.filter(incident => 
      incident.impact === 'major' || incident.impact === 'critical'
    );

    if (significantIncidents.length === 0) {
      console.log('ClaudeStreakCounter: No major/critical incidents found in history');
      return null;
    }

    // Sort by created_at to get most recent
    significantIncidents.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const lastSignificant = significantIncidents[0];
    const incidentDate = new Date(lastSignificant.created_at);
    
    console.log('ClaudeStreakCounter: Last significant incident', {
      name: lastSignificant.name,
      date: incidentDate,
      impact: lastSignificant.impact
    });
    
    return incidentDate;
  }

  /**
   * Check if there are any currently active significant incidents
   * @param {Object} data - Anthropic Status API response
   * @returns {boolean} True if there's an active significant incident
   */
  hasActiveSignificantIncident(data) {
    if (!data || !data.incidents || !Array.isArray(data.incidents)) {
      return false;
    }

    // Filter for active (not resolved) major/critical incidents
    const activeSignificantIncidents = data.incidents.filter(incident => 
      (incident.impact === 'major' || incident.impact === 'critical') &&
      incident.status !== 'resolved' && incident.status !== 'postmortem'
    );

    if (activeSignificantIncidents.length > 0) {
      console.log('ClaudeStreakCounter: Found active significant incident(s)', 
        activeSignificantIncidents.map(i => ({ name: i.name, impact: i.impact, status: i.status }))
      );
      return true;
    }

    return false;
  }

  /**
   * Load persisted data from localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.lastIncidentDate = data.lastIncidentDate ? new Date(data.lastIncidentDate) : null;
        this.currentStreak = data.currentStreak || 0;
        this.lastMilestone = data.lastMilestone || 0;
        this.isOperational = data.isOperational !== false; // Default to true
        console.log('ClaudeStreakCounter: Loaded from storage', {
          lastIncidentDate: this.lastIncidentDate,
          currentStreak: this.currentStreak,
          lastMilestone: this.lastMilestone,
          isOperational: this.isOperational
        });
      }
    } catch (error) {
      console.warn('ClaudeStreakCounter: Failed to load from storage', error);
    }
  }

  /**
   * Save current state to localStorage
   */
  saveToStorage() {
    try {
      const data = {
        lastIncidentDate: this.lastIncidentDate ? this.lastIncidentDate.toISOString() : null,
        currentStreak: this.currentStreak,
        lastChecked: new Date().toISOString(),
        lastMilestone: this.lastMilestone,
        isOperational: this.isOperational
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      console.log('ClaudeStreakCounter: Saved to storage', data);
    } catch (error) {
      console.warn('ClaudeStreakCounter: Failed to save to storage', error);
    }
  }

  /**
   * Calculate streak based on last incident date
   */
  calculateStreak() {
    if (!this.lastIncidentDate) {
      // No incidents on record - show special state
      this.currentStreak = -1;
      return;
    }

    // Calculate days since last incident
    const now = new Date();
    const diffTime = now.getTime() - this.lastIncidentDate.getTime();
    this.currentStreak = Math.floor(diffTime / MILLISECONDS_PER_DAY);
    
    this.saveToStorage();
  }

  /**
   * Update streak with fresh status check
   */
  async update() {
    const previousStreak = this.currentStreak;
    
    // Check current status
    await this.checkStatus();
    
    // Recalculate streak
    this.calculateStreak();
    
    // Re-render if streak changed
    if (previousStreak !== this.currentStreak) {
      this.render();
      console.log(`ClaudeStreakCounter: Streak updated from ${previousStreak} to ${this.currentStreak}`);
    }
  }

  /**
   * Check if current streak is a milestone
   * @returns {boolean} True if current streak is a milestone
   */
  isMilestone() {
    return this.milestones.includes(this.currentStreak) && 
           this.currentStreak !== this.lastMilestone;
  }

  /**
   * Render the streak badge in the uptime badges container
   */
  render() {
    // Create or get badge element
    if (!this.badgeElement) {
      this.badgeElement = document.getElementById('claude-streak-badge');
      
      if (!this.badgeElement) {
        // Create badge element as anchor for clickable navigation
        this.badgeElement = document.createElement('a');
        this.badgeElement.id = 'claude-streak-badge';
        this.badgeElement.className = 'claude-streak-badge';
        this.badgeElement.href = 'https://status.claude.com/';
        this.badgeElement.target = '_blank';
        this.badgeElement.rel = 'noopener noreferrer';
        this.badgeElement.title = 'View Claude Status';
        
        // Insert in uptime badges container (top-right above detail cards)
        const badgesContainer = document.getElementById('uptimeBadgesContainer');
        
        if (badgesContainer) {
          badgesContainer.appendChild(this.badgeElement);
        } else {
          console.error('ClaudeStreakCounter: Could not find uptimeBadgesContainer element');
          return;
        }
      }
    }

    // Determine badge content based on streak (single line format)
    let badgeText;
    
    if (this.currentStreak === -1) {
      // No incidents on record
      badgeText = '✓ No major Claude incidents on record';
    } else if (this.currentStreak === 0) {
      // Incident today
      badgeText = '⚠️ Major Claude incident today';
    } else {
      // Normal streak display - single line with day count
      const dayText = this.currentStreak === 1 ? 'day' : 'days';
      badgeText = `✓ ${this.currentStreak} ${dayText} since last major Claude incident`;
    }

    // Set badge content using textContent for XSS safety
    this.badgeElement.textContent = badgeText;

    // Handle milestone animation
    if (this.isMilestone()) {
      this.triggerMilestoneAnimation();
      this.lastMilestone = this.currentStreak;
      this.saveToStorage();
    }

    // Update visual state based on streak
    this.badgeElement.classList.remove('claude-streak-badge--warning', 'claude-streak-badge--unknown');
    if (this.currentStreak === 0) {
      this.badgeElement.classList.add('claude-streak-badge--warning');
    } else if (this.currentStreak === -1) {
      this.badgeElement.classList.add('claude-streak-badge--unknown');
    }
  }

  /**
   * Format date for display
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDate(date) {
    if (!date) return 'Unknown';
    
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  /**
   * Trigger milestone celebration animation (400ms pulse)
   */
  triggerMilestoneAnimation() {
    if (!this.badgeElement) return;
    
    // Remove any existing animation class
    this.badgeElement.classList.remove('claude-streak-badge--milestone');
    
    // Force reflow to restart animation
    void this.badgeElement.offsetWidth;
    
    // Add animation class
    this.badgeElement.classList.add('claude-streak-badge--milestone');
    
    // Remove after animation completes
    setTimeout(() => {
      this.badgeElement.classList.remove('claude-streak-badge--milestone');
    }, 400);
    
    console.log(`ClaudeStreakCounter: Milestone celebration! ${this.currentStreak} days`);
  }

  /**
   * Start daily update scheduler (checks at midnight UTC)
   */
  startDailyUpdate() {
    // Calculate time until next midnight UTC
    const now = new Date();
    const nextMidnight = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0, 0
    ));
    const msUntilMidnight = nextMidnight.getTime() - now.getTime();
    
    console.log(`ClaudeStreakCounter: Next daily update at midnight UTC (${Math.round(msUntilMidnight / 60000)} minutes)`);
    
    // Schedule first update at midnight
    this.midnightTimeoutId = setTimeout(() => {
      this.incrementStreak();
      
      // Then update every 24 hours
      this.intervalId = setInterval(() => {
        this.incrementStreak();
      }, MILLISECONDS_PER_DAY);
    }, msUntilMidnight);
  }

  /**
   * Start periodic status polling (every 5 minutes per spec)
   */
  startPolling() {
    console.log('ClaudeStreakCounter: Starting status polling (every 5 minutes)');
    this.pollIntervalId = setInterval(() => {
      this.update();
    }, POLL_INTERVAL);
  }

  /**
   * Increment streak at midnight (if no new incidents)
   */
  incrementStreak() {
    // Only increment if we have a valid streak (not in incident state)
    if (this.currentStreak >= 0 && this.isOperational) {
      this.currentStreak++;
      this.saveToStorage();
      this.render();
      console.log(`ClaudeStreakCounter: Midnight update - streak now ${this.currentStreak}`);
    }
  }

  /**
   * Stop the streak counter and clean up resources
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.midnightTimeoutId) {
      clearTimeout(this.midnightTimeoutId);
      this.midnightTimeoutId = null;
    }
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
    console.log('ClaudeStreakCounter: Stopped');
  }
}
