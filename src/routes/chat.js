const express = require('express');
const { body, query, validationResult } = require('express-validator');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Get chat messages
router.get('/chat-messages', [
  auth,
  query('since').optional().isISO8601().toDate(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let query = `
      SELECT c.*, u.username 
      FROM community_chats c 
      JOIN users u ON c.user_id = u.user_id
    `;
    const queryParams = [];

    if (req.query.since) {
      query += ' WHERE c.created_at > $1';
      queryParams.push(req.query.since);
    }

    query += ' ORDER BY c.created_at DESC LIMIT 50';

    const result = await db.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Post a chat message
router.post('/chat-messages', [
  auth,
  body('message').trim().notEmpty().withMessage('Message cannot be empty'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message } = req.body;
    const result = await db.query(
      'INSERT INTO community_chats (user_id, message) VALUES ($1, $2) RETURNING *',
      [req.user.userId, message]
    );

    // Get username for the response
    const userResult = await db.query(
      'SELECT username FROM users WHERE user_id = $1',
      [req.user.userId]
    );

    const response = {
      ...result.rows[0],
      username: userResult.rows[0].username
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Post chat message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
