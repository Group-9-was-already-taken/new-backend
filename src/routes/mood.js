const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Log mood
router.post('/', [
  auth,
  body('mood_level').isInt({ min: 1, max: 5 }).withMessage('Mood level must be between 1 and 5'),
  body('mood_note').optional().trim(),
], async (req, res) => {
  try {
    console.log('Received mood logging request:', req.body);
    console.log('User from token:', req.user);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        error: errors.array()[0].msg,
        details: errors.array() 
      });
    }

    const { mood_level, mood_note } = req.body;
    
    console.log('Executing query with params:', {
      userId: req.user.userId,
      mood_level,
      mood_note
    });

    const result = await db.query(
      'INSERT INTO mood_logs (user_id, mood_level, mood_note) VALUES ($1, $2, $3) RETURNING *',
      [req.user.userId, mood_level, mood_note]
    );

    console.log('Saved mood log:', result.rows[0]);
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Log mood error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Failed to save mood',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get mood logs
router.get('/', auth, async (req, res) => {
  try {
    console.log('Getting mood logs for user:', req.user);
    
    if (!req.user || !req.user.userId) {
      console.error('No user ID found in token');
      return res.status(401).json({
        success: false,
        error: 'No user ID found in token',
        details: 'Please log in again'
      });
    }

    const result = await db.query(
      'SELECT * FROM mood_logs WHERE user_id = $1 ORDER BY timestamp DESC',
      [req.user.userId]
    );

    console.log('Found mood logs:', result.rows);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get mood logs error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get mood logs',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;