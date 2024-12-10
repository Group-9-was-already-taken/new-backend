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
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { mood_level, mood_note } = req.body;
    
    // Use the user ID from the auth token
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
    res.status(500).json({ 
      error: 'Failed to save mood',
      details: error.message 
    });
  }
});

// Get mood logs
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM mood_logs WHERE user_id = $1 ORDER BY timestamp DESC',
      [req.user.userId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get mood logs error:', error);
    res.status(500).json({ 
      error: 'Failed to get mood logs',
      details: error.message 
    });
  }
});

module.exports = router;
