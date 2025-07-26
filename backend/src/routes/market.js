const express = require('express');
const router = express.Router();

// Mock market data (replace with actual API integration)
let marketData = {
  bitcoin: {
    price: 42000,
    change24h: 2.5,
    volume24h: 25000000000,
    marketCap: 820000000000,
    dominance: 48.5,
    sentiment: 'bullish',
    lastUpdated: new Date().toISOString()
  },
  ethereum: {
    price: 2800,
    change24h: -1.2,
    volume24h: 15000000000,
    marketCap: 340000000000,
    dominance: 20.1,
    sentiment: 'neutral',
    lastUpdated: new Date().toISOString()
  },
  altcoins: {
    averagePrice: 0.85,
    change24h: 5.8,
    volume24h: 8000000000,
    marketCap: 120000000000,
    dominance: 7.2,
    sentiment: 'bullish',
    lastUpdated: new Date().toISOString()
  },
  stablecoins: {
    averagePrice: 1.00,
    change24h: 0.01,
    volume24h: 12000000000,
    marketCap: 150000000000,
    dominance: 8.9,
    sentiment: 'stable',
    lastUpdated: new Date().toISOString()
  }
};

// Market events that affect battle dynamics
let marketEvents = [
  {
    id: 1,
    type: 'price_spike',
    asset: 'bitcoin',
    description: 'Bitcoin surges 15% in 1 hour',
    impact: 'high',
    duration: 3600,
    createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    effects: {
      attackBonus: 20,
      speedBonus: 15,
      specialMoveChance: 0.3
    }
  },
  {
    id: 2,
    type: 'market_crash',
    asset: 'altcoins',
    description: 'Altcoin market crashes 25%',
    impact: 'medium',
    duration: 7200,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    effects: {
      defensePenalty: -10,
      healthPenalty: -15,
      criticalHitChance: 0.2
    }
  }
];

// @route   GET /api/market/prices
// @desc    Get current crypto prices
// @access  Public
router.get('/prices', (req, res) => {
  try {
    // Simulate real-time price updates
    const updatePrices = () => {
      marketData.bitcoin.price += (Math.random() - 0.5) * 100;
      marketData.ethereum.price += (Math.random() - 0.5) * 50;
      marketData.altcoins.averagePrice += (Math.random() - 0.5) * 0.1;
      
      // Update change percentages
      marketData.bitcoin.change24h = (Math.random() - 0.5) * 10;
      marketData.ethereum.change24h = (Math.random() - 0.5) * 8;
      marketData.altcoins.change24h = (Math.random() - 0.5) * 15;
      
      // Update sentiment based on price changes
      marketData.bitcoin.sentiment = marketData.bitcoin.change24h > 0 ? 'bullish' : 'bearish';
      marketData.ethereum.sentiment = marketData.ethereum.change24h > 0 ? 'bullish' : 'bearish';
      marketData.altcoins.sentiment = marketData.altcoins.change24h > 0 ? 'bullish' : 'bearish';
      
      marketData.bitcoin.lastUpdated = new Date().toISOString();
      marketData.ethereum.lastUpdated = new Date().toISOString();
      marketData.altcoins.lastUpdated = new Date().toISOString();
    };
    
    updatePrices();
    
    res.json({
      message: 'Current market prices from the underground',
      data: marketData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('🥊 Get market prices error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   GET /api/market/asset/:symbol
// @desc    Get specific asset data
// @access  Public
router.get('/asset/:symbol', (req, res) => {
  try {
    const symbol = req.params.symbol.toLowerCase();
    
    if (!marketData[symbol]) {
      return res.status(404).json({ 
        error: 'Asset not found in the underground market' 
      });
    }
    
    res.json({
      message: `${symbol.toUpperCase()} market data`,
      asset: symbol,
      data: marketData[symbol]
    });
    
  } catch (error) {
    console.error('🥊 Get asset data error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   GET /api/market/events
// @desc    Get market events affecting battles
// @access  Public
router.get('/events', (req, res) => {
  try {
    const { active } = req.query;
    
    let filteredEvents = [...marketEvents];
    
    if (active === 'true') {
      const now = new Date();
      filteredEvents = filteredEvents.filter(event => {
        const eventTime = new Date(event.createdAt);
        const eventEnd = new Date(eventTime.getTime() + event.duration * 1000);
        return now < eventEnd;
      });
    }
    
    res.json({
      message: 'Market events affecting the underground fights',
      events: filteredEvents,
      total: filteredEvents.length
    });
    
  } catch (error) {
    console.error('🥊 Get market events error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   POST /api/market/events
// @desc    Create a new market event
// @access  Private
router.post('/events', (req, res) => {
  try {
    const { type, asset, description, impact, duration, effects } = req.body;
    
    // Validate required fields
    if (!type || !asset || !description || !impact || !duration) {
      return res.status(400).json({ 
        error: 'Type, asset, description, impact, and duration are required' 
      });
    }
    
    // Validate impact level
    const validImpacts = ['low', 'medium', 'high', 'critical'];
    if (!validImpacts.includes(impact)) {
      return res.status(400).json({ 
        error: 'Invalid impact level. Choose from: low, medium, high, critical' 
      });
    }
    
    // Create new market event
    const newEvent = {
      id: marketEvents.length + 1,
      type,
      asset,
      description,
      impact,
      duration: parseInt(duration),
      createdAt: new Date().toISOString(),
      effects: effects || {}
    };
    
    marketEvents.push(newEvent);
    
    res.status(201).json({
      message: 'A new market event has shaken the underground!',
      event: newEvent
    });
    
  } catch (error) {
    console.error('🥊 Create market event error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   GET /api/market/sentiment
// @desc    Get market sentiment analysis
// @access  Public
router.get('/sentiment', (req, res) => {
  try {
    const { asset } = req.query;
    
    if (asset) {
      if (!marketData[asset]) {
        return res.status(404).json({ 
          error: 'Asset not found in the underground market' 
        });
      }
      
      const sentiment = marketData[asset].sentiment;
      const change = marketData[asset].change24h;
      
      let sentimentScore = 0;
      let sentimentDescription = '';
      
      switch (sentiment) {
        case 'bullish':
          sentimentScore = 0.8;
          sentimentDescription = 'The underground is bullish on this asset';
          break;
        case 'bearish':
          sentimentScore = 0.2;
          sentimentDescription = 'The underground is bearish on this asset';
          break;
        case 'neutral':
          sentimentScore = 0.5;
          sentimentDescription = 'The underground is neutral on this asset';
          break;
        case 'stable':
          sentimentScore = 0.5;
          sentimentDescription = 'This asset provides stability in the underground';
          break;
      }
      
      res.json({
        message: `${asset.toUpperCase()} sentiment analysis`,
        asset: asset,
        sentiment: {
          score: sentimentScore,
          description: sentimentDescription,
          change24h: change,
          currentSentiment: sentiment
        }
      });
    } else {
      // Overall market sentiment
      const assets = Object.keys(marketData);
      const bullishCount = assets.filter(asset => marketData[asset].sentiment === 'bullish').length;
      const bearishCount = assets.filter(asset => marketData[asset].sentiment === 'bearish').length;
      const neutralCount = assets.filter(asset => marketData[asset].sentiment === 'neutral').length;
      const stableCount = assets.filter(asset => marketData[asset].sentiment === 'stable').length;
      
      const overallSentiment = bullishCount > bearishCount ? 'bullish' : 
                              bearishCount > bullishCount ? 'bearish' : 'neutral';
      
      res.json({
        message: 'Overall market sentiment in the underground',
        overall: {
          sentiment: overallSentiment,
          score: (bullishCount / assets.length) * 0.8 + (neutralCount / assets.length) * 0.5 + (stableCount / assets.length) * 0.5
        },
        breakdown: {
          bullish: bullishCount,
          bearish: bearishCount,
          neutral: neutralCount,
          stable: stableCount,
          total: assets.length
        }
      });
    }
    
  } catch (error) {
    console.error('🥊 Get market sentiment error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   GET /api/market/battle-effects
// @desc    Get current market effects on battles
// @access  Public
router.get('/battle-effects', (req, res) => {
  try {
    const now = new Date();
    const activeEvents = marketEvents.filter(event => {
      const eventTime = new Date(event.createdAt);
      const eventEnd = new Date(eventTime.getTime() + event.duration * 1000);
      return now < eventEnd;
    });
    
    // Calculate cumulative effects
    const cumulativeEffects = {
      attackBonus: 0,
      defenseBonus: 0,
      speedBonus: 0,
      healthBonus: 0,
      specialMoveChance: 0,
      criticalHitChance: 0
    };
    
    activeEvents.forEach(event => {
      Object.keys(event.effects).forEach(effect => {
        if (cumulativeEffects.hasOwnProperty(effect)) {
          cumulativeEffects[effect] += event.effects[effect];
        }
      });
    });
    
    // Add base market sentiment effects
    const bitcoinSentiment = marketData.bitcoin.sentiment;
    const ethereumSentiment = marketData.ethereum.sentiment;
    
    if (bitcoinSentiment === 'bullish') {
      cumulativeEffects.attackBonus += 5;
      cumulativeEffects.defenseBonus += 3;
    } else if (bitcoinSentiment === 'bearish') {
      cumulativeEffects.attackBonus -= 3;
      cumulativeEffects.defenseBonus -= 5;
    }
    
    if (ethereumSentiment === 'bullish') {
      cumulativeEffects.speedBonus += 5;
      cumulativeEffects.specialMoveChance += 0.1;
    } else if (ethereumSentiment === 'bearish') {
      cumulativeEffects.speedBonus -= 3;
      cumulativeEffects.specialMoveChance -= 0.05;
    }
    
    res.json({
      message: 'Current market effects on underground battles',
      effects: cumulativeEffects,
      activeEvents: activeEvents.length,
      marketConditions: {
        bitcoin: marketData.bitcoin.sentiment,
        ethereum: marketData.ethereum.sentiment,
        altcoins: marketData.altcoins.sentiment,
        stablecoins: marketData.stablecoins.sentiment
      }
    });
    
  } catch (error) {
    console.error('🥊 Get battle effects error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   GET /api/market/history/:symbol
// @desc    Get historical price data
// @access  Public
router.get('/history/:symbol', (req, res) => {
  try {
    const symbol = req.params.symbol.toLowerCase();
    const { period = '24h' } = req.query;
    
    if (!marketData[symbol]) {
      return res.status(404).json({ 
        error: 'Asset not found in the underground market' 
      });
    }
    
    // Generate mock historical data
    const generateHistory = (period) => {
      const dataPoints = period === '24h' ? 24 : period === '7d' ? 168 : 30;
      const history = [];
      const basePrice = marketData[symbol].price;
      
      for (let i = dataPoints; i >= 0; i--) {
        const timestamp = new Date(Date.now() - i * (period === '24h' ? 3600000 : period === '7d' ? 3600000 : 86400000));
        const price = basePrice + (Math.random() - 0.5) * basePrice * 0.1;
        const volume = marketData[symbol].volume24h * (0.8 + Math.random() * 0.4);
        
        history.push({
          timestamp: timestamp.toISOString(),
          price: Math.round(price * 100) / 100,
          volume: Math.round(volume)
        });
      }
      
      return history;
    };
    
    const history = generateHistory(period);
    
    res.json({
      message: `${symbol.toUpperCase()} price history`,
      asset: symbol,
      period: period,
      data: history,
      currentPrice: marketData[symbol].price
    });
    
  } catch (error) {
    console.error('🥊 Get market history error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

module.exports = router; 