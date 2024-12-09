const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Get information page content
router.get('/information', async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM links WHERE link_type = 'information' ORDER BY link_name"
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get information error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get footer content
router.get('/footer', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM info_footer ORDER BY footer_id LIMIT 1'
    );

    res.json(result.rows[0] || {
      footer_text: 'This page is not a replacement for professional therapy. Please seek professional help if you are experiencing a mental health crisis.'
    });
  } catch (error) {
    console.error('Get footer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
