const express = require('express');
const { query, validationResult } = require('express-validator');
const db = require('../config/database');

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

module.exports = router;
