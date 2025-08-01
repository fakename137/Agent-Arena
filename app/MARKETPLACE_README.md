# NFT Character Marketplace

## 🎮 Overview

The NFT Character Marketplace is a new feature that allows users to browse and purchase character NFTs for the Agent Arena fighting game. Each character comes with unique stats, special moves, and rarity levels.

## 🚀 Features

### **3D Character Viewer**

- **Left Panel (50% width)**: Interactive 3D character viewer
- **Same Background**: Uses the same Fight Club basement environment as the main game
- **Animated Characters**: Characters cycle through their combat animations
- **Navigation**: Arrow buttons to browse through different characters

### **Character Details Panel**

- **Right Panel (50% width)**: Detailed character information
- **Character Stats**: Attack, Defense, Speed with visual progress bars
- **Rarity System**: Legendary, Epic, and Rare characters with unique styling
- **Special Moves**: Each character has a unique special ability
- **Minting**: Direct NFT minting for 0.01 ETH per character

## 🎯 Available Characters

### **1. Brad 'The Boss'** (Legendary)

- **Model**: The Boss.fbx
- **Special**: Iron Fist Combo
- **Stats**: Attack 95, Defense 88, Speed 82
- **Price**: 0.01 ETH

### **2. Remy 'The Shadow'** (Epic)

- **Model**: Remy.fbx
- **Special**: Shadow Strike
- **Stats**: Attack 88, Defense 75, Speed 95
- **Price**: 0.01 ETH

### **3. Ch06 'The Warrior'** (Rare)

- **Model**: Ch06_nonPBR.fbx
- **Special**: Warrior's Fury
- **Stats**: Attack 85, Defense 85, Speed 85
- **Price**: 0.01 ETH

### **4. Ch33 'The Destroyer'** (Epic)

- **Model**: Ch33_nonPBR.fbx
- **Special**: Demolition Strike
- **Stats**: Attack 98, Defense 92, Speed 70
- **Price**: 0.01 ETH

### **5. Ch42 'The Phantom'** (Legendary)

- **Model**: Ch42_nonPBR.fbx
- **Special**: Phantom Combo
- **Stats**: Attack 90, Defense 80, Speed 90
- **Price**: 0.01 ETH

## 🎨 Design Features

### **Theme Consistency**

- **Color Scheme**: Same orange (#ff6b35) theme as the main game
- **Typography**: Consistent font styling and text shadows
- **Animations**: Smooth hover effects and transitions
- **Background**: Same Sketchfab basement environment

### **Rarity Styling**

- **Legendary**: Gold gradient with golden glow
- **Epic**: Purple gradient with purple glow
- **Rare**: Blue gradient with blue glow

### **Interactive Elements**

- **Navigation Arrows**: Hover effects with scaling and glow
- **Mint Button**: Gradient background with hover animations
- **Stat Bars**: Animated progress bars with glowing effects
- **Responsive Design**: Mobile-friendly layout

## 🔧 Technical Implementation

### **Three.js Integration**

- **Scene Setup**: Transparent background with proper lighting
- **Character Loading**: FBX model loading with error handling
- **Animation System**: Automatic animation cycling every 3 seconds
- **Performance**: Efficient cleanup and memory management

### **React Components**

- **State Management**: Character index, loading states, and animations
- **Event Handling**: Navigation, minting, and routing
- **Responsive Design**: Mobile and desktop layouts

### **Styling**

- **CSS Modules**: Scoped styling with Marketplace.module.css
- **Animations**: CSS keyframes for loading spinners and transitions
- **Responsive**: Media queries for different screen sizes

## 🚀 Usage

### **Accessing the Marketplace**

1. Navigate to the main page (`/`)
2. Click the "Buy Characters" button in the top-right corner
3. Or directly visit `/marketplace`

### **Browsing Characters**

1. Use the left/right arrow buttons to navigate
2. Watch the 3D character animations
3. View character stats and details on the right panel

### **Minting NFTs**

1. Select your desired character
2. Review the stats and special moves
3. Click "Mint NFT" to purchase for 0.01 ETH
4. (Note: Actual blockchain integration pending)

### **Navigation**

- **"← Back to Arena"**: Returns to the main page
- **"Battle Arena →"**: Goes to the battle selection page

## 🔮 Future Enhancements

### **Blockchain Integration**

- **Smart Contracts**: Actual NFT minting on Etherlink/Tezos L2
- **Wallet Connection**: Integration with 0xSequence wallet
- **Transaction History**: Track purchased characters

### **Additional Features**

- **Character Customization**: Equipment and appearance options
- **Trading System**: Character marketplace for resale
- **Tournament Integration**: Use purchased characters in battles
- **Rarity Bonuses**: Special abilities for higher rarity characters

### **UI Improvements**

- **Character Previews**: Thumbnail grid view option
- **Search/Filter**: Find characters by rarity or stats
- **Favorites**: Save preferred characters
- **Purchase History**: Track previous transactions

## 📁 File Structure

```
app/
├── pages/
│   ├── marketplace.js          # Main marketplace page
│   └── index.js               # Updated with "Buy Characters" button
├── styles/
│   └── Marketplace.module.css # Marketplace styling
└── public/
    ├── characters/            # 3D character models
    └── Animations/           # Character animations
```

## 🎯 Integration Points

### **Main Game**

- **Character Models**: Uses the same FBX models as the battle system
- **Animations**: Reuses existing animation files
- **Styling**: Consistent with the main game's theme

### **Navigation**

- **Home Page**: "Buy Characters" button added
- **Battle System**: Link to battle selection page
- **Routing**: Seamless navigation between pages

## 🐛 Known Issues

1. **Animation Loading**: Some animations may fail to load (graceful fallback)
2. **Mobile Performance**: 3D rendering may be slower on mobile devices
3. **Blockchain Integration**: Minting is currently a placeholder

## 🚀 Getting Started

1. **Install Dependencies**: `npm install`
2. **Run Development Server**: `npm run dev`
3. **Access Marketplace**: Navigate to `/marketplace`
4. **Test Navigation**: Use arrow buttons to browse characters
5. **Test Minting**: Click "Mint NFT" (placeholder functionality)

The marketplace is now fully integrated with the existing Agent Arena game and ready for blockchain integration!
