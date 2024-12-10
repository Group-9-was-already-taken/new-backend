const express = require('express');
const { query, validationResult, body } = require('express-validator');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Get exercises for a specific time of day
router.get('/exercises', [
  query('period')
    .isIn(['morning', 'afternoon', 'evening'])
    .withMessage('Invalid period. Must be morning, afternoon, or evening'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period } = req.query;
    const result = await db.query(
      'SELECT * FROM exercises WHERE period = $1',
      [period]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Log completed exercises
router.post('/log', auth, [
  body('exercises').isArray().withMessage('Exercises must be an array'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { exercises } = req.body;
    const date = req.body.date || new Date().toISOString();
    
    if (!req.user || !req.user.username || !req.user.user_id) {
      console.error('Missing user information:', req.user);
      return res.status(401).json({ 
        error: 'User information not found',
        user: req.user 
      });
    }

    console.log('Attempting to log exercise with data:', {
      user_id: req.user.user_id,
      username: req.user.username,
      exercises: exercises,
      date: date
    });

    // Insert exercise log
    const result = await db.query(
      `INSERT INTO exercise_logs (user_id, username, date, exercises)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, username, date, exercises`,
      [req.user.user_id, req.user.username, date, JSON.stringify(exercises)]
    );

    console.log('Successfully logged exercise:', result.rows[0]);

    res.status(201).json({
      success: true,
      message: 'Exercise log saved successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Log exercise error:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: error.message,
      code: error.code,
      user_id_type: typeof req.user.user_id,
      user_id: req.user.user_id
    });
  }
});

// Get user's exercise history
router.get('/history', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({ error: 'User information not found' });
    }

    const result = await db.query(
      `SELECT * FROM exercise_logs 
       WHERE user_id = $1 
       ORDER BY date DESC`,
      [req.user.user_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get exercise history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
