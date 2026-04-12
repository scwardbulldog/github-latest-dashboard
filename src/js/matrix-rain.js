/**
 * Matrix Rain Easter Egg - Dramatic visual effect for GitHub status incidents
 * Triggers a Matrix-style falling characters animation when major/critical
 * incidents are detected.
 * 
 * Features:
 * - Classic Matrix aesthetic: green characters on dark background
 * - HTML5 Canvas for performance (optimized for Raspberry Pi 3B)
 * - Intensity scaling based on incident severity
 * - Configurable duration (default 45 seconds)
 * - Click/interaction to dismiss early
 * - Resource cleanup after animation completes
 * 
 * @module matrix-rain
 */

/**
 * Matrix Rain animation controller
 * Uses canvas-based rendering for smooth animation on Pi 3B hardware
 */
export class MatrixRain {
  /**
   * Create a new Matrix Rain instance
   * @param {HTMLCanvasElement} canvas - Canvas element for rendering
   * @param {number} intensity - Rain density 0.0-1.0 (default 0.5)
   * @param {number} duration - Animation duration in milliseconds (default 45000)
   */
  constructor(canvas, intensity = 0.5, duration = 45000) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.intensity = Math.max(0, Math.min(1, intensity)); // Clamp 0-1
    this.duration = duration;
    this.animationId = null;
    this.startTime = null;
    this.drops = [];
    this.isRunning = false;
    
    // Performance: Column width and character set
    this.columnWidth = 20;
    this.fontSize = 15;
    
    // Character set: Katakana, numbers, and Latin letters (authentic Matrix style)
    this.characters = 'ｦｱｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    // Interaction handler reference for cleanup
    this.dismissHandler = null;
  }
  
  /**
   * Initialize canvas and generate rain drops
   * Sets up canvas size and creates initial drop positions
   */
  initialize() {
    // Set canvas to full viewport
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Calculate number of columns and drops based on intensity
    const columns = Math.floor(this.canvas.width / this.columnWidth);
    const dropCount = Math.floor(columns * this.intensity);
    
    // Initialize drops with random positions and speeds
    this.drops = [];
    for (let i = 0; i < dropCount; i++) {
      this.drops.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        speed: Math.random() * 3 + 2, // Speed: 2-5 pixels per frame
        trail: [] // Store previous positions for trail effect
      });
    }
    
    // Fill initial black background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    console.log(`MatrixRain: Initialized with ${dropCount} drops (intensity: ${this.intensity})`);
  }
  
  /**
   * Start the animation
   * Sets up timing, interaction handlers, and begins animation loop
   */
  start() {
    if (this.isRunning) {
      console.warn('MatrixRain: Animation already running');
      return;
    }
    
    this.isRunning = true;
    this.startTime = Date.now();
    
    // Set up click/touch handler to dismiss early
    this.dismissHandler = () => this.stop();
    document.addEventListener('click', this.dismissHandler, { once: true });
    document.addEventListener('touchstart', this.dismissHandler, { once: true });
    document.addEventListener('keydown', this.dismissHandler, { once: true });
    
    // Make canvas visible
    this.canvas.style.display = 'block';
    
    console.log(`MatrixRain: Started animation for ${this.duration / 1000} seconds`);
    
    // Begin animation loop
    this.animate();
  }
  
  /**
   * Main animation loop
   * Uses requestAnimationFrame for smooth 30+ FPS on Pi 3B
   */
  animate() {
    const elapsed = Date.now() - this.startTime;
    
    // Check if animation should end
    if (elapsed > this.duration || !this.isRunning) {
      this.stop();
      return;
    }
    
    // Fade effect: semi-transparent black overlay
    // This creates the "trail" effect as characters fall
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Set up text rendering
    this.ctx.font = `${this.fontSize}px monospace`;
    
    // Draw falling characters
    this.drops.forEach(drop => {
      // Randomly select character
      const char = this.getRandomChar();
      
      // Head of the drop: bright green (#00FF00)
      this.ctx.fillStyle = '#00FF00';
      this.ctx.fillText(char, drop.x, drop.y);
      
      // Move drop down
      drop.y += drop.speed;
      
      // Reset drop to top when it falls off screen (with some randomness)
      if (drop.y > this.canvas.height) {
        drop.y = -this.fontSize;
        drop.x = Math.random() * this.canvas.width;
        drop.speed = Math.random() * 3 + 2; // Randomize speed on reset
      }
    });
    
    // Schedule next frame
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  /**
   * Get a random character from the Matrix character set
   * @returns {string} Single character
   */
  getRandomChar() {
    return this.characters[Math.floor(Math.random() * this.characters.length)];
  }
  
  /**
   * Stop the animation and clean up resources
   * Removes canvas from DOM and cancels animation frame
   */
  stop() {
    if (!this.isRunning && !this.animationId) {
      return; // Already stopped
    }
    
    this.isRunning = false;
    
    // Cancel animation frame
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // Remove event listeners
    if (this.dismissHandler) {
      document.removeEventListener('click', this.dismissHandler);
      document.removeEventListener('touchstart', this.dismissHandler);
      document.removeEventListener('keydown', this.dismissHandler);
      this.dismissHandler = null;
    }
    
    // Fade out and remove canvas
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.classList.add('matrix-rain-canvas--fading');
      
      // Remove from DOM after fade transition
      setTimeout(() => {
        if (this.canvas && this.canvas.parentNode) {
          this.canvas.remove();
        }
      }, 500);
    }
    
    // Clear drops array for garbage collection
    this.drops = [];
    
    console.log('MatrixRain: Animation stopped and resources cleaned up');
  }
}

// ============================================================================
// Incident Detection & Matrix Rain Triggering
// ============================================================================

// localStorage key for tracking seen incident IDs
const SEEN_INCIDENTS_KEY = 'github-matrix-rain-seen-incidents';

// Current Matrix Rain instance (prevent multiple animations)
let currentMatrixRain = null;

/**
 * Check for new major/critical incidents and trigger Matrix rain
 * Called during data refresh to detect new incidents
 * 
 * @param {Object} statusData - GitHub Status API response with incidents array
 */
export function checkForNewIncidents(statusData) {
  if (!statusData || !statusData.incidents || !Array.isArray(statusData.incidents)) {
    console.log('MatrixRain: No valid status data for incident check');
    return;
  }
  
  // Get previously seen incident IDs from localStorage
  const seenIncidents = getSeenIncidents();
  
  // Filter for new major/critical incidents that we haven't seen
  // Only trigger for incidents with impact of 'major' or 'critical'
  // Do not trigger for 'resolved' or 'postmortem' status (only active incidents)
  const newIncidents = statusData.incidents.filter(incident => {
    const isNew = !seenIncidents.includes(incident.id);
    const isMajorOrCritical = incident.impact === 'major' || incident.impact === 'critical';
    const isActiveIncident = incident.status !== 'resolved' && incident.status !== 'postmortem';
    
    return isNew && isMajorOrCritical && isActiveIncident;
  });
  
  if (newIncidents.length > 0) {
    // Trigger Matrix rain for the most severe incident
    const mostSevere = newIncidents.reduce((prev, current) => {
      const severityOrder = { critical: 3, major: 2, minor: 1 };
      return (severityOrder[current.impact] || 0) > (severityOrder[prev.impact] || 0) 
        ? current 
        : prev;
    });
    
    console.log(`MatrixRain: New incident detected - ${mostSevere.name} (${mostSevere.impact})`);
    triggerMatrixRain(mostSevere);
    
    // Mark all new incidents as seen
    const updatedSeenIncidents = [...seenIncidents, ...newIncidents.map(i => i.id)];
    saveSeenIncidents(updatedSeenIncidents);
  }
}

/**
 * Trigger the Matrix rain animation for an incident
 * @param {Object} incident - Incident object with id, name, impact, status
 */
export function triggerMatrixRain(incident) {
  // Don't stack multiple Matrix rain animations
  if (currentMatrixRain && currentMatrixRain.isRunning) {
    console.log('MatrixRain: Animation already running, skipping');
    return;
  }
  
  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.id = 'matrix-rain-canvas';
  canvas.className = 'matrix-rain-canvas';
  
  // Append to body
  document.body.appendChild(canvas);
  
  // Calculate intensity based on incident severity
  const intensity = getIntensityForImpact(incident.impact);
  
  // Create and start Matrix rain
  currentMatrixRain = new MatrixRain(canvas, intensity, 45000);
  currentMatrixRain.initialize();
  currentMatrixRain.start();
  
  console.log(`MatrixRain: Triggered for incident "${incident.name}" with intensity ${intensity}`);
}

/**
 * Map incident impact to animation intensity
 * @param {string} impact - Impact level ('critical', 'major', 'minor')
 * @returns {number} Intensity value 0.0-1.0
 */
function getIntensityForImpact(impact) {
  switch (impact) {
    case 'critical':
      return 0.8; // Dense rain (80% of columns)
    case 'major':
      return 0.5; // Medium rain (50% of columns)
    case 'minor':
      return 0.2; // Sparse rain (20% of columns)
    default:
      return 0.3; // Default moderate rain
  }
}

/**
 * Get list of seen incident IDs from localStorage
 * @returns {string[]} Array of incident IDs
 */
function getSeenIncidents() {
  try {
    const stored = localStorage.getItem(SEEN_INCIDENTS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.error('MatrixRain: Error reading seen incidents from localStorage', error);
  }
  return [];
}

/**
 * Save seen incident IDs to localStorage
 * @param {string[]} incidents - Array of incident IDs
 */
function saveSeenIncidents(incidents) {
  try {
    // Limit to 100 most recent incidents to prevent localStorage bloat
    // while maintaining sufficient history for duplicate detection
    // (GitHub rarely has more than a few incidents per month)
    const trimmed = incidents.slice(-100);
    localStorage.setItem(SEEN_INCIDENTS_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('MatrixRain: Error saving seen incidents to localStorage', error);
  }
}

/**
 * Force trigger Matrix rain for testing purposes.
 * Creates a mock incident and triggers the animation directly,
 * bypassing the incident detection filter and localStorage tracking.
 * 
 * Note: This function can be called multiple times without triggering
 * the "already seen" logic since it bypasses checkForNewIncidents().
 * This is intentional to allow repeated testing.
 * 
 * @param {string} severity - 'minor', 'major', or 'critical'
 */
export function testMatrixRain(severity = 'major') {
  const mockIncident = {
    id: `test-${Date.now()}`,
    name: 'Test Incident',
    impact: severity,
    status: 'identified' // Active status that would pass detection filter
  };
  
  console.log(`MatrixRain: Test trigger with severity: ${severity}`);
  triggerMatrixRain(mockIncident);
}

// Export for global testing access
if (typeof window !== 'undefined') {
  window.testMatrixRain = testMatrixRain;
}
