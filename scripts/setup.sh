#!/bin/bash

# Agent Arena Fight Club - Setup Script
# For Hackathon - 4 Day Deadline to Production

set -e

echo "🥊 Welcome to Agent Arena Fight Club - Underground Setup"
echo "========================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

print_success "Prerequisites check passed!"

# Create .env file from example
print_status "Setting up environment variables..."
if [ -f "env.example" ]; then
    cp env.example .env
    print_success "Environment file created from env.example"
else
    print_warning "env.example not found, creating basic .env file"
    cat > .env << EOF
# Agent Arena Fight Club - Environment Variables
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=sqlite://./agent_arena.db
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# AI/ML Service
AI_ML_SERVICE_URL=http://localhost:5000

# Blockchain (Etherlink/Tezos L2)
BLOCKCHAIN_RPC_URL=https://node.ghostnet.teztnets.xyz
BLOCKCHAIN_PRIVATE_KEY=your-private-key-here
CONTRACT_ADDRESS=your-contract-address-here

# IPFS
IPFS_GATEWAY=https://ipfs.io/ipfs/

# External APIs
COINGECKO_API_URL=https://api.coingecko.com/api/v3
ALPHA_VANTAGE_API_KEY=your-api-key-here

# Monitoring
SENTRY_DSN=your-sentry-dsn-here

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Development
DEBUG=true
HOT_RELOAD=true
EOF
fi

# Create necessary directories
print_status "Creating project directories..."
mkdir -p frontend/public/assets
mkdir -p backend/uploads
mkdir -p backend/logs
mkdir -p ai-ml/models
mkdir -p ai-ml/data
mkdir -p blockchain/contracts
mkdir -p blockchain/scripts
mkdir -p docs/architecture
mkdir -p docs/game-design
mkdir -p docs/development
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p tests/e2e

print_success "Directories created successfully!"

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm install
print_success "Backend dependencies installed!"

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd ../frontend
npm install
print_success "Frontend dependencies installed!"

# Install AI/ML dependencies
print_status "Installing AI/ML dependencies..."
cd ../ai-ml
pip3 install -r requirements.txt
print_success "AI/ML dependencies installed!"

# Create frontend configuration files
print_status "Creating frontend configuration files..."
cd ../frontend

# Create Vite config
cat > vite.config.ts << EOF
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three'],
          router: ['react-router-dom'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'three', 'react-router-dom'],
  },
})
EOF

# Create Tailwind config
cat > tailwind.config.js << EOF
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fight-club': {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        'underground': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        'fight-club': ['Orbitron', 'monospace'],
        'underground': ['Rajdhani', 'sans-serif'],
      },
      animation: {
        'pulse-red': 'pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'damage': 'damage 0.5s ease-in-out',
        'shake': 'shake 0.5s ease-in-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-red': {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '.5',
          },
        },
        'damage': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        'glow': {
          '0%': { boxShadow: '0 0 5px #ef4444, 0 0 10px #ef4444, 0 0 15px #ef4444' },
          '100%': { boxShadow: '0 0 10px #ef4444, 0 0 20px #ef4444, 0 0 30px #ef4444' },
        },
      },
    },
  },
  plugins: [],
}
EOF

# Create PostCSS config
cat > postcss.config.js << EOF
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Create TypeScript config
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

# Create TypeScript node config
cat > tsconfig.node.json << EOF
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF

print_success "Frontend configuration files created!"

# Create backend configuration files
print_status "Creating backend configuration files..."
cd ../backend

# Create package.json if it doesn't exist
if [ ! -f "package.json" ]; then
    cat > package.json << EOF
{
  "name": "agent-arena-backend",
  "version": "1.0.0",
  "description": "Backend for Agent Arena - AI-Powered Crypto Battle Game",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^7.1.5",
    "socket.io": "^4.7.4",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "express-validator": "^7.0.1",
    "axios": "^1.6.2",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "eslint": "^8.55.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
EOF
fi

print_success "Backend configuration files created!"

# Create AI/ML requirements if it doesn't exist
print_status "Creating AI/ML requirements..."
cd ../ai-ml

if [ ! -f "requirements.txt" ]; then
    cat > requirements.txt << EOF
flask==2.3.3
flask-cors==4.0.0
flask-socketio==5.3.6
numpy==1.24.3
pandas==2.0.3
scikit-learn==1.3.0
tensorflow==2.13.0
torch==2.0.1
transformers==4.33.2
requests==2.31.0
python-dotenv==1.0.0
gunicorn==21.2.0
eventlet==0.33.3
EOF
fi

print_success "AI/ML requirements created!"

# Create Docker Compose file
print_status "Creating Docker Compose configuration..."
cd ..

cat > docker-compose.yml << EOF
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend
      - ai-ml

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - PORT=5000
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - redis
      - ai-ml

  ai-ml:
    build:
      context: ./ai-ml
      dockerfile: Dockerfile
    ports:
      - "5001:5000"
    environment:
      - FLASK_ENV=development
    volumes:
      - ./ai-ml:/app

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: agent_arena
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  redis_data:
  postgres_data:
EOF

print_success "Docker Compose configuration created!"

# Create development scripts
print_status "Creating development scripts..."
cat > scripts/dev.sh << 'EOF'
#!/bin/bash

# Agent Arena Fight Club - Development Script
echo "🥊 Starting Agent Arena Fight Club Development Environment"
echo "=========================================================="

# Start backend
echo "Starting backend server..."
cd backend && npm run dev &
BACKEND_PID=$!

# Start AI/ML service
echo "Starting AI/ML service..."
cd ../ai-ml && python3 app.py &
AI_ML_PID=$!

# Start frontend
echo "Starting frontend development server..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo "All services started!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
echo "AI/ML: http://localhost:5001"

# Wait for user to stop
echo "Press Ctrl+C to stop all services"
trap "kill $BACKEND_PID $AI_ML_PID $FRONTEND_PID; exit" INT
wait
EOF

chmod +x scripts/dev.sh

cat > scripts/build.sh << 'EOF'
#!/bin/bash

# Agent Arena Fight Club - Build Script
echo "🥊 Building Agent Arena Fight Club for Production"
echo "=================================================="

# Build frontend
echo "Building frontend..."
cd frontend
npm run build
cd ..

# Build backend
echo "Building backend..."
cd backend
npm install --production
cd ..

# Build AI/ML
echo "Building AI/ML service..."
cd ai-ml
pip3 install -r requirements.txt
cd ..

echo "Build completed successfully!"
echo "Ready for deployment!"
EOF

chmod +x scripts/build.sh

print_success "Development scripts created!"

# Final setup
print_status "Finalizing setup..."

# Create a quick start guide
cat > QUICK_START.md << EOF
# Agent Arena Fight Club - Quick Start Guide

## 🥊 Welcome to the Underground

### Prerequisites
- Node.js 18+
- Python 3.8+
- npm or yarn

### Quick Start

1. **Install Dependencies**
   \`\`\`bash
   ./scripts/setup.sh
   \`\`\`

2. **Start Development Environment**
   \`\`\`bash
   ./scripts/dev.sh
   \`\`\`

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - AI/ML Service: http://localhost:5001

### Development Commands

- \`npm run dev\` - Start frontend development server
- \`npm run build\` - Build frontend for production
- \`npm run test\` - Run tests
- \`npm run lint\` - Run linting

### Project Structure

\`\`\`
agent-arena/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Node.js + Express
├── ai-ml/            # Python + Flask
├── blockchain/       # Smart contracts
├── docs/             # Documentation
└── scripts/          # Build and setup scripts
\`\`\`

### Features Implemented

✅ 3D Battle Arena with Three.js
✅ Real-time WebSocket communication
✅ Agent management system
✅ Battle mechanics and AI
✅ Spectator betting system
✅ User authentication
✅ Responsive UI with Tailwind CSS
✅ Fight Club theming throughout

### Next Steps for Hackathon

1. **Day 1-2**: Core functionality and UI polish
2. **Day 3**: Testing and bug fixes
3. **Day 4**: Deployment and final touches

### Deployment

\`\`\`bash
./scripts/build.sh
docker-compose up -d
\`\`\`

---

**Remember the Rules of the Underground:**
- First rule: You do not talk about Agent Arena
- Second rule: You DO NOT talk about Agent Arena
- Third rule: If someone says "stop" or goes limp, the battle is over
- Fourth rule: Only two agents to a battle
- Fifth rule: One battle at a time
- Sixth rule: No shirts, no shoes, no mercy
- Seventh rule: Battles will go on as long as they have to
- Eighth rule: If this is your first night at Agent Arena, you have to fight

Good luck, fighter! 🥊
EOF

print_success "Quick start guide created!"

# Set permissions
chmod +x scripts/*.sh

print_success "Setup completed successfully!"
echo ""
echo "🥊 Agent Arena Fight Club is ready for battle!"
echo "=============================================="
echo ""
echo "Next steps:"
echo "1. Review the .env file and update configuration"
echo "2. Run './scripts/dev.sh' to start development"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Remember: The underground awaits, fighter! 🥊"
echo ""
print_warning "Don't forget to update the .env file with your actual configuration values!"
