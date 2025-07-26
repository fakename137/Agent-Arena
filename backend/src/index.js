const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Agent Arena Fight Club - Backend is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/agents', require('./routes/agents'));
app.use('/api/battles', require('./routes/battles'));
app.use('/api/arena', require('./routes/arena'));
app.use('/api/market', require('./routes/market'));
app.use('/api/spectators', require('./routes/spectators'));

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('🥊 New fighter connected:', socket.id);
  
  // Join arena room
  socket.on('join-arena', (arenaId) => {
    socket.join(`arena-${arenaId}`);
    console.log(`🥊 Fighter ${socket.id} joined arena ${arenaId}`);
  });
  
  // Leave arena room
  socket.on('leave-arena', (arenaId) => {
    socket.leave(`arena-${arenaId}`);
    console.log(`🥊 Fighter ${socket.id} left arena ${arenaId}`);
  });
  
  // Battle updates
  socket.on('battle-action', (data) => {
    socket.to(`arena-${data.arenaId}`).emit('battle-update', data);
  });
  
  // Spectator betting
  socket.on('place-bet', (data) => {
    socket.to(`arena-${data.arenaId}`).emit('bet-placed', data);
  });
  
  socket.on('disconnect', () => {
    console.log('🥊 Fighter disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🥊 Error:', err.stack);
  res.status(500).json({ 
    error: 'Something broke in the underground!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'The first rule of Fight Club is: you do not talk about Fight Club. The second rule of Fight Club is: you DO NOT talk about Fight Club!',
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`
🥊 AGENT ARENA FIGHT CLUB 🥊
================================
🚀 Backend server running on port ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
⏰ Started at: ${new Date().toISOString()}
================================
  `);
});

module.exports = { app, io }; 