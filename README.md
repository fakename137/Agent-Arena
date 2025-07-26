# 🥊 Agent Arena Fight Club

> _"The first rule of Agent Arena: you do not talk about Agent Arena. The second rule of Agent Arena: you DO NOT talk about Agent Arena."_

A revolutionary AI-powered crypto battle game where autonomous agents representing different cryptocurrencies fight in real-time 3D arenas. Built with cutting-edge technology and inspired by the underground spirit of Fight Club.

## 🌟 Features

### 🥊 **Autonomous AI Battles**

- AI agents with unique personalities based on crypto characteristics
- Real-time decision making influenced by live market data
- Dynamic battle strategies that evolve through experience

### 💰 **Crypto Integration**

- Live market data affects battle outcomes
- Bitcoin, Ethereum, Altcoin, and Stablecoin agent types
- Market sentiment influences agent performance and abilities

### 🏟️ **Underground Arenas**

- Multiple themed battle arenas with unique atmospheres
- Real-time spectator system with betting capabilities
- Dynamic lighting and environmental effects

### 🎮 **Spectator Economy**

- Bet on battles with real-time odds
- Watch live fights with chat functionality
- Leaderboards and statistics tracking

### 🤖 **AI Training System**

- Train your agents to improve their abilities
- Unlock new special moves and strategies
- Experience-based progression system

## 🏗️ Architecture

```
Agent Arena Fight Club
├── 🎨 Frontend (React + TypeScript + Vite)
│   ├── 3D Battle Visualization (Three.js)
│   ├── Real-time WebSocket connections
│   └── Fight Club themed UI/UX
├── ⚙️ Backend (Node.js + Express)
│   ├── RESTful API with Fight Club endpoints
│   ├── WebSocket server for real-time updates
│   └── Authentication and user management
├── 🤖 AI/ML Service (Python + Flask)
│   ├── Autonomous agent decision making
│   ├── Battle engine and combat resolution
│   └── Market data integration
└── ⛓️ Blockchain (Etherlink/Tezos L2)
    ├── NFT agent ownership
    ├── Battle rewards and betting
    └── Decentralized governance
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **Python** 3.9+
- **Docker** (optional)
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/agent-arena.git
   cd agent-arena
   ```

2. **Run the setup script**

   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

3. **Configure environment**

   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development servers**

   **Terminal 1 - Backend (Port 8000)**

   ```bash
   cd backend
   npm run dev
   ```

   **Terminal 2 - AI Service (Port 5000)**

   ```bash
   cd ai-ml
   source venv/bin/activate
   python app.py
   ```

   **Terminal 3 - Frontend (Port 3000)**

   ```bash
   cd frontend
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🥊 Game Mechanics

### Agent Types

| Type           | Characteristics         | Special Move     | Base Stats               |
| -------------- | ----------------------- | ---------------- | ------------------------ |
| **Bitcoin**    | Conservative, Defensive | Diamond Hands    | High Defense, Low Speed  |
| **Ethereum**   | Intelligent, Adaptive   | Gas Optimization | High Speed, Balanced     |
| **Altcoin**    | Aggressive, Volatile    | Moon Shot        | High Attack, Low Defense |
| **Stablecoin** | Stable, Reliable        | Peg Stability    | Balanced, High Health    |

### Battle System

- **Real-time Combat**: Agents make decisions every round
- **Market Influence**: Live crypto prices affect battle dynamics
- **Personality Traits**: Each agent type has unique behavioral patterns
- **Special Moves**: Unlock powerful abilities through training
- **Environmental Effects**: Arena conditions impact performance

### Training System

- **Strength Training**: Increases attack power
- **Agility Training**: Improves speed and evasion
- **Intelligence Training**: Enhances special move effectiveness
- **Charisma Training**: Boosts overall performance

## 🛠️ Development

### Project Structure

```
agent-arena/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── store/          # State management
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
│   └── logs/               # Application logs
├── ai-ml/                   # Python AI/ML service
│   ├── models/             # AI models and training
│   ├── data/               # Training data
│   └── utils/              # AI utilities
├── blockchain/              # Smart contracts
│   ├── contracts/          # Solidity contracts
│   └── scripts/            # Deployment scripts
└── docs/                    # Documentation
```

### API Endpoints

#### Authentication

- `POST /api/auth/register` - Register new fighter
- `POST /api/auth/login` - Authenticate fighter
- `GET /api/auth/profile` - Get fighter profile

#### Agents

- `GET /api/agents` - List all agents
- `POST /api/agents` - Create new agent
- `PUT /api/agents/:id/train` - Train agent
- `GET /api/agents/:id` - Get agent details

#### Battles

- `GET /api/battles` - List all battles
- `POST /api/battles` - Create new battle
- `PUT /api/battles/:id/action` - Execute battle action
- `GET /api/battles/:id` - Get battle details

#### Arenas

- `GET /api/arena` - List all arenas
- `GET /api/arena/:id` - Get arena details
- `PUT /api/arena/:id/spectate` - Join arena as spectator

#### Market

- `GET /api/market/prices` - Get crypto prices
- `GET /api/market/sentiment` - Get market sentiment
- `GET /api/market/battle-effects` - Get market effects on battles

### Environment Variables

```bash
# Application
NODE_ENV=development
PORT=8000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/agent_arena
REDIS_URL=redis://localhost:6379

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# AI/ML Service
AI_SERVICE_URL=http://localhost:5000
FLASK_ENV=development

# Blockchain
BLOCKCHAIN_RPC_URL=https://node.etherlink.com
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
```

## 🧪 Testing

### Run Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test

# AI/ML tests
cd ai-ml
python -m pytest tests/
```

### E2E Testing

```bash
# Start all services
docker-compose up -d

# Run E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individual services
docker build -t agent-arena-frontend ./frontend
docker build -t agent-arena-backend ./backend
docker build -t agent-arena-ai ./ai-ml
```

### Production Deployment

1. **Set up environment variables**
2. **Deploy smart contracts**
3. **Start services**
4. **Configure reverse proxy**
5. **Set up monitoring**

## 🤝 Contributing

We welcome contributions to the underground! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Style

- **Frontend**: ESLint + Prettier
- **Backend**: ESLint + Prettier
- **Python**: Black + Flake8
- **Smart Contracts**: Solhint

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🥊 Community

- **Discord**: [Join our underground community](https://discord.gg/agent-arena)
- **Twitter**: [@AgentArena](https://twitter.com/AgentArena)
- **Documentation**: [docs.agent-arena.com](https://docs.agent-arena.com)

## 🙏 Acknowledgments

- Inspired by the revolutionary spirit of Fight Club
- Built with modern web technologies
- Powered by AI and blockchain innovation

---

_"The things you own end up owning you." - Tyler Durden_

_"In Agent Arena, the agents you create end up creating you."_
