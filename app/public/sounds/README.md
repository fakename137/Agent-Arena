# Sounds Directory

This directory contains sound effects for the Agent Arena fighting game.

## 📁 Directory Structure

```
sounds/
├── combat/          # Combat-related sounds
│   ├── punch.mp3    # Punch impact sounds
│   ├── kick.mp3     # Kick impact sounds
│   ├── block.mp3    # Blocking sounds
│   ├── impact.mp3   # General impact sounds
│   ├── whoosh.mp3   # Missed attack sounds
│   └── combo.mp3    # Combo attack sounds
├── ui/              # User interface sounds
│   ├── click.mp3    # Button click sounds
│   ├── victory.mp3  # Victory fanfare
│   ├── defeat.mp3   # Defeat sound
│   └── taunt.mp3    # Taunt button sound
└── characters/      # Character-specific sounds
    ├── grunt.mp3    # Pain/grunt sounds
    ├── breathing.mp3 # Breathing sounds
    └── footsteps.mp3 # Footstep sounds
```

## 🎵 Where to Get Sounds

### Free Resources

1. **Freesound.org** - https://freesound.org/

   - Search: "punch", "kick", "impact", "fighting game"
   - Free with Creative Commons license

2. **OpenGameArt.org** - https://opengameart.org/

   - Game-specific sound effects
   - Various free licenses

3. **Zapsplat** - https://www.zapsplat.com/

   - Professional quality
   - Free with registration

4. **Pixabay** - https://pixabay.com/sound-effects/
   - High quality, no attribution required

### Recommended Search Terms

- "punch impact"
- "kick sound"
- "fighting game"
- "whoosh sound"
- "block shield"
- "UI click"
- "victory fanfare"

## 📋 Required Sounds List

### Combat Sounds (Priority 1)

- [ ] `punch.mp3` - Basic punch sound
- [ ] `kick.mp3` - Basic kick sound
- [ ] `block.mp3` - Blocking sound
- [ ] `impact.mp3` - Heavy impact sound
- [ ] `whoosh.mp3` - Missed attack sound
- [ ] `combo.mp3` - Combo attack sound
- [ ] `special.mp3` - Special move sound

### UI Sounds (Priority 2)

- [ ] `click.mp3` - Button click
- [ ] `victory.mp3` - Victory sound
- [ ] `defeat.mp3` - Defeat sound
- [ ] `taunt.mp3` - Taunt button

### Character Sounds (Priority 3)

- [ ] `grunt.mp3` - Pain/grunt sound
- [ ] `breathing.mp3` - Heavy breathing
- [ ] `footsteps.mp3` - Footstep sounds

## 🎚️ Audio Specifications

### Recommended Format

- **Format**: MP3 or WAV
- **Sample Rate**: 44.1kHz
- **Bit Depth**: 16-bit
- **Channels**: Mono or Stereo
- **File Size**: Keep under 500KB per sound

### Volume Levels

- **Combat sounds**: -12dB to -6dB
- **UI sounds**: -18dB to -12dB
- **Character sounds**: -15dB to -9dB

## 🔧 Implementation Notes

Sounds are loaded in the `SoundManager` class:

```javascript
// Example usage
soundManager.playSound('combat/punch.mp3');
soundManager.playSound('ui/click.mp3');
```

## 📝 License Notes

- Ensure all sounds are properly licensed
- Keep license information in this README
- Credit creators if required by license
