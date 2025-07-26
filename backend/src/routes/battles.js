const express = require('express');
const router = express.Router();

// Mock battles database (replace with actual database)
let battles = [
  {
    id: 1,
    arenaId: 'basement-1',
    agent1: {
      id: 1,
      name: 'Tyler Durden',
      type: 'bitcoin',
      health: 100,
      attack: 95,
      defense: 90,
      speed: 85
    },
    agent2: {
      id: 2,
      name: 'Marla Singer',
      type: 'ethereum',
      health: 85,
      attack: 90,
      defense: 80,
      speed: 95
    },
    status: 'completed',
    winner: 1,
    duration: 180,
    rounds: 12,
    spectators: 156,
    totalBets: 2500,
    createdAt: '2024-01-15T20:00:00Z',
    completedAt: '2024-01-15T20:03:00Z',
    events: [
      { round: 1, action: 'Tyler Durden uses Diamond Hands', damage: 25 },
      { round: 2, action: 'Marla Singer dodges and counters', damage: 20 },
      { round: 3, action: 'Tyler Durden blocks attack', damage: 0 },
      { round: 4, action: 'Marla Singer uses Gas Optimization', damage: 30 },
      { round: 5, action: 'Tyler Durden lands critical hit', damage: 35 },
      { round: 6, action: 'Marla Singer health critical', damage: 15 },
      { round: 7, action: 'Tyler Durden wins by knockout', damage: 40 }
    ],
    marketData: {
      bitcoinPrice: 42000,
      ethereumPrice: 2800,
      bitcoinChange: 2.5,
      ethereumChange: -1.2
    }
  }
];

// @route   GET /api/battles
// @desc    Get all battles (with optional filtering)
// @access  Public
router.get('/', (req, res) => {
  try {
    const { status, agentId, limit = 20, offset = 0 } = req.query;
    
    let filteredBattles = [...battles];
    
    // Apply filters
    if (status) {
      filteredBattles = filteredBattles.filter(battle => battle.status === status);
    }
    
    if (agentId) {
      filteredBattles = filteredBattles.filter(battle => 
        battle.agent1.id === parseInt(agentId) || battle.agent2.id === parseInt(agentId)
      );
    }
    
    // Apply pagination
    const paginatedBattles = filteredBattles.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
      message: 'Fights of the underground',
      battles: paginatedBattles,
      total: filteredBattles.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
  } catch (error) {
    console.error('🥊 Get battles error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   GET /api/battles/:id
// @desc    Get battle by ID
// @access  Public
router.get('/:id', (req, res) => {
  try {
    const battleId = parseInt(req.params.id);
    const battle = battles.find(b => b.id === battleId);
    
    if (!battle) {
      return res.status(404).json({ 
        error: 'Fight not found in the underground' 
      });
    }
    
    res.json({
      message: 'Fight details',
      battle
    });
    
  } catch (error) {
    console.error('🥊 Get battle error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   POST /api/battles
// @desc    Create a new battle
// @access  Private
router.post('/', (req, res) => {
  try {
    const { agent1Id, agent2Id, arenaId } = req.body;
    
    // Validate required fields
    if (!agent1Id || !agent2Id || !arenaId) {
      return res.status(400).json({ 
        error: 'Both fighters and arena are required to start a fight' 
      });
    }
    
    // Check if agents exist (mock data for now)
    const agent1 = { id: agent1Id, name: 'Fighter 1', type: 'bitcoin', health: 100, attack: 80, defense: 85, speed: 75 };
    const agent2 = { id: agent2Id, name: 'Fighter 2', type: 'ethereum', health: 85, attack: 90, defense: 80, speed: 95 };
    
    // Check if agents are available for battle
    const activeBattles = battles.filter(b => b.status === 'active');
    const agent1InBattle = activeBattles.some(b => 
      b.agent1.id === agent1Id || b.agent2.id === agent1Id
    );
    const agent2InBattle = activeBattles.some(b => 
      b.agent1.id === agent2Id || b.agent2.id === agent2Id
    );
    
    if (agent1InBattle) {
      return res.status(400).json({ 
        error: 'Fighter 1 is already in another fight' 
      });
    }
    
    if (agent2InBattle) {
      return res.status(400).json({ 
        error: 'Fighter 2 is already in another fight' 
      });
    }
    
    // Create new battle
    const newBattle = {
      id: battles.length + 1,
      arenaId,
      agent1,
      agent2,
      status: 'active',
      winner: null,
      duration: 0,
      rounds: 0,
      spectators: 0,
      totalBets: 0,
      createdAt: new Date().toISOString(),
      completedAt: null,
      events: [],
      marketData: {
        bitcoinPrice: 42000,
        ethereumPrice: 2800,
        bitcoinChange: 0,
        ethereumChange: 0
      }
    };
    
    battles.push(newBattle);
    
    res.status(201).json({
      message: 'The fight has begun in the underground!',
      battle: newBattle
    });
    
  } catch (error) {
    console.error('🥊 Create battle error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   PUT /api/battles/:id/action
// @desc    Perform a battle action
// @access  Private
router.put('/:id/action', (req, res) => {
  try {
    const battleId = parseInt(req.params.id);
    const { agentId, action, target } = req.body;
    
    const battleIndex = battles.findIndex(b => b.id === battleId);
    if (battleIndex === -1) {
      return res.status(404).json({ 
        error: 'Fight not found in the underground' 
      });
    }
    
    const battle = battles[battleIndex];
    
    if (battle.status !== 'active') {
      return res.status(400).json({ 
        error: 'This fight has already ended' 
      });
    }
    
    // Determine which agent is acting
    const actingAgent = battle.agent1.id === agentId ? battle.agent1 : battle.agent2;
    const targetAgent = battle.agent1.id === agentId ? battle.agent2 : battle.agent1;
    
    if (!actingAgent) {
      return res.status(400).json({ 
        error: 'Invalid fighter ID' 
      });
    }
    
    // Calculate damage based on action and stats
    let damage = 0;
    let actionDescription = '';
    
    switch (action) {
      case 'attack':
        damage = Math.floor(actingAgent.attack * (0.8 + Math.random() * 0.4));
        actionDescription = `${actingAgent.name} attacks ${targetAgent.name}`;
        break;
      case 'special':
        damage = Math.floor(actingAgent.attack * (1.2 + Math.random() * 0.6));
        actionDescription = `${actingAgent.name} uses special move`;
        break;
      case 'block':
        damage = 0;
        actionDescription = `${actingAgent.name} blocks attack`;
        break;
      case 'dodge':
        damage = 0;
        actionDescription = `${actingAgent.name} dodges attack`;
        break;
      default:
        return res.status(400).json({ 
          error: 'Invalid action. Choose: attack, special, block, or dodge' 
        });
    }
    
    // Apply damage
    targetAgent.health = Math.max(0, targetAgent.health - damage);
    
    // Add event to battle log
    battle.events.push({
      round: battle.rounds + 1,
      action: actionDescription,
      damage: damage,
      timestamp: new Date().toISOString()
    });
    
    battle.rounds++;
    battle.duration = Math.floor((new Date() - new Date(battle.createdAt)) / 1000);
    
    // Check for battle end
    if (targetAgent.health <= 0) {
      battle.status = 'completed';
      battle.winner = actingAgent.id;
      battle.completedAt = new Date().toISOString();
      
      // Update agent stats (mock)
      actingAgent.totalBattles++;
      actingAgent.wins++;
      targetAgent.totalBattles++;
      targetAgent.losses++;
    }
    
    res.json({
      message: 'Action executed in the underground!',
      battle: battle,
      action: {
        agent: actingAgent.name,
        action: action,
        damage: damage,
        targetHealth: targetAgent.health
      }
    });
    
  } catch (error) {
    console.error('🥊 Battle action error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   PUT /api/battles/:id/spectate
// @desc    Join battle as spectator
// @access  Public
router.put('/:id/spectate', (req, res) => {
  try {
    const battleId = parseInt(req.params.id);
    const { spectatorId } = req.body;
    
    const battleIndex = battles.findIndex(b => b.id === battleId);
    if (battleIndex === -1) {
      return res.status(404).json({ 
        error: 'Fight not found in the underground' 
      });
    }
    
    battles[battleIndex].spectators++;
    
    res.json({
      message: 'You have joined the underground fight as a spectator!',
      spectators: battles[battleIndex].spectators
    });
    
  } catch (error) {
    console.error('🥊 Spectate battle error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   POST /api/battles/:id/bet
// @desc    Place a bet on a battle
// @access  Private
router.post('/:id/bet', (req, res) => {
  try {
    const battleId = parseInt(req.params.id);
    const { agentId, amount, bettorId } = req.body;
    
    const battleIndex = battles.findIndex(b => b.id === battleId);
    if (battleIndex === -1) {
      return res.status(404).json({ 
        error: 'Fight not found in the underground' 
      });
    }
    
    const battle = battles[battleIndex];
    
    if (battle.status !== 'active') {
      return res.status(400).json({ 
        error: 'Cannot bet on a completed fight' 
      });
    }
    
    // Validate bet amount
    if (amount <= 0) {
      return res.status(400).json({ 
        error: 'Bet amount must be greater than 0' 
      });
    }
    
    // Add bet to battle
    battle.totalBets += amount;
    
    res.json({
      message: 'Your bet has been placed in the underground!',
      bet: {
        battleId: battleId,
        agentId: agentId,
        amount: amount,
        bettorId: bettorId
      },
      totalBets: battle.totalBets
    });
    
  } catch (error) {
    console.error('🥊 Place bet error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   GET /api/battles/stats/leaderboard
// @desc    Get battle statistics and leaderboard
// @access  Public
router.get('/stats/leaderboard', (req, res) => {
  try {
    // Calculate agent statistics from battles
    const agentStats = {};
    
    battles.forEach(battle => {
      if (battle.status === 'completed') {
        // Agent 1 stats
        if (!agentStats[battle.agent1.id]) {
          agentStats[battle.agent1.id] = {
            id: battle.agent1.id,
            name: battle.agent1.name,
            wins: 0,
            losses: 0,
            totalBattles: 0,
            totalDamage: 0
          };
        }
        
        // Agent 2 stats
        if (!agentStats[battle.agent2.id]) {
          agentStats[battle.agent2.id] = {
            id: battle.agent2.id,
            name: battle.agent2.name,
            wins: 0,
            losses: 0,
            totalBattles: 0,
            totalDamage: 0
          };
        }
        
        agentStats[battle.agent1.id].totalBattles++;
        agentStats[battle.agent2.id].totalBattles++;
        
        if (battle.winner === battle.agent1.id) {
          agentStats[battle.agent1.id].wins++;
          agentStats[battle.agent2.id].losses++;
        } else {
          agentStats[battle.agent2.id].wins++;
          agentStats[battle.agent1.id].losses++;
        }
      }
    });
    
    // Convert to array and sort by wins
    const leaderboard = Object.values(agentStats)
      .sort((a, b) => b.wins - a.wins)
      .slice(0, 10);
    
    res.json({
      message: 'Underground fight club leaderboard',
      leaderboard: leaderboard,
      totalBattles: battles.filter(b => b.status === 'completed').length,
      totalSpectators: battles.reduce((sum, b) => sum + b.spectators, 0),
      totalBets: battles.reduce((sum, b) => sum + b.totalBets, 0)
    });
    
  } catch (error) {
    console.error('🥊 Leaderboard error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

module.exports = router; 