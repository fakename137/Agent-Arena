const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Mock user database (replace with actual database)
let users = [
  {
    id: 1,
    username: 'tyler_durden',
    email: 'tyler@fightclub.com',
    password: '$2a$10$hashedpassword',
    rank: 'Legend',
    joinDate: '1999-10-15',
    totalBattles: 847,
    wins: 723,
    losses: 124
  }
];

// Validation middleware
const validateRegistration = [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const validateLogin = [
  body('email').isEmail().withMessage('Must be a valid email address'),
  body('password').notEmpty().withMessage('Password is required')
];

// @route   POST /api/auth/register
// @desc    Register a new fighter
// @access  Public
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(400).json({ 
        error: 'A fighter with this name or email already exists in the underground' 
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword,
      rank: 'Novice',
      joinDate: new Date().toISOString().split('T')[0],
      totalBattles: 0,
      wins: 0,
      losses: 0,
      createdAt: new Date()
    };

    users.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      process.env.JWT_SECRET || 'fight-club-secret',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      message: 'Welcome to the underground, fighter!',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('🥊 Registration error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate fighter & get token
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials. The underground doesn\'t recognize you.' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials. Your fighting spirit is weak.' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'fight-club-secret',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      message: 'Welcome back to the arena, fighter!',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('🥊 Login error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   GET /api/auth/profile
// @desc    Get fighter profile
// @access  Private
router.get('/profile', (req, res) => {
  try {
    // In a real app, you'd verify the JWT token here
    const userId = req.headers['user-id'] || 1; // Mock for now
    const user = users.find(u => u.id === parseInt(userId));
    
    if (!user) {
      return res.status(404).json({ 
        error: 'Fighter not found in the underground' 
      });
    }

    const { password: _, ...userResponse } = user;

    res.json({
      message: 'Your fighting profile',
      user: userResponse
    });

  } catch (error) {
    console.error('🥊 Profile error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update fighter profile
// @access  Private
router.put('/profile', (req, res) => {
  try {
    const userId = req.headers['user-id'] || 1; // Mock for now
    const userIndex = users.findIndex(u => u.id === parseInt(userId));
    
    if (userIndex === -1) {
      return res.status(404).json({ 
        error: 'Fighter not found in the underground' 
      });
    }

    const { username, email } = req.body;
    
    // Update user
    if (username) users[userIndex].username = username;
    if (email) users[userIndex].email = email;
    
    users[userIndex].updatedAt = new Date();

    const { password: _, ...userResponse } = users[userIndex];

    res.json({
      message: 'Your fighting profile has been updated',
      user: userResponse
    });

  } catch (error) {
    console.error('🥊 Profile update error:', error);
    res.status(500).json({ 
      error: 'Something went wrong in the basement' 
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout fighter
// @access  Private
router.post('/logout', (req, res) => {
  res.json({
    message: 'You have left the underground. Remember the rules...'
  });
});

module.exports = router; 