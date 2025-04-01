/**
 * Feedback System for Greek Tower Stacker Game
 * Handles visual and camera feedback effects for game events
 */
class FeedbackSystem {
  constructor(stage, options = {}) {
    // Store stage reference for camera effects
    this.stage = stage;
    
    // Container for particle effects
    this.particleContainer = document.getElementById(options.particleContainerId || 'particle-container');
    
    // Effect settings
    this.settings = {
      cameraPerfectShake: options.cameraPerfectShake || 0.05,
      cameraNormalShake: options.cameraNormalShake || 0.02,
      shakeDecay: options.shakeDecay || 0.9,
      particleCount: options.particleCount || 10,
      particleSize: options.particleSize || { min: 5, max: 15 },
      particleLifetime: options.particleLifetime || { min: 400, max: 1200 },
      perfectColor: options.perfectColor || '#ffcc00',
      normalColor: options.normalColor || '#ffffff'
    };
    
    // Active effects tracking
    this.activeShake = 0;
    this.activeParticles = [];
    
    // Initialize
    this.init();
  }
  
  /**
   * Initialize the feedback system
   */
  init() {
    // Create particle container if needed
    if (!this.particleContainer) {
      this.particleContainer = document.createElement('div');
      this.particleContainer.id = 'particle-container';
      this.particleContainer.style.position = 'absolute';
      this.particleContainer.style.top = '0';
      this.particleContainer.style.left = '0';
      this.particleContainer.style.width = '100%';
      this.particleContainer.style.height = '100%';
      this.particleContainer.style.pointerEvents = 'none';
      this.particleContainer.style.zIndex = '10';
      this.particleContainer.style.overflow = 'hidden';
      document.body.appendChild(this.particleContainer);
    }
  }
  
  /**
   * Update effect animations (call in game loop)
   * @param {number} deltaTime - Time since last update in milliseconds
   */
  update(deltaTime = 16) {
    // Update camera shake
    this.updateCameraShake();
    
    // Update particles
    this.updateParticles(deltaTime);
  }
  
  /**
   * Update camera shake effect
   */
  updateCameraShake() {
    if (this.activeShake > 0.001) {
      // Apply camera shake
      if (this.stage && this.stage.camera) {
        const shakeX = (Math.random() * 2 - 1) * this.activeShake;
        const shakeY = (Math.random() * 2 - 1) * this.activeShake;
        
        // Apply to camera
        this.stage.camera.position.x += shakeX;
        this.stage.camera.position.y += shakeY;
      }
      
      // Decay shake amount
      this.activeShake *= this.settings.shakeDecay;
    } else {
      this.activeShake = 0;
    }
  }
  
  /**
   * Update particle effects
   * @param {number} deltaTime - Time since last update in milliseconds
   */
  updateParticles(deltaTime) {
    // Update existing particles
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const particle = this.activeParticles[i];
      
      // Update lifetime
      particle.lifetime -= deltaTime;
      
      // Remove expired particles
      if (particle.lifetime <= 0) {
        if (particle.element.parentNode) {
          particle.element.parentNode.removeChild(particle.element);
        }
        this.activeParticles.splice(i, 1);
        continue;
      }
      
      // Update position
      particle.x += particle.vx * deltaTime / 100;
      particle.y += particle.vy * deltaTime / 100;
      
      // Update opacity
      const opacity = particle.lifetime / particle.maxLifetime;
      
      // Apply updates to element
      particle.element.style.left = `${particle.x}px`;
      particle.element.style.top = `${particle.y}px`;
      particle.element.style.opacity = opacity;
    }
  }
  
  /**
   * Trigger perfect placement feedback
   * @param {Object} position - Position to center effects {x, y}
   */
  triggerPerfectFeedback(position) {
    // Camera shake
    this.activeShake = this.settings.cameraPerfectShake;
    
    // Create particles
    this.createParticles(
      position, 
      this.settings.particleCount * 1.5, 
      this.settings.perfectColor
    );
    
    // Flash effect (if container exists)
    this.flashScreen(this.settings.perfectColor, 0.2, 200);
  }
  
  /**
   * Trigger normal placement feedback
   * @param {Object} position - Position to center effects {x, y}
   */
  triggerNormalFeedback(position) {
    // Camera shake (milder)
    this.activeShake = this.settings.cameraNormalShake;
    
    // Create particles (fewer)
    this.createParticles(
      position, 
      this.settings.particleCount * 0.7, 
      this.settings.normalColor
    );
  }
  
  /**
   * Create particles at a position
   * @param {Object} position - Position to center particles {x, y}
   * @param {number} count - Number of particles to create
   * @param {string} color - Color of particles
   */
  createParticles(position, count, color) {
    const numParticles = Math.floor(count);
    
    for (let i = 0; i < numParticles; i++) {
      // Create particle element
      const particleEl = document.createElement('div');
      particleEl.className = 'feedback-particle';
      
      // Random size
      const size = this.randomRange(
        this.settings.particleSize.min, 
        this.settings.particleSize.max
      );
      
      // Style particle
      particleEl.style.position = 'absolute';
      particleEl.style.width = `${size}px`;
      particleEl.style.height = `${size}px`;
      particleEl.style.backgroundColor = color;
      particleEl.style.borderRadius = '50%';
      particleEl.style.pointerEvents = 'none';
      particleEl.style.boxShadow = `0 0 ${size/2}px ${color}`;
      
      // Calculate starting position (centered on target)
      const startX = position.x || window.innerWidth / 2;
      const startY = position.y || window.innerHeight / 2;
      
      // Create particle data
      const particle = {
        element: particleEl,
        x: startX,
        y: startY,
        vx: (Math.random() * 2 - 1) * 5,
        vy: (Math.random() * 2 - 1) * 5,
        lifetime: this.randomRange(
          this.settings.particleLifetime.min,
          this.settings.particleLifetime.max
        ),
        maxLifetime: this.settings.particleLifetime.max
      };
      
      // Position element
      particleEl.style.left = `${particle.x}px`;
      particleEl.style.top = `${particle.y}px`;
      
      // Add to container
      this.particleContainer.appendChild(particleEl);
      this.activeParticles.push(particle);
    }
  }
  
  /**
   * Create a screen flash effect
   * @param {string} color - Flash color
   * @param {number} opacity - Maximum opacity
   * @param {number} duration - Flash duration in milliseconds
   */
  flashScreen(color, opacity, duration) {
    // Create flash element
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.backgroundColor = color;
    flash.style.opacity = '0';
    flash.style.pointerEvents = 'none';
    flash.style.zIndex = '1000';
    flash.style.transition = `opacity ${duration/2}ms ease-in-out`;
    
    // Add to body
    document.body.appendChild(flash);
    
    // Animate in
    setTimeout(() => {
      flash.style.opacity = opacity.toString();
      
      // Animate out and remove
      setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => {
          if (flash.parentNode) {
            flash.parentNode.removeChild(flash);
          }
        }, duration/2);
      }, duration/2);
    }, 10);
  }
  
  /**
   * Generate a random number in a range
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random number between min and max
   */
  randomRange(min, max) {
    return min + Math.random() * (max - min);
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.FeedbackSystem = FeedbackSystem;
}

// Also support module exports if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FeedbackSystem;
} 