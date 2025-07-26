const express = require('express');
const router = express.Router();

// Mock arenas database (replace with actual database)
let arenas = [
  {
    id: 'basement-1',
    name: 'Paper Street Basement',
    location: 'Underground',
    capacity: 200,
    currentSpectators: 156,
    status: 'active',
    currentBattle: 1,
    description: 'The original underground fight club. Dark, damp, and full of history.',
    atmosphere: {
      lighting: 'dim',
      sound: 'echoing',
      temperature: 'cold',
      humidity: 'high'
    },
    rules: [
      'First rule: You do not talk about Fight Club',
      'Second rule: You DO NOT talk about Fight Club',
      'Third rule: If someone says stop, goes limp, taps out, the fight is over',
      'Fourth rule: Only two guys to a fight',
      'Fifth rule: One fight at a time, fellas',
      'Sixth rule: No shirts, no shoes',
      'Seventh rule: Fights will go on as long as they have to',
      'Eighth rule: If this is your first night at Fight Club, you have to fight'
    ],
    createdAt: '1999-10-15T00:00:00Z',
    totalBattles: 847,
    totalSpectators: 15600,
    totalBets: 250000
  },
  {
    id: 'warehouse-2',
    name: 'Chemical Burn Warehouse',
    location: 'Industrial District',
    capacity: 500,
    currentSpectators: 0,
    status: 'available',
    currentBattle: null,
    description: 'A massive industrial space with concrete floors and steel beams.',
    atmosphere: {
      lighting: 'industrial',
      sound: 'metallic',
      temperature: 'moderate',
      humidity: 'low'
    },
    rules: [
      'First rule: You do not talk about Fight Club',
      'Second rule: You DO NOT talk about Fight Club',
      'Third rule: If someone says stop, goes limp, taps out, the fight is over',
      'Fourth rule: Only two guys to a fight',
      'Fifth rule: One fight at a time, fellas',
      'Sixth rule: No shirts, no shoes',
      'Seventh rule: Fights will go on as long as they have to',
      'Eighth rule: If this is your first night at Fight Club, you have to fight'
    ],
    createdAt: '2000-03-20T00:00:00Z',
    totalBattles: 623,
    totalSpectators: 12400,
    totalBets: 180000
  },
  {
    id: 'parking-lot-3',
    name: 'Abandoned Parking Lot',
    location: 'Downtown',
    capacity: 150,
    currentSpectators: 0,
    status: 'maintenance',
    currentBattle: null,
    description: 'An open-air arena under the stars. Perfect for midnight fights.',
    atmosphere: {
      lighting: 'moonlight',
      sound: 'urban',
      temperature: 'cool',
      humidity: 'moderate'
    },
    rules: [
      'First rule: You do not talk about Fight Club',
      'Second rule: You DO NOT talk about Fight Club',
      'Third rule: If someone says stop, goes limp, taps out, the fight is over',
      'Fourth rule: Only two guys to a fight',
      'Fifth rule: One fight at a time, fellas',
      'Sixth rule: No shirts, no shoes',
      'Seventh rule: Fights will go on as long as they have to',
      'Eighth rule: If this is your first night at Fight Club, you have to fight'
    ],
    createdAt: '2001-06-10T00:00:00Z',
    totalBattles: 234,
    totalSpectators: 7800,
    totalBets: 95000
  }
];

// @route   GET /api/arena
// @desc    Get all arenas
// @access  Public
router.get('/', (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    
    let filteredArenas = [...arenas];
    
    // Apply filters
    if (status) {
      filteredArenas = filteredArenas.filter(arena => arena.status === status);
    }
    
    // Apply pagination
    const paginatedArenas = filteredArenas.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
      message: 'Underground fight arenas',
      arenas: paginatedArenas,
      total: filteredArenas.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
  } catch (error) {
    console.error('🥊 Get arenas error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   GET /api/arena/:id
// @desc    Get arena by ID
// @access  Public
router.get('/:id', (req, res) => {
  try {
    const arenaId = req.params.id;
    const arena = arenas.find(a => a.id === arenaId);
    
    if (!arena) {
      return res.status(404).json({ 
        error: 'Arena not found in the underground' 
      });
    }
    
    res.json({
      message: 'Arena details',
      arena
    });
    
  } catch (error) {
    console.error('🥊 Get arena error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   POST /api/arena
// @desc    Create a new arena
// @access  Private
router.post('/', (req, res) => {
  try {
    const { name, location, capacity, description } = req.body;
    
    // Validate required fields
    if (!name || !location || !capacity) {
      return res.status(400).json({ 
        error: 'Name, location, and capacity are required to create an arena' 
      });
    }
    
    // Check if arena name already exists
    const existingArena = arenas.find(a => a.name === name);
    if (existingArena) {
      return res.status(400).json({ 
        error: 'An arena with this name already exists in the underground' 
      });
    }
    
    // Generate arena ID
    const arenaId = `${location.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    // Create new arena
    const newArena = {
      id: arenaId,
      name,
      location,
      capacity: parseInt(capacity),
      currentSpectators: 0,
      status: 'available',
      currentBattle: null,
      description: description || 'A new underground fight arena.',
      atmosphere: {
        lighting: 'dim',
        sound: 'echoing',
        temperature: 'moderate',
        humidity: 'moderate'
      },
      rules: [
        'First rule: You do not talk about Fight Club',
        'Second rule: You DO NOT talk about Fight Club',
        'Third rule: If someone says stop, goes limp, taps out, the fight is over',
        'Fourth rule: Only two guys to a fight',
        'Fifth rule: One fight at a time, fellas',
        'Sixth rule: No shirts, no shoes',
        'Seventh rule: Fights will go on as long as they have to',
        'Eighth rule: If this is your first night at Fight Club, you have to fight'
      ],
      createdAt: new Date().toISOString(),
      totalBattles: 0,
      totalSpectators: 0,
      totalBets: 0
    };
    
    arenas.push(newArena);
    
    res.status(201).json({
      message: 'A new arena has been established in the underground!',
      arena: newArena
    });
    
  } catch (error) {
    console.error('🥊 Create arena error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   PUT /api/arena/:id/status
// @desc    Update arena status
// @access  Private
router.put('/:id/status', (req, res) => {
  try {
    const arenaId = req.params.id;
    const { status } = req.body;
    
    const arenaIndex = arenas.findIndex(a => a.id === arenaId);
    if (arenaIndex === -1) {
      return res.status(404).json({ 
        error: 'Arena not found in the underground' 
      });
    }
    
    // Validate status
    const validStatuses = ['available', 'active', 'maintenance', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Choose from: available, active, maintenance, closed' 
      });
    }
    
    arenas[arenaIndex].status = status;
    
    res.json({
      message: 'Arena status updated',
      arena: arenas[arenaIndex]
    });
    
  } catch (error) {
    console.error('🥊 Update arena status error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   PUT /api/arena/:id/spectate
// @desc    Join arena as spectator
// @access  Public
router.put('/:id/spectate', (req, res) => {
  try {
    const arenaId = req.params.id;
    const { action } = req.body; // 'join' or 'leave'
    
    const arenaIndex = arenas.findIndex(a => a.id === arenaId);
    if (arenaIndex === -1) {
      return res.status(404).json({ 
        error: 'Arena not found in the underground' 
      });
    }
    
    const arena = arenas[arenaIndex];
    
    if (action === 'join') {
      if (arena.currentSpectators >= arena.capacity) {
        return res.status(400).json({ 
          error: 'Arena is at full capacity' 
        });
      }
      arena.currentSpectators++;
      arena.totalSpectators++;
    } else if (action === 'leave') {
      if (arena.currentSpectators > 0) {
        arena.currentSpectators--;
      }
    }
    
    res.json({
      message: action === 'join' ? 'You have entered the underground arena!' : 'You have left the arena',
      arena: arena
    });
    
  } catch (error) {
    console.error('🥊 Arena spectate error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   GET /api/arena/:id/atmosphere
// @desc    Get arena atmosphere and current conditions
// @access  Public
router.get('/:id/atmosphere', (req, res) => {
  try {
    const arenaId = req.params.id;
    const arena = arenas.find(a => a.id === arenaId);
    
    if (!arena) {
      return res.status(404).json({ 
        error: 'Arena not found in the underground' 
      });
    }
    
    // Generate dynamic atmosphere based on current conditions
    const currentTime = new Date();
    const hour = currentTime.getHours();
    
    let dynamicAtmosphere = { ...arena.atmosphere };
    
    // Adjust lighting based on time
    if (hour >= 22 || hour <= 6) {
      dynamicAtmosphere.lighting = 'dark';
    } else if (hour >= 18 || hour <= 8) {
      dynamicAtmosphere.lighting = 'dim';
    } else {
      dynamicAtmosphere.lighting = 'bright';
    }
    
    // Adjust temperature based on time and activity
    if (arena.currentSpectators > arena.capacity * 0.8) {
      dynamicAtmosphere.temperature = 'hot';
      dynamicAtmosphere.humidity = 'high';
    }
    
    res.json({
      message: 'Arena atmosphere',
      arena: arena.name,
      atmosphere: dynamicAtmosphere,
      currentConditions: {
        time: currentTime.toISOString(),
        spectators: arena.currentSpectators,
        capacity: arena.capacity,
        occupancy: Math.round((arena.currentSpectators / arena.capacity) * 100)
      }
    });
    
  } catch (error) {
    console.error('🥊 Get arena atmosphere error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   GET /api/arena/stats/overview
// @desc    Get arena statistics overview
// @access  Public
router.get('/stats/overview', (req, res) => {
  try {
    const totalArenas = arenas.length;
    const activeArenas = arenas.filter(a => a.status === 'active').length;
    const totalCapacity = arenas.reduce((sum, a) => sum + a.capacity, 0);
    const totalSpectators = arenas.reduce((sum, a) => sum + a.currentSpectators, 0);
    const totalBattles = arenas.reduce((sum, a) => sum + a.totalBattles, 0);
    const totalBets = arenas.reduce((sum, a) => sum + a.totalBets, 0);
    
    const mostPopularArena = arenas.reduce((max, a) => 
      a.totalSpectators > max.totalSpectators ? a : max
    );
    
    const mostActiveArena = arenas.reduce((max, a) => 
      a.totalBattles > max.totalBattles ? a : max
    );
    
    res.json({
      message: 'Underground fight club arena statistics',
      overview: {
        totalArenas,
        activeArenas,
        totalCapacity,
        currentSpectators: totalSpectators,
        occupancyRate: Math.round((totalSpectators / totalCapacity) * 100)
      },
      activity: {
        totalBattles,
        totalBets,
        averageBattlesPerArena: Math.round(totalBattles / totalArenas)
      },
      highlights: {
        mostPopularArena: {
          name: mostPopularArena.name,
          totalSpectators: mostPopularArena.totalSpectators
        },
        mostActiveArena: {
          name: mostActiveArena.name,
          totalBattles: mostActiveArena.totalBattles
        }
      }
    });
    
  } catch (error) {
    console.error('🥊 Arena stats error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

module.exports = router; 