/**
 * OctocatCameo - Easter egg: Jetpacktocat flies chaotically around the screen
 * 
 * Appears every 30 minutes as a delightful surprise for regular viewers.
 * Jetpack is out of control - bounces off walls, flips direction, chaotic flight!
 * 
 * Uses official Jetpacktocat artwork from GitHub Octodex (#116)
 * 
 * @module octocat-cameo
 */

/**
 * Path to Jetpacktocat image
 * Official artwork from GitHub Octodex
 * @constant {string}
 */
const JETPACKTOCAT_IMAGE_PATH = '/img/jetpacktocat.png';

/**
 * Physics constants for chaotic jetpack flight
 */
const PHYSICS = {
  // Velocity range (pixels per frame)
  MIN_SPEED: 3,
  MAX_SPEED: 8,
  // Bounce dampening (energy loss on wall hit)
  BOUNCE_DAMPEN: 0.7,
  // Rotation wobble range (degrees)
  MAX_ROTATION: 25,
  // Frame rate for animation loop
  FRAME_MS: 1000 / 60, // 60 FPS
};

/**
 * OctocatCameo class manages the Easter egg animation
 * @class
 */
export class OctocatCameo {
  /**
   * Create an OctocatCameo instance
   * @param {Object} config - Configuration options
   * @param {number} config.interval - Time between appearances in ms (default: 30 minutes)
   * @param {number} config.duration - Flight duration in ms (default: 30 seconds)
   */
  constructor({ interval = 30 * 60 * 1000, duration = 30000 } = {}) {
    this.interval = interval;       // 30 minutes default
    this.duration = duration;       // 30 seconds flight duration
    this.intervalId = null;         // Timer handle for interval
    this.animationFrameId = null;   // Animation frame handle
    this.timeoutId = null;          // Cleanup timeout handle
    this.isAnimating = false;       // Animation state flag
    this.currentElement = null;     // Currently animating element
    
    // Physics state
    this.x = 0;                     // X position
    this.y = 0;                     // Y position
    this.vx = 0;                    // X velocity
    this.vy = 0;                    // Y velocity
    this.rotation = 0;              // Current rotation
    this.facingRight = true;        // Direction facing
    this.startTime = 0;             // Animation start timestamp
    
    // Keyboard trigger state (holding "f", "l", "y")
    this.keysPressed = new Set();   // Track currently pressed keys
    this.keydownHandler = null;     // Handler reference for cleanup
    this.keyupHandler = null;       // Handler reference for cleanup
  }

  /**
   * Start the Easter egg timer
   * Schedules Jetpacktocat to appear every 30 minutes
   * Also enables keyboard trigger (hold "f", "l", "y" simultaneously)
   */
  start() {
    // Clear any existing timer
    this.stop();
    
    // Schedule recurring appearances
    this.intervalId = setInterval(() => this.triggerWalk(), this.interval);
    
    // Setup keyboard trigger for "fly" keys
    this.setupKeyboardTrigger();
    
    console.log(`🚀 OctocatCameo: Started (appears every ${this.interval / 60000} minutes, or hold "fly" keys)`);
  }

  /**
   * Setup keyboard trigger for "fly" keys
   * Holding f, l, y simultaneously triggers the animation
   */
  setupKeyboardTrigger() {
    // Keydown handler - add to pressed set and check trigger
    this.keydownHandler = (event) => {
      const key = event.key.toLowerCase();
      
      // Only track f, l, y keys
      if (['f', 'l', 'y'].includes(key)) {
        this.keysPressed.add(key);
        
        // Check if all three keys are pressed
        if (this.keysPressed.has('f') && this.keysPressed.has('l') && this.keysPressed.has('y')) {
          console.log('🚀 OctocatCameo: "FLY" keys detected!');
          this.triggerWalk();
        }
      }
    };
    
    // Keyup handler - remove from pressed set
    this.keyupHandler = (event) => {
      const key = event.key.toLowerCase();
      this.keysPressed.delete(key);
    };
    
    // Attach listeners
    document.addEventListener('keydown', this.keydownHandler);
    document.addEventListener('keyup', this.keyupHandler);
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
    
    // Clear animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Clear timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    // Remove keyboard listeners
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
    if (this.keyupHandler) {
      document.removeEventListener('keyup', this.keyupHandler);
      this.keyupHandler = null;
    }
    this.keysPressed.clear();
    
    // Remove any active animation element
    if (this.currentElement && this.currentElement.parentNode) {
      this.currentElement.remove();
      this.currentElement = null;
    }
    
    this.isAnimating = false;
  }

  /**
   * Trigger Jetpacktocat to fly chaotically around the screen
   * Creates element, initializes physics, and animates with bouncing
   */
  triggerWalk() {
    // Prevent overlapping animations
    if (this.isAnimating) {
      console.log('🚀 OctocatCameo: Animation already in progress, skipping');
      return;
    }

    this.isAnimating = true;
    this.startTime = performance.now();
    console.log('🚀 OctocatCameo: Jetpacktocat\'s jetpack is out of control!');

    // Create the Jetpacktocat container element
    const octocat = document.createElement('div');
    octocat.className = 'jetpacktocat-cameo';
    octocat.setAttribute('aria-hidden', 'true'); // Accessibility: decorative element
    
    // Create the image element
    const img = document.createElement('img');
    img.alt = 'Jetpacktocat flying chaotically';
    img.draggable = false;
    
    // Handle image load errors gracefully - skip animation if image fails
    img.onerror = () => {
      console.warn('🚀 OctocatCameo: Failed to load Jetpacktocat image, aborting animation');
      this.stopAnimation();
    };
    
    // Set src after onerror handler to catch load failures
    img.src = JETPACKTOCAT_IMAGE_PATH;
    
    // Append image to container
    octocat.appendChild(img);
    
    // Add to DOM
    document.body.appendChild(octocat);
    this.currentElement = octocat;

    // Initialize physics - start from random edge
    this.initializePhysics();
    
    // Start animation loop
    this.animate();

    // Schedule cleanup after duration
    this.timeoutId = setTimeout(() => {
      this.stopAnimation();
    }, this.duration);
  }

  /**
   * Initialize physics state with random position and velocity
   */
  initializePhysics() {
    const startEdge = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
    
    // Start from random edge position
    switch (startEdge) {
      case 0: // Top
        this.x = Math.random() * window.innerWidth;
        this.y = -100;
        this.vy = PHYSICS.MIN_SPEED + Math.random() * (PHYSICS.MAX_SPEED - PHYSICS.MIN_SPEED);
        this.vx = (Math.random() - 0.5) * PHYSICS.MAX_SPEED;
        break;
      case 1: // Right
        this.x = window.innerWidth + 100;
        this.y = Math.random() * window.innerHeight;
        this.vx = -(PHYSICS.MIN_SPEED + Math.random() * (PHYSICS.MAX_SPEED - PHYSICS.MIN_SPEED));
        this.vy = (Math.random() - 0.5) * PHYSICS.MAX_SPEED;
        break;
      case 2: // Bottom
        this.x = Math.random() * window.innerWidth;
        this.y = window.innerHeight + 100;
        this.vy = -(PHYSICS.MIN_SPEED + Math.random() * (PHYSICS.MAX_SPEED - PHYSICS.MIN_SPEED));
        this.vx = (Math.random() - 0.5) * PHYSICS.MAX_SPEED;
        break;
      case 3: // Left
        this.x = -100;
        this.y = Math.random() * window.innerHeight;
        this.vx = PHYSICS.MIN_SPEED + Math.random() * (PHYSICS.MAX_SPEED - PHYSICS.MIN_SPEED);
        this.vy = (Math.random() - 0.5) * PHYSICS.MAX_SPEED;
        break;
    }
    
    this.facingRight = this.vx > 0;
    this.rotation = (Math.random() - 0.5) * PHYSICS.MAX_ROTATION;
  }

  /**
   * Animation loop - update physics and render
   */
  animate() {
    if (!this.isAnimating || !this.currentElement) {
      return;
    }

    // Update physics
    this.updatePhysics();
    
    // Render
    this.render();
    
    // Continue animation
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  /**
   * Update physics simulation - position, velocity, collisions
   */
  updatePhysics() {
    // Update position
    this.x += this.vx;
    this.y += this.vy;
    
    // Add some chaotic wobble to velocity
    this.vx += (Math.random() - 0.5) * 0.5;
    this.vy += (Math.random() - 0.5) * 0.5;
    
    // Clamp speed to stay within bounds
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > PHYSICS.MAX_SPEED) {
      this.vx = (this.vx / speed) * PHYSICS.MAX_SPEED;
      this.vy = (this.vy / speed) * PHYSICS.MAX_SPEED;
    }
    
    // Boundary collision detection (with 100px margin for octocat size)
    const margin = 100;
    
    // Left wall
    if (this.x < margin && this.vx < 0) {
      this.vx = -this.vx * PHYSICS.BOUNCE_DAMPEN;
      this.x = margin;
      this.facingRight = true;
      this.addBounceWobble();
    }
    
    // Right wall
    if (this.x > window.innerWidth - margin && this.vx > 0) {
      this.vx = -this.vx * PHYSICS.BOUNCE_DAMPEN;
      this.x = window.innerWidth - margin;
      this.facingRight = false;
      this.addBounceWobble();
    }
    
    // Top wall
    if (this.y < margin && this.vy < 0) {
      this.vy = -this.vy * PHYSICS.BOUNCE_DAMPEN;
      this.y = margin;
      this.addBounceWobble();
    }
    
    // Bottom wall
    if (this.y > window.innerHeight - margin && this.vy > 0) {
      this.vy = -this.vy * PHYSICS.BOUNCE_DAMPEN;
      this.y = window.innerHeight - margin;
      this.addBounceWobble();
    }
    
    // Update rotation for chaos
    this.rotation += (Math.random() - 0.5) * 2;
    this.rotation = Math.max(-PHYSICS.MAX_ROTATION, Math.min(PHYSICS.MAX_ROTATION, this.rotation));
  }

  /**
   * Add extra wobble/chaos when bouncing off walls
   */
  addBounceWobble() {
    // Add perpendicular velocity for more chaos
    const temp = this.vx;
    this.vx += this.vy * 0.3;
    this.vy += temp * 0.3;
    
    // Rotation wobble
    this.rotation += (Math.random() - 0.5) * 20;
  }

  /**
   * Render Jetpacktocat at current physics state
   */
  render() {
    if (!this.currentElement) return;
    
    const img = this.currentElement.querySelector('img');
    if (!img) return;
    
    // Apply transform: position, flip, rotation
    const scaleX = this.facingRight ? 1 : -1;
    const transform = `translate(${this.x}px, ${this.y}px) scaleX(${scaleX}) rotate(${this.rotation}deg)`;
    
    this.currentElement.style.transform = transform;
  }

  /**
   * Stop the current animation
   */
  stopAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    if (this.currentElement && this.currentElement.parentNode) {
      this.currentElement.remove();
      this.currentElement = null;
    }
    
    this.isAnimating = false;
    console.log('🚀 OctocatCameo: Jetpacktocat has flown away!');
  }

  /**
   * Manually trigger a walk (for testing/demo purposes)
   */
  demo() {
    console.log('🐙 OctocatCameo: Demo mode - triggering walk now');
    this.triggerWalk();
  }
}
