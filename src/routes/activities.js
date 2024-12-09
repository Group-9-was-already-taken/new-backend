const express = require('express');
const { body, query, validationResult } = require('express-validator');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Log activity
router.post('/activity-logs', [
  auth,
  body('activity_type').trim().notEmpty().withMessage('Activity type is required'),
  body('description').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { activity_type, description } = req.body;
    const result = await db.query(
      'INSERT INTO activity_logs (user_id, activity_type, description) VALUES ($1, $2, $3) RETURNING *',
      [req.user.userId, activity_type, description]
    );

    // Add to log history
    await db.query(
      'INSERT INTO log_history (user_id, entry_type, entry_id) VALUES ($1, $2, $3)',
      [req.user.userId, 'activity', result.rows[0].log_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Log activity error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get activity logs
router.get('/activity-logs', [
  auth,
  query('start_date').optional().isDate(),
  query('end_date').optional().isDate(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let query = 'SELECT * FROM activity_logs WHERE user_id = $1';
    const queryParams = [req.user.userId];

    const { start_date, end_date } = req.query;
    if (start_date && end_date) {
      query += ' AND logged_at BETWEEN $2 AND $3';
      queryParams.push(start_date, end_date);
    }

    query += ' ORDER BY logged_at DESC';
    const result = await db.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
