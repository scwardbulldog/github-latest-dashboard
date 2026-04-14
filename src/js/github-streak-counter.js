/**
 * GitHub Uptime Streak Counter
 * Displays consecutive days since last major/critical GitHub incident
 * @module github-streak-counter
 */

// Time constant for day calculations
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Developer-relevant GitHub services to track for incidents
 * Excludes services not yet used by the team (Wiki, Pages, Codespaces)
 * 
 * Matching Strategy: Case-insensitive partial matching against GitHub Status API component names
 * - Supports variations like "Git Operations" matching "git-operations" or "Git Ops"
 * - Uses bidirectional substring matching for flexibility
 */
const DEVELOPER_RELEVANT_SERVICES = [
  // Core Git & API services
  'Git Operations',
  'API Requests',
  'Webhooks',
  
  // Development workflow services
  'GitHub Actions',
  'Pull Requests',
  'Issues',
  'Notifications',
  'Repositories',
  'GitHub Packages',
  
  // AI/Developer tools
  'GitHub Copilot',
  
  // Infrastructure services
  'GitHub Connect',
  
  // Exclude: GitHub Pages, GitHub Wiki, Codespaces (not used yet)
];

// Pre-compute lowercase versions for efficient comparison
const DEVELOPER_RELEVANT_SERVICES_LOWER = DEVELOPER_RELEVANT_SERVICES.map(s => s.toLowerCase());

/**
 * GitHubStreakCounter class manages the uptime streak badge
 * Shows days since last major/critical incident with localStorage persistence
 */
export class GitHubStreakCounter {
  /**
   * Initialize streak counter
   */
  constructor() {
    this.storageKey = 'github-uptime-streak';
    this.badgeElement = null;
    this.intervalId = null;
    this.currentStreak = 0;
    this.lastIncidentDate = null;
    this.lastMilestone = 0;
    this.milestones = [30, 60, 90, 365];
  }

  /**
   * Initialize the streak counter with status data
   * @param {Object} statusData - GitHub Status API incidents data
   */
  initialize(statusData) {
    // Load persisted data
    this.loadFromStorage();
    
    // Calculate streak from API data
    this.calculateStreak(statusData);
    
    // Render the badge
    this.render();
    
    // Start daily update scheduler
    this.startDailyUpdate();
    
    console.log(`GitHubStreakCounter: Initialized with ${this.currentStreak} days streak`);
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
        console.log('GitHubStreakCounter: Loaded from storage', {
          lastIncidentDate: this.lastIncidentDate,
          currentStreak: this.currentStreak,
          lastMilestone: this.lastMilestone
        });
      }
    } catch (error) {
      console.warn('GitHubStreakCounter: Failed to load from storage', error);
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
        lastMilestone: this.lastMilestone
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      console.log('GitHubStreakCounter: Saved to storage', data);
    } catch (error) {
      console.warn('GitHubStreakCounter: Failed to save to storage', error);
    }
  }

  /**
   * Calculate streak from status data
   * Counts MAJOR and CRITICAL incidents (significant outages)
   * @param {Object} statusData - GitHub Status API incidents data
   */
  calculateStreak(statusData) {
    const lastSignificantIncident = this.getLastSignificantIncidentDate(statusData);
    
    if (!lastSignificantIncident) {
      // No significant incidents found - use stored data or default to high count
      if (!this.lastIncidentDate) {
        // If no stored data, show "No incidents" state
        this.currentStreak = -1; // Special value for "no incidents"
        return;
      }
      // Use stored date to calculate current streak
    } else {
      // Check if this is a new incident (more recent than stored)
      if (!this.lastIncidentDate || lastSignificantIncident > this.lastIncidentDate) {
        this.lastIncidentDate = lastSignificantIncident;
        this.lastMilestone = 0; // Reset milestone tracking on new incident
        console.log('GitHubStreakCounter: New significant incident detected', lastSignificantIncident);
      }
    }
    
    // Calculate days since last incident
    if (this.lastIncidentDate) {
      const now = new Date();
      const diffTime = now.getTime() - this.lastIncidentDate.getTime();
      this.currentStreak = Math.floor(diffTime / MILLISECONDS_PER_DAY);
    }
    
    this.saveToStorage();
  }

  /**
   * Check if an incident affects developer-relevant services
   * @param {Object} incident - Incident object from GitHub Status API
   * @returns {boolean} True if incident affects services we care about
   * @private
   */
  affectsDeveloperServices(incident) {
    // If no components listed, assume it affects core services (conservative approach)
    if (!incident.components || !Array.isArray(incident.components) || incident.components.length === 0) {
      console.log('GitHubStreakCounter: Incident has no component info, counting as relevant:', incident.name);
      return true;
    }

    // Check if any affected component is in our developer-relevant list
    // Pre-convert to lowercase once for efficiency
    const affectedServices = incident.components.map(c => c.name).filter(Boolean);
    const affectedServicesLower = affectedServices.map(s => s.toLowerCase());
    
    // Case-insensitive partial matching to handle variations
    const isRelevant = affectedServicesLower.some(serviceName => 
      DEVELOPER_RELEVANT_SERVICES_LOWER.some(relevantService => 
        serviceName.includes(relevantService) ||
        relevantService.includes(serviceName)
      )
    );

    if (!isRelevant) {
      console.log('GitHubStreakCounter: Filtering out incident (non-developer services):', {
        name: incident.name,
        affectedServices: affectedServices
      });
    }

    return isRelevant;
  }

  /**
   * Get the most recent MAJOR or CRITICAL incident date from status data
   * Filters for developer-relevant services only (excludes Wiki, Pages, etc.)
   * GitHub Status API uses "major" for significant outages, "critical" for extreme cases
   * @param {Object} statusData - GitHub Status API incidents data
   * @returns {Date|null} Date of last significant incident or null if none
   */
  getLastSignificantIncidentDate(statusData) {
    if (!statusData || !statusData.incidents || !Array.isArray(statusData.incidents)) {
      console.warn('GitHubStreakCounter: Invalid status data structure');
      return null;
    }

    // Filter for MAJOR and CRITICAL impact incidents affecting developer services
    // "major" = significant outages affecting many users/services
    // "critical" = extreme platform-wide failures (very rare)
    const significantIncidents = statusData.incidents.filter(incident => {
      const isMajorOrCritical = incident.impact === 'major' || incident.impact === 'critical';
      const affectsDevelopers = this.affectsDeveloperServices(incident);
      return isMajorOrCritical && affectsDevelopers;
    });

    if (significantIncidents.length === 0) {
      console.log('GitHubStreakCounter: No major/critical incidents affecting developer services found');
      return null;
    }

    // Sort by created_at to get most recent
    significantIncidents.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const lastSignificant = significantIncidents[0];
    const incidentDate = new Date(lastSignificant.created_at);
    
    console.log('GitHubStreakCounter: Last significant developer-relevant incident', {
      name: lastSignificant.name,
      date: incidentDate,
      impact: lastSignificant.impact,
      affectedServices: lastSignificant.components?.map(c => c.name).filter(Boolean) || []
    });
    
    return incidentDate;
  }

  /**
   * Update streak with new status data (called on API refresh)
   * @param {Object} statusData - GitHub Status API incidents data
   */
  update(statusData) {
    const previousStreak = this.currentStreak;
    this.calculateStreak(statusData);
    
    // Re-render if streak changed
    if (previousStreak !== this.currentStreak) {
      this.render();
      console.log(`GitHubStreakCounter: Streak updated from ${previousStreak} to ${this.currentStreak}`);
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
      this.badgeElement = document.getElementById('github-streak-badge');
      
      if (!this.badgeElement) {
        // Create badge element as anchor for clickable navigation
        this.badgeElement = document.createElement('a');
        this.badgeElement.id = 'github-streak-badge';
        this.badgeElement.className = 'github-streak-badge';
        this.badgeElement.href = 'https://www.githubstatus.com/';
        this.badgeElement.target = '_blank';
        this.badgeElement.rel = 'noopener noreferrer';
        this.badgeElement.title = 'View GitHub Status';
        
        // Insert in uptime badges container (top-right above detail cards)
        const badgesContainer = document.getElementById('uptimeBadgesContainer');
        
        if (badgesContainer) {
          badgesContainer.appendChild(this.badgeElement);
        } else {
          console.error('GitHubStreakCounter: Could not find uptimeBadgesContainer element');
          return;
        }
      }
    }

    // Determine badge content based on streak (single line format)
    let badgeText;
    
    if (this.currentStreak === -1) {
      // No significant incidents on record (unlikely)
      badgeText = '✓ No major GitHub incidents on record';
    } else if (this.currentStreak === 0) {
      // Incident today
      badgeText = `⚠️ Major GitHub incident today`;
    } else {
      // Normal streak display - single line with day count and last date
      const dayText = this.currentStreak === 1 ? 'day' : 'days';
      badgeText = `✓ ${this.currentStreak} ${dayText} since last major GitHub incident`;
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
    this.badgeElement.classList.remove('github-streak-badge--warning', 'github-streak-badge--unknown');
    if (this.currentStreak === 0) {
      this.badgeElement.classList.add('github-streak-badge--warning');
    } else if (this.currentStreak === -1) {
      this.badgeElement.classList.add('github-streak-badge--unknown');
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
    this.badgeElement.classList.remove('github-streak-badge--milestone');
    
    // Force reflow to restart animation
    void this.badgeElement.offsetWidth;
    
    // Add animation class
    this.badgeElement.classList.add('github-streak-badge--milestone');
    
    // Remove after animation completes
    setTimeout(() => {
      this.badgeElement.classList.remove('github-streak-badge--milestone');
    }, 400);
    
    console.log(`GitHubStreakCounter: Milestone celebration! ${this.currentStreak} days`);
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
    
    console.log(`GitHubStreakCounter: Next update at midnight UTC (${Math.round(msUntilMidnight / 60000)} minutes)`);
    
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
   * Increment streak at midnight (if no new incidents)
   */
  incrementStreak() {
    // Only increment if we have a valid streak
    if (this.currentStreak >= 0) {
      this.currentStreak++;
      this.saveToStorage();
      this.render();
      console.log(`GitHubStreakCounter: Midnight update - streak now ${this.currentStreak}`);
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
    console.log('GitHubStreakCounter: Stopped');
  }
}
