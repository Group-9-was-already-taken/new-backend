const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Get emergency resources
router.get('/emergency-resources', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM emergency_resources ORDER BY resource_name'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get emergency resources error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get professional links
router.get('/professional-links', async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM links WHERE link_type = 'professional' ORDER BY link_name"
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get professional links error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
