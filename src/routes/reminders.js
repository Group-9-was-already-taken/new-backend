const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Create reminder
router.post('/reminders', [
  auth,
  body('reminder_type').trim().notEmpty().withMessage('Reminder type is required'),
  body('reminder_text').trim().notEmpty().withMessage('Reminder text is required'),
  body('reminder_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
  body('is_active').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reminder_type, reminder_text, reminder_time, is_active = true } = req.body;
    const result = await db.query(
      'INSERT INTO reminders (user_id, reminder_type, reminder_text, reminder_time, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.userId, reminder_type, reminder_text, reminder_time, is_active]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get reminders
router.get('/reminders', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM reminders WHERE user_id = $1 ORDER BY reminder_time',
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update reminder
router.put('/reminders/:reminder_id', [
  auth,
  body('reminder_text').optional().trim(),
  body('reminder_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('is_active').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reminder_id } = req.params;
    const updates = req.body;
    
    // Build dynamic update query
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    const values = Object.values(updates);
    
    const query = `
      UPDATE reminders 
      SET ${setClause}
      WHERE reminder_id = $1 AND user_id = $${values.length + 2}
      RETURNING *
    `;
    
    const result = await db.query(
      query,
      [reminder_id, ...values, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete reminder
router.delete('/reminders/:reminder_id', auth, async (req, res) => {
  try {
    const { reminder_id } = req.params;
    const result = await db.query(
      'DELETE FROM reminders WHERE reminder_id = $1 AND user_id = $2 RETURNING *',
      [reminder_id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
