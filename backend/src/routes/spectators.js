const express = require('express');
const router = express.Router();

// Mock spectators database (replace with actual database)
let spectators = [
  {
    id: 1,
    username: 'narrator',
    email: 'narrator@fightclub.com',
    joinDate: '1999-10-15',
    totalBets: 1250,
    totalWinnings: 8500,
    favoriteAgent: 'Tyler Durden',
    rank: 'Veteran',
    isActive: true,
    stats: {
      battlesWatched: 156,
      betsPlaced: 89,
      correctPredictions: 67,
      accuracy: 75.3
    }
  },
  {
    id: 2,
    username: 'marla_singer',
    email: 'marla@fightclub.com',
    joinDate: '2000-03-20',
    totalBets: 890,
    totalWinnings: 6200,
    favoriteAgent: 'Marla Singer',
    rank: 'Apprentice',
    isActive: true,
    stats: {
      battlesWatched: 98,
      betsPlaced: 45,
      correctPredictions: 32,
      accuracy: 71.1
    }
  }
];

// Mock bets database
let bets = [
  {
    id: 1,
    spectatorId: 1,
    battleId: 1,
    agentId: 1,
    amount: 500,
    odds: 1.8,
    status: 'won',
    payout: 900,
    placedAt: '2024-01-15T19:55:00Z',
    resolvedAt: '2024-01-15T20:03:00Z'
  },
  {
    id: 2,
    spectatorId: 2,
    battleId: 1,
    agentId: 2,
    amount: 300,
    odds: 2.2,
    status: 'lost',
    payout: 0,
    placedAt: '2024-01-15T19:56:00Z',
    resolvedAt: '2024-01-15T20:03:00Z'
  }
];

// @route   GET /api/spectators
// @desc    Get all spectators
// @access  Public
router.get('/', (req, res) => {
  try {
    const { rank, limit = 20, offset = 0 } = req.query;
    
    let filteredSpectators = [...spectators];
    
    // Apply filters
    if (rank) {
      filteredSpectators = filteredSpectators.filter(spec => spec.rank === rank);
    }
    
    // Apply pagination
    const paginatedSpectators = filteredSpectators.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
      message: 'Spectators of the underground',
      spectators: paginatedSpectators,
      total: filteredSpectators.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
  } catch (error) {
    console.error('🥊 Get spectators error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   GET /api/spectators/:id
// @desc    Get spectator by ID
// @access  Public
router.get('/:id', (req, res) => {
  try {
    const spectatorId = parseInt(req.params.id);
    const spectator = spectators.find(s => s.id === spectatorId);
    
    if (!spectator) {
      return res.status(404).json({ 
        error: 'Spectator not found in the underground' 
      });
    }
    
    // Get spectator's betting history
    const bettingHistory = bets.filter(bet => bet.spectatorId === spectatorId);
    
    res.json({
      message: 'Spectator details',
      spectator: {
        ...spectator,
        bettingHistory: bettingHistory
      }
    });
    
  } catch (error) {
    console.error('🥊 Get spectator error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   POST /api/spectators
// @desc    Register a new spectator
// @access  Public
router.post('/', (req, res) => {
  try {
    const { username, email } = req.body;
    
    // Validate required fields
    if (!username || !email) {
      return res.status(400).json({ 
        error: 'Username and email are required to join the underground as a spectator' 
      });
    }
    
    // Check if spectator already exists
    const existingSpectator = spectators.find(s => s.email === email || s.username === username);
    if (existingSpectator) {
      return res.status(400).json({ 
        error: 'A spectator with this name or email already exists in the underground' 
      });
    }
    
    // Create new spectator
    const newSpectator = {
      id: spectators.length + 1,
      username,
      email,
      joinDate: new Date().toISOString().split('T')[0],
      totalBets: 0,
      totalWinnings: 0,
      favoriteAgent: null,
      rank: 'Novice',
      isActive: true,
      stats: {
        battlesWatched: 0,
        betsPlaced: 0,
        correctPredictions: 0,
        accuracy: 0
      }
    };
    
    spectators.push(newSpectator);
    
    res.status(201).json({
      message: 'Welcome to the underground as a spectator!',
      spectator: newSpectator
    });
    
  } catch (error) {
    console.error('🥊 Create spectator error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   POST /api/spectators/:id/bet
// @desc    Place a bet
// @access  Private
router.post('/:id/bet', (req, res) => {
  try {
    const spectatorId = parseInt(req.params.id);
    const { battleId, agentId, amount } = req.body;
    
    // Validate spectator exists
    const spectator = spectators.find(s => s.id === spectatorId);
    if (!spectator) {
      return res.status(404).json({ 
        error: 'Spectator not found in the underground' 
      });
    }
    
    // Validate required fields
    if (!battleId || !agentId || !amount) {
      return res.status(400).json({ 
        error: 'Battle ID, agent ID, and amount are required to place a bet' 
      });
    }
    
    // Validate bet amount
    if (amount <= 0) {
      return res.status(400).json({ 
        error: 'Bet amount must be greater than 0' 
      });
    }
    
    // Check if spectator has enough funds (mock)
    if (amount > 1000) {
      return res.status(400).json({ 
        error: 'Insufficient funds for this bet' 
      });
    }
    
    // Calculate odds based on agent stats (mock)
    const odds = 1.5 + Math.random() * 1.5; // 1.5 to 3.0
    
    // Create new bet
    const newBet = {
      id: bets.length + 1,
      spectatorId,
      battleId,
      agentId,
      amount: parseInt(amount),
      odds: Math.round(odds * 100) / 100,
      status: 'pending',
      payout: 0,
      placedAt: new Date().toISOString(),
      resolvedAt: null
    };
    
    bets.push(newBet);
    
    // Update spectator stats
    spectator.totalBets += parseInt(amount);
    spectator.stats.betsPlaced++;
    
    res.status(201).json({
      message: 'Your bet has been placed in the underground!',
      bet: newBet,
      spectator: spectator
    });
    
  } catch (error) {
    console.error('🥊 Place bet error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   GET /api/spectators/:id/bets
// @desc    Get spectator's betting history
// @access  Public
router.get('/:id/bets', (req, res) => {
  try {
    const spectatorId = parseInt(req.params.id);
    const { status, limit = 20, offset = 0 } = req.query;
    
    // Validate spectator exists
    const spectator = spectators.find(s => s.id === spectatorId);
    if (!spectator) {
      return res.status(404).json({ 
        error: 'Spectator not found in the underground' 
      });
    }
    
    let filteredBets = bets.filter(bet => bet.spectatorId === spectatorId);
    
    // Apply filters
    if (status) {
      filteredBets = filteredBets.filter(bet => bet.status === status);
    }
    
    // Apply pagination
    const paginatedBets = filteredBets.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
      message: 'Betting history from the underground',
      spectator: spectator.username,
      bets: paginatedBets,
      total: filteredBets.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
  } catch (error) {
    console.error('🥊 Get betting history error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   PUT /api/spectators/:id/favorite
// @desc    Set favorite agent
// @access  Private
router.put('/:id/favorite', (req, res) => {
  try {
    const spectatorId = parseInt(req.params.id);
    const { agentName } = req.body;
    
    const spectatorIndex = spectators.findIndex(s => s.id === spectatorId);
    if (spectatorIndex === -1) {
      return res.status(404).json({ 
        error: 'Spectator not found in the underground' 
      });
    }
    
    spectators[spectatorIndex].favoriteAgent = agentName;
    
    res.json({
      message: 'Favorite agent updated',
      spectator: spectators[spectatorIndex]
    });
    
  } catch (error) {
    console.error('🥊 Update favorite agent error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   GET /api/spectators/stats/leaderboard
// @desc    Get spectator leaderboard
// @access  Public
router.get('/stats/leaderboard', (req, res) => {
  try {
    const { type = 'winnings' } = req.query;
    
    let sortedSpectators = [...spectators];
    
    // Sort based on type
    switch (type) {
      case 'winnings':
        sortedSpectators.sort((a, b) => b.totalWinnings - a.totalWinnings);
        break;
      case 'accuracy':
        sortedSpectators.sort((a, b) => b.stats.accuracy - a.stats.accuracy);
        break;
      case 'battles':
        sortedSpectators.sort((a, b) => b.stats.battlesWatched - a.stats.battlesWatched);
        break;
      case 'bets':
        sortedSpectators.sort((a, b) => b.stats.betsPlaced - a.stats.betsPlaced);
        break;
      default:
        sortedSpectators.sort((a, b) => b.totalWinnings - a.totalWinnings);
    }
    
    const leaderboard = sortedSpectators.slice(0, 10).map((spec, index) => ({
      rank: index + 1,
      username: spec.username,
      rank: spec.rank,
      totalWinnings: spec.totalWinnings,
      accuracy: spec.stats.accuracy,
      battlesWatched: spec.stats.battlesWatched,
      betsPlaced: spec.stats.betsPlaced
    }));
    
    res.json({
      message: 'Underground spectator leaderboard',
      type: type,
      leaderboard: leaderboard
    });
    
  } catch (error) {
    console.error('🥊 Spectator leaderboard error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   GET /api/spectators/stats/overview
// @desc    Get spectator statistics overview
// @access  Public
router.get('/stats/overview', (req, res) => {
  try {
    const totalSpectators = spectators.length;
    const activeSpectators = spectators.filter(s => s.isActive).length;
    const totalBetsPlaced = spectators.reduce((sum, s) => sum + s.stats.betsPlaced, 0);
    const totalWinnings = spectators.reduce((sum, s) => sum + s.totalWinnings, 0);
    const totalBattlesWatched = spectators.reduce((sum, s) => sum + s.stats.battlesWatched, 0);
    
    const averageAccuracy = spectators.length > 0 
      ? spectators.reduce((sum, s) => sum + s.stats.accuracy, 0) / spectators.length 
      : 0;
    
    const rankDistribution = {
      Novice: spectators.filter(s => s.rank === 'Novice').length,
      Apprentice: spectators.filter(s => s.rank === 'Apprentice').length,
      Veteran: spectators.filter(s => s.rank === 'Veteran').length,
      Master: spectators.filter(s => s.rank === 'Master').length,
      Legend: spectators.filter(s => s.rank === 'Legend').length
    };
    
    const topEarner = spectators.reduce((max, s) => 
      s.totalWinnings > max.totalWinnings ? s : max
    );
    
    const mostAccurate = spectators.reduce((max, s) => 
      s.stats.accuracy > max.stats.accuracy ? s : max
    );
    
    res.json({
      message: 'Underground spectator statistics',
      overview: {
        totalSpectators,
        activeSpectators,
        totalBetsPlaced,
        totalWinnings,
        totalBattlesWatched,
        averageAccuracy: Math.round(averageAccuracy * 100) / 100
      },
      rankDistribution,
      highlights: {
        topEarner: {
          username: topEarner.username,
          winnings: topEarner.totalWinnings
        },
        mostAccurate: {
          username: mostAccurate.username,
          accuracy: mostAccurate.stats.accuracy
        }
      }
    });
    
  } catch (error) {
    console.error('🥊 Spectator stats error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   POST /api/spectators/:id/chat
// @desc    Send chat message during battle
// @access  Private
router.post('/:id/chat', (req, res) => {
  try {
    const spectatorId = parseInt(req.params.id);
    const { battleId, message } = req.body;
    
    // Validate spectator exists
    const spectator = spectators.find(s => s.id === spectatorId);
    if (!spectator) {
      return res.status(404).json({ 
        error: 'Spectator not found in the underground' 
      });
    }
    
    // Validate message
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Message cannot be empty' 
      });
    }
    
    if (message.length > 200) {
      return res.status(400).json({ 
        error: 'Message too long. Keep it under 200 characters.' 
      });
    }
    
    // Create chat message
    const chatMessage = {
      id: Date.now(),
      spectatorId,
      spectatorName: spectator.username,
      battleId,
      message: message.trim(),
      timestamp: new Date().toISOString()
    };
    
    res.json({
      message: 'Your message has been sent to the underground!',
      chatMessage
    });
    
  } catch (error) {
    console.error('🥊 Send chat message error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

module.exports = router; 