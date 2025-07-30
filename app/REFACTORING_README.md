# Agent Arena - Refactored Code Structure

This document explains the new organized structure of the Agent Arena fighting game, which has been refactored from a single 1000+ line file into modular, maintainable components.

## 📁 File Structure

```
app/
├── lib/                          # Core game logic modules
│   ├── gameEngine.js            # Three.js setup, rendering, and scene management
│   ├── characterManager.js      # Character loading, animations, and state
│   ├── combatSystem.js          # All combat mechanics (attacks, combos, etc.)
│   ├── soundManager.js          # Audio management and sound effects
│   └── combatLogger.js          # Combat log management
├── hooks/                       # React custom hooks
│   └── useGameState.js          # Game state management (health, loading, etc.)
├── components/                  # React UI components
│   └── GameUI.jsx              # Complete game interface (health bars, controls, etc.)
├── pages/battles/
│   ├── basement.js             # Original monolithic file (unchanged)
│   └── basement-refactored.js  # New modular version
└── styles/
    └── Battle.module.css       # CSS styles including blood effects
```

## 🔧 Module Breakdown

### 1. GameEngine (`lib/gameEngine.js`)

- **Purpose**: Core Three.js setup and rendering
- **Responsibilities**:
  - Scene, camera, and renderer initialization
  - Background iframe setup (Sketchfab)
  - Animation loop management
  - Window resize handling
  - Cleanup and memory management

### 2. CharacterManager (`lib/characterManager.js`)

- **Purpose**: Character and animation management
- **Responsibilities**:
  - Loading Brad and Remy character models
  - Loading and managing all animations
  - Character positioning and state tracking
  - Animation playback control
  - Character reset and idle management

### 3. CombatSystem (`lib/combatSystem.js`)

- **Purpose**: All combat mechanics and interactions
- **Responsibilities**:
  - Attack execution (punch, kick, special moves)
  - Combo system
  - Character movement during attacks
  - Blocking, dodging, and taunting
  - Damage calculation and application
  - Knockout handling
  - Blood effect triggers

### 4. SoundManager (`lib/soundManager.js`)

- **Purpose**: Audio management
- **Responsibilities**:
  - Sound effect playback
  - Audio preloading for performance
  - Volume control
  - Error handling for audio failures

### 5. CombatLogger (`lib/combatLogger.js`)

- **Purpose**: Combat log management
- **Responsibilities**:
  - Storing combat messages
  - Managing log history (last 5 messages)
  - Providing log data to UI

### 6. useGameState (`hooks/useGameState.js`)

- **Purpose**: React state management
- **Responsibilities**:
  - Health tracking for both characters
  - Loading state management
  - Progress tracking for character loading
  - Combat log state
  - Game over detection
  - Winner determination

### 7. GameUI (`components/GameUI.jsx`)

- **Purpose**: Complete game interface
- **Responsibilities**:
  - Health bars display
  - Combat log display
  - All control buttons (attacks, special moves, combos)
  - Loading screen
  - Winner announcement
  - Blood overlay effects

## 🚀 Usage

### Using the Refactored Version

1. **Import the refactored page**:

   ```javascript
   import StreetBattle from './pages/battles/basement-refactored';
   ```

2. **The refactored version maintains exact functionality** as the original, but with:
   - Better code organization
   - Easier maintenance
   - Improved readability
   - Modular architecture
   - Reusable components

### Key Benefits

1. **Maintainability**: Each module has a single responsibility
2. **Testability**: Individual modules can be tested in isolation
3. **Reusability**: Components can be reused in other parts of the app
4. **Readability**: Code is much easier to understand and navigate
5. **Scalability**: Easy to add new features or modify existing ones

## 🔄 Migration Notes

- **No functionality changes**: The refactored version maintains 100% compatibility
- **Same file structure**: All assets and dependencies remain unchanged
- **Same API**: All public methods and interfaces are preserved
- **Performance**: No performance degradation; may actually be better due to optimized structure

## 🛠️ Development

### Adding New Features

1. **New combat moves**: Add to `CombatSystem`
2. **New characters**: Extend `CharacterManager`
3. **New UI elements**: Add to `GameUI`
4. **New sounds**: Extend `SoundManager`
5. **New state**: Add to `useGameState`

### Modifying Existing Features

1. **Combat mechanics**: Edit `CombatSystem`
2. **Character behavior**: Edit `CharacterManager`
3. **UI layout**: Edit `GameUI`
4. **Game state**: Edit `useGameState`

## 📝 Notes

- The original `basement.js` file remains unchanged for reference
- All comments and logic from the original file have been preserved
- The refactored version is production-ready and maintains all original functionality
- The modular structure makes it much easier to debug and extend the game
