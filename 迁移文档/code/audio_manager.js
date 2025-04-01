/**
 * Audio Manager for Greek Tower Stacker Game
 * Handles all game audio including sound effects and background music
 */
class AudioManager {
  constructor() {
    // Audio elements
    this.music = document.getElementById('music');
    this.soundPerfect = document.getElementById('sound-perfect');
    this.soundNormal = document.getElementById('sound-normal');
    this.soundMiss = document.getElementById('sound-miss');
    this.soundOracle = document.getElementById('sound-oracle');
    
    // Audio state
    this.isMuted = false;
    this.musicVolume = 0.5;
    this.sfxVolume = 0.8;
    
    // Initialize
    this.initAudio();
  }
  
  /**
   * Initialize audio settings
   */
  initAudio() {
    // Set initial volumes
    if (this.music) {
      this.music.volume = this.musicVolume;
      this.music.loop = true;
    }
    
    // Sound effects initial volume
    const soundEffects = [this.soundPerfect, this.soundNormal, this.soundMiss, this.soundOracle];
    soundEffects.forEach(sound => {
      if (sound) {
        sound.volume = this.sfxVolume;
      }
    });
    
    // Try to load user preferences from localStorage
    this.loadPreferences();
  }
  
  /**
   * Load audio preferences from localStorage
   */
  loadPreferences() {
    try {
      const savedMute = localStorage.getItem('towerAudioMuted');
      const savedMusicVol = localStorage.getItem('towerMusicVolume');
      const savedSfxVol = localStorage.getItem('towerSfxVolume');
      
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
        this.applyMuteState();
      }
      
      if (savedMusicVol !== null) {
        this.musicVolume = parseFloat(savedMusicVol);
        if (this.music) this.music.volume = this.musicVolume;
      }
      
      if (savedSfxVol !== null) {
        this.sfxVolume = parseFloat(savedSfxVol);
        const soundEffects = [this.soundPerfect, this.soundNormal, this.soundMiss, this.soundOracle];
        soundEffects.forEach(sound => {
          if (sound) sound.volume = this.sfxVolume;
        });
      }
    } catch (e) {
      console.log('Error loading audio preferences:', e);
    }
  }
  
  /**
   * Save audio preferences to localStorage
   */
  savePreferences() {
    try {
      localStorage.setItem('towerAudioMuted', this.isMuted.toString());
      localStorage.setItem('towerMusicVolume', this.musicVolume.toString());
      localStorage.setItem('towerSfxVolume', this.sfxVolume.toString());
    } catch (e) {
      console.log('Error saving audio preferences:', e);
    }
  }
  
  /**
   * Toggle mute state
   * @returns {boolean} New mute state
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.applyMuteState();
    this.savePreferences();
    return this.isMuted;
  }
  
  /**
   * Apply current mute state to all audio elements
   */
  applyMuteState() {
    const allAudio = [this.music, this.soundPerfect, this.soundNormal, this.soundMiss, this.soundOracle];
    allAudio.forEach(audio => {
      if (audio) {
        audio.muted = this.isMuted;
      }
    });
  }
  
  /**
   * Set music volume
   * @param {number} volume - Volume level (0-1)
   */
  setMusicVolume(volume) {
    if (volume < 0) volume = 0;
    if (volume > 1) volume = 1;
    
    this.musicVolume = volume;
    if (this.music) this.music.volume = volume;
    this.savePreferences();
  }
  
  /**
   * Set sound effects volume
   * @param {number} volume - Volume level (0-1)
   */
  setSfxVolume(volume) {
    if (volume < 0) volume = 0;
    if (volume > 1) volume = 1;
    
    this.sfxVolume = volume;
    const soundEffects = [this.soundPerfect, this.soundNormal, this.soundMiss, this.soundOracle];
    soundEffects.forEach(sound => {
      if (sound) sound.volume = volume;
    });
    this.savePreferences();
  }
  
  /**
   * Play background music
   */
  playMusic() {
    if (this.music) {
      this.music.currentTime = 0;
      this.music.play().catch(e => console.log("Cannot play music:", e));
    }
  }
  
  /**
   * Pause background music
   */
  pauseMusic() {
    if (this.music) {
      this.music.pause();
    }
  }
  
  /**
   * Play sound for perfect stack
   */
  playPerfectSound() {
    this.playSound(this.soundPerfect);
  }
  
  /**
   * Play sound for normal stack
   */
  playNormalSound() {
    this.playSound(this.soundNormal);
  }
  
  /**
   * Play sound for missed stack (game over)
   */
  playMissSound() {
    this.playSound(this.soundMiss);
  }
  
  /**
   * Play oracle prophecy sound
   */
  playOracleSound() {
    this.playSound(this.soundOracle);
  }
  
  /**
   * Generic sound play with error handling
   * @param {HTMLAudioElement} sound - Sound element to play
   */
  playSound(sound) {
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(e => console.log("Cannot play sound:", e));
    }
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.AudioManager = AudioManager;
}

// Also support module exports if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioManager;
} 