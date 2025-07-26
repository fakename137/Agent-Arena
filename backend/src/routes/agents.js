const express = require('express');
const router = express.Router();

// Mock agents database (replace with actual database)
let agents = [
  {
    id: 1,
    name: 'Tyler Durden',
    type: 'bitcoin',
    owner: 'tyler_durden',
    level: 100,
    health: 100,
    attack: 95,
    defense: 90,
    speed: 85,
    specialMove: 'Diamond Hands',
    experience: 10000,
    totalBattles: 847,
    wins: 723,
    losses: 124,
    rank: 'Legend',
    createdAt: '1999-10-15',
    lastTrained: '2024-01-15',
    isActive: true,
    appearance: {
      model: 'bitcoin_warrior',
      color: '#f7931a',
      accessories: ['leather_jacket', 'soap_bar']
    },
    stats: {
      strength: 95,
      agility: 85,
      intelligence: 90,
      charisma: 100
    }
  },
  {
    id: 2,
    name: 'Marla Singer',
    type: 'ethereum',
    owner: 'marla_singer',
    level: 85,
    health: 85,
    attack: 90,
    defense: 80,
    speed: 95,
    specialMove: 'Gas Optimization',
    experience: 8500,
    totalBattles: 623,
    wins: 498,
    losses: 125,
    rank: 'Master',
    createdAt: '2000-03-20',
    lastTrained: '2024-01-10',
    isActive: true,
    appearance: {
      model: 'ethereum_fighter',
      color: '#627eea',
      accessories: ['red_dress', 'cigarette']
    },
    stats: {
      strength: 85,
      agility: 95,
      intelligence: 90,
      charisma: 85
    }
  }
];

// @route   GET /api/agents
// @desc    Get all agents (with optional filtering)
// @access  Public
router.get('/', (req, res) => {
  try {
    const { type, rank, owner, limit = 20, offset = 0 } = req.query;
    
    let filteredAgents = [...agents];
    
    // Apply filters
    if (type) {
      filteredAgents = filteredAgents.filter(agent => agent.type === type);
    }
    
    if (rank) {
      filteredAgents = filteredAgents.filter(agent => agent.rank === rank);
    }
    
    if (owner) {
      filteredAgents = filteredAgents.filter(agent => agent.owner === owner);
    }
    
    // Apply pagination
    const paginatedAgents = filteredAgents.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
      message: 'Fighters of the underground',
      agents: paginatedAgents,
      total: filteredAgents.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
  } catch (error) {
    console.error('🥊 Get agents error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   GET /api/agents/:id
// @desc    Get agent by ID
// @access  Public
router.get('/:id', (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    const agent = agents.find(a => a.id === agentId);
    
    if (!agent) {
      return res.status(404).json({ 
        error: 'Fighter not found in the underground' 
      });
    }
    
    res.json({
      message: 'Fighter details',
      agent
    });
    
  } catch (error) {
    console.error('🥊 Get agent error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   POST /api/agents
// @desc    Create a new agent
// @access  Private
router.post('/', (req, res) => {
  try {
    const { name, type, owner } = req.body;
    
    // Validate required fields
    if (!name || !type || !owner) {
      return res.status(400).json({ 
        error: 'Name, type, and owner are required to create a fighter' 
      });
    }
    
    // Validate agent type
    const validTypes = ['bitcoin', 'ethereum', 'altcoin', 'stablecoin'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid fighter type. Choose from: bitcoin, ethereum, altcoin, stablecoin' 
      });
    }
    
    // Check if name already exists
    const existingAgent = agents.find(a => a.name === name);
    if (existingAgent) {
      return res.status(400).json({ 
        error: 'A fighter with this name already exists in the underground' 
      });
    }
    
    // Create new agent with default stats based on type
    const baseStats = {
      bitcoin: { health: 100, attack: 80, defense: 95, speed: 70 },
      ethereum: { health: 85, attack: 90, defense: 80, speed: 95 },
      altcoin: { health: 60, attack: 100, defense: 50, speed: 100 },
      stablecoin: { health: 90, attack: 75, defense: 85, speed: 80 }
    };
    
    const specialMoves = {
      bitcoin: 'Diamond Hands',
      ethereum: 'Gas Optimization',
      altcoin: 'Moon Shot',
      stablecoin: 'Peg Stability'
    };
    
    const colors = {
      bitcoin: '#f7931a',
      ethereum: '#627eea',
      altcoin: '#ff6b6b',
      stablecoin: '#51cf66'
    };
    
    const newAgent = {
      id: agents.length + 1,
      name,
      type,
      owner,
      level: 1,
      health: baseStats[type].health,
      attack: baseStats[type].attack,
      defense: baseStats[type].defense,
      speed: baseStats[type].speed,
      specialMove: specialMoves[type],
      experience: 0,
      totalBattles: 0,
      wins: 0,
      losses: 0,
      rank: 'Novice',
      createdAt: new Date().toISOString().split('T')[0],
      lastTrained: new Date().toISOString().split('T')[0],
      isActive: true,
      appearance: {
        model: `${type}_fighter`,
        color: colors[type],
        accessories: []
      },
      stats: {
        strength: baseStats[type].attack,
        agility: baseStats[type].speed,
        intelligence: baseStats[type].defense,
        charisma: 50
      }
    };
    
    agents.push(newAgent);
    
    res.status(201).json({
      message: 'A new fighter has entered the underground!',
      agent: newAgent
    });
    
  } catch (error) {
    console.error('🥊 Create agent error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   PUT /api/agents/:id/train
// @desc    Train an agent
// @access  Private
router.put('/:id/train', (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    const { trainingType, duration } = req.body;
    
    const agentIndex = agents.findIndex(a => a.id === agentId);
    if (agentIndex === -1) {
      return res.status(404).json({ 
        error: 'Fighter not found in the underground' 
      });
    }
    
    const agent = agents[agentIndex];
    
    // Training logic
    const trainingBonuses = {
      strength: { attack: 2, health: 1 },
      agility: { speed: 3, defense: 1 },
      intelligence: { defense: 2, attack: 1 },
      charisma: { all: 1 }
    };
    
    const bonus = trainingBonuses[trainingType] || trainingBonuses.strength;
    const hours = duration || 1;
    
    // Apply training bonuses
    if (bonus.all) {
      agent.attack += bonus.all * hours;
      agent.defense += bonus.all * hours;
      agent.speed += bonus.all * hours;
      agent.health += bonus.all * hours;
    } else {
      if (bonus.attack) agent.attack += bonus.attack * hours;
      if (bonus.defense) agent.defense += bonus.defense * hours;
      if (bonus.speed) agent.speed += bonus.speed * hours;
      if (bonus.health) agent.health += bonus.health * hours;
    }
    
    // Cap stats at 100
    agent.attack = Math.min(agent.attack, 100);
    agent.defense = Math.min(agent.defense, 100);
    agent.speed = Math.min(agent.speed, 100);
    agent.health = Math.min(agent.health, 100);
    
    // Update experience and level
    agent.experience += hours * 100;
    agent.level = Math.floor(agent.experience / 1000) + 1;
    
    // Update rank based on level
    if (agent.level >= 76) agent.rank = 'Legend';
    else if (agent.level >= 51) agent.rank = 'Master';
    else if (agent.level >= 26) agent.rank = 'Veteran';
    else if (agent.level >= 11) agent.rank = 'Apprentice';
    else agent.rank = 'Novice';
    
    agent.lastTrained = new Date().toISOString().split('T')[0];
    
    res.json({
      message: `Your fighter has trained in ${trainingType} for ${hours} hour(s)!`,
      agent: agent,
      trainingResults: {
        type: trainingType,
        duration: hours,
        bonuses: bonus
      }
    });
    
  } catch (error) {
    console.error('🥊 Train agent error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   PUT /api/agents/:id
// @desc    Update agent details
// @access  Private
router.put('/:id', (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    const { name, isActive } = req.body;
    
    const agentIndex = agents.findIndex(a => a.id === agentId);
    if (agentIndex === -1) {
      return res.status(404).json({ 
        error: 'Fighter not found in the underground' 
      });
    }
    
    // Update allowed fields
    if (name) agents[agentIndex].name = name;
    if (typeof isActive === 'boolean') agents[agentIndex].isActive = isActive;
    
    res.json({
      message: 'Fighter details updated',
      agent: agents[agentIndex]
    });
    
  } catch (error) {
    console.error('🥊 Update agent error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   DELETE /api/agents/:id
// @desc    Delete an agent
// @access  Private
router.delete('/:id', (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    const agentIndex = agents.findIndex(a => a.id === agentId);
    
    if (agentIndex === -1) {
      return res.status(404).json({ 
        error: 'Fighter not found in the underground' 
      });
    }
    
    const deletedAgent = agents.splice(agentIndex, 1)[0];
    
    res.json({
      message: 'The fighter has left the underground forever...',
      agent: deletedAgent
    });
    
  } catch (error) {
    console.error('🥊 Delete agent error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

module.exports = router; 