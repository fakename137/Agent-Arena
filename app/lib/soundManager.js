export class SoundManager {
  constructor() {
    this.audioContext = null;
    this.audioCache = new Map();
  }

  // Play sound effect
  playSound(soundFile) {
    if (typeof window !== 'undefined') {
      const audio = new Audio(`/sounds/${soundFile}`);
      audio.volume = 0.3;
      audio.play().catch((e) => console.log('Audio play failed:', e));
    }
  }

  // Preload sounds for better performance
  preloadSound(soundFile) {
    if (typeof window !== 'undefined' && !this.audioCache.has(soundFile)) {
      const audio = new Audio(`/sounds/${soundFile}`);
      audio.volume = 0.3;
      this.audioCache.set(soundFile, audio);
    }
  }

  // Play preloaded sound
  playPreloadedSound(soundFile) {
    if (this.audioCache.has(soundFile)) {
      const audio = this.audioCache.get(soundFile);
      audio.currentTime = 0; // Reset to beginning
      audio.play().catch((e) => console.log('Audio play failed:', e));
    } else {
      // Fallback to regular play if not preloaded
      this.playSound(soundFile);
    }
  }

  // Preload all common sounds
  preloadAllSounds() {
    const sounds = [
      'punch.mp3',
      'kick.mp3',
      'special.mp3',
      'combo.mp3',
      'block.mp3',
      'dodge.mp3',
      'taunt.mp3',
      'victory.mp3',
    ];

    sounds.forEach((sound) => this.preloadSound(sound));
  }
}
