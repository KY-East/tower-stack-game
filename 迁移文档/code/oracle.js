/**
 * Oracle System - Manages prophecy texts and display logic
 * For use in Greek Tower Stacker Game
 */
class Oracle {
  constructor() {
    // Oracle message container
    this.messageElement = document.getElementById('oracle-message');
    
    // Oracle sound effect
    this.oracleSound = document.getElementById('sound-oracle');
    
    // Display state
    this.isDisplaying = false;
    this.displayTimeout = null;
    
    // Last trigger tracking
    this.lastTriggerLevel = 0;
    this.triggerCooldown = 3;
    
    // Level-specific prophecies
    this.levelTriggers = {
      5: "The foundation of wisdom is forming...",
      10: "Patterns begin to emerge in your structure...",
      15: "The tower resonates with ancient knowledge...",
      20: "Balance and precision lead to greater heights...",
      25: "Your creation defies expectations...",
      30: "The structure speaks of your determination..."
    };
    
    // Random prophecy pool
    this.messagePools = [
      "Each layer is a decision solidified...",
      "Perfect alignment is the path to greatness...",
      "Walking the edge between stability and chaos...",
      "Your tower is a physical projection of thought...",
      "Reality is formed through ordered stacking...",
      "Precision is the prerequisite to understanding...",
      "Layer upon layer, like recursive logic...",
      "The structure reflects your inner discipline...",
      "Through challenge comes mastery...",
      "Height is achieved one block at a time..."
    ];
    
    // Precision phrases - simplified to perfect and normal
    this.precisionPhrases = {
      perfect: [
        "Perfect alignment!",
        "Flawless execution!",
        "Masterful precision!",
        "Absolute control!",
        "Perfect symmetry!"
      ],
      normal: [
        "Building continues",
        "Structure holds",
        "Construction advances",
        "Progress maintained"
      ]
    };
  }
  
  /**
   * Display oracle message
   * @param {string} message - Prophecy text
   * @param {number} duration - Display duration in milliseconds
   */
  displayMessage(message, duration = 4000) {
    // Clear previous timeout if exists
    if (this.displayTimeout) {
      clearTimeout(this.displayTimeout);
    }
    
    // Set as displaying
    this.isDisplaying = true;
    
    // Display message with fade-in
    this.messageElement.textContent = message;
    this.messageElement.style.opacity = "1";
    
    // Play oracle sound
    if (this.oracleSound) {
      this.oracleSound.currentTime = 0;
      this.oracleSound.play().catch(e => console.log("Cannot play sound:", e));
    }
    
    // Set timeout to hide message
    this.displayTimeout = setTimeout(() => {
      this.hideMessage();
    }, duration);
    
    return message;
  }
  
  /**
   * Hide oracle message with fade-out
   */
  hideMessage() {
    this.messageElement.style.opacity = "0";
    this.isDisplaying = false;
  }
  
  /**
   * Trigger prophecy based on current tower level
   * @param {number} level - Current tower level
   * @returns {boolean} Whether a prophecy was triggered
   */
  triggerByLevel(level) {
    // Check for level-specific prophecy
    if (this.levelTriggers[level]) {
      this.displayMessage(this.levelTriggers[level], 5000);
      this.lastTriggerLevel = level;
      return true;
    }
    
    // Random prophecy trigger (every 3 levels with 40% chance)
    if (level > this.lastTriggerLevel + this.triggerCooldown && 
        level % 3 === 0 && 
        Math.random() < 0.4) {
      
      const randomMessage = this.messagePools[Math.floor(Math.random() * this.messagePools.length)];
      this.displayMessage(randomMessage);
      this.lastTriggerLevel = level;
      return true;
    }
    
    return false;
  }
  
  /**
   * Get phrase based on block placement precision
   * @param {string} precision - Placement precision (perfect or normal)
   * @returns {string|null} Relevant phrase or null if not found
   */
  getPrecisionPhrase(precision) {
    if (this.precisionPhrases[precision]) {
      return this.precisionPhrases[precision][
        Math.floor(Math.random() * this.precisionPhrases[precision].length)
      ];
    }
    return null;
  }
  
  /**
   * Get ending message based on final tower height
   * @param {number} level - Final tower height
   * @returns {string} Ending message
   */
  getEndingMessage(level) {
    if (level < 5) {
      return "You've only just begun...";
    } else if (level < 10) {
      return "A modest tower, yet promising...";
    } else if (level < 15) {
      return "Your skills are developing well...";
    } else if (level < 20) {
      return "An impressive display of precision...";
    } else if (level < 25) {
      return "A remarkable achievement of balance...";
    } else if (level < 30) {
      return "A masterpiece of concentration and skill...";
    } else {
      return "A legendary structure that few can match...";
    }
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.Oracle = Oracle;
}

// Also support module exports if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Oracle;
} 