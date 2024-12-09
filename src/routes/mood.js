const express = require('express');
const { body, query, validationResult } = require('express-validator');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Log mood
router.post('/mood-logs', [
  auth,
  body('mood_level').isInt({ min: 1, max: 10 }).withMessage('Mood level must be between 1 and 10'),
  body('mood_note').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mood_level, mood_note } = req.body;
    const result = await db.query(
      'INSERT INTO mood_logs (user_id, mood_level, mood_note) VALUES ($1, $2, $3) RETURNING *',
      [req.user.userId, mood_level, mood_note]
    );

    // Add to log history
    await db.query(
      'INSERT INTO log_history (user_id, entry_type, entry_id) VALUES ($1, $2, $3)',
      [req.user.userId, 'mood', result.rows[0].log_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Log mood error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get mood logs
router.get('/mood-logs', [
  auth,
  query('start_date').optional().isDate(),
  query('end_date').optional().isDate(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { start_date, end_date } = req.query;
    let query = 'SELECT * FROM mood_logs WHERE user_id = $1';
    const params = [req.user.userId];

    if (start_date) {
      query += ' AND logged_at >= $2';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND logged_at <= $' + (params.length + 1);
      params.push(end_date);
    }

    query += ' ORDER BY logged_at DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get mood logs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
