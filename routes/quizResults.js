const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// Save quiz result with additional fields
router.post('/', auth, async (req, res) => {
  try {
    const { 
      quizType, 
      score, 
      answers, 
      severity,
      recommendations,
      notes,
      followUpDate,
      moodRating,
      stressLevel,
      sleepHours
    } = req.body;
    const userId = req.user.id;

    const query = `
      INSERT INTO quiz_results (
        user_id, 
        quiz_type, 
        score, 
        severity, 
        answers,
        recommendations,
        notes,
        follow_up_date,
        mood_rating,
        stress_level,
        sleep_hours
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      userId,
      quizType,
      score,
      severity,
      JSON.stringify(answers),
      recommendations,
      notes,
      followUpDate,
      moodRating,
      stressLevel,
      sleepHours
    ];

    const result = await db.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error saving quiz result:', error);
    res.status(500).json({ message: 'Error saving quiz result', error: error.message });
  }
});

// Get user's quiz history with filters
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      quizType,
      startDate,
      endDate,
      severity,
      limit = 10,
      offset = 0
    } = req.query;

    let query = `
      SELECT * FROM quiz_results
      WHERE user_id = $1
    `;
    const values = [userId];
    let paramCount = 1;

    if (quizType) {
      paramCount++;
      query += ` AND quiz_type = $${paramCount}`;
      values.push(quizType);
    }

    if (startDate) {
      paramCount++;
      query += ` AND created_at >= $${paramCount}`;
      values.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND created_at <= $${paramCount}`;
      values.push(endDate);
    }

    if (severity) {
      paramCount++;
      query += ` AND severity = $${paramCount}`;
      values.push(severity);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    const result = await db.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    res.status(500).json({ message: 'Error fetching quiz history', error: error.message });
  }
});

// Get quiz statistics
router.get('/statistics', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { quizType, timeframe } = req.query;

    let timeframeCondition = '';
    if (timeframe === 'week') {
      timeframeCondition = 'AND created_at >= NOW() - INTERVAL \'7 days\'';
    } else if (timeframe === 'month') {
      timeframeCondition = 'AND created_at >= NOW() - INTERVAL \'30 days\'';
    } else if (timeframe === 'year') {
      timeframeCondition = 'AND created_at >= NOW() - INTERVAL \'1 year\'';
    }

    const query = `
      SELECT 
        quiz_type,
        COUNT(*) as total_assessments,
        AVG(score) as average_score,
        MIN(score) as min_score,
        MAX(score) as max_score,
        MODE() WITHIN GROUP (ORDER BY severity) as most_common_severity,
        AVG(mood_rating) as average_mood,
        AVG(stress_level) as average_stress,
        AVG(sleep_hours) as average_sleep
      FROM quiz_results
      WHERE user_id = $1
        ${quizType ? 'AND quiz_type = $2' : ''}
        ${timeframeCondition}
      GROUP BY quiz_type
    `;

    const values = quizType ? [userId, quizType] : [userId];
    const result = await db.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching quiz statistics:', error);
    res.status(500).json({ message: 'Error fetching quiz statistics', error: error.message });
  }
});

// Update quiz result notes
router.patch('/:resultId/notes', auth, async (req, res) => {
  try {
    const { resultId } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;

    const query = `
      UPDATE quiz_results
      SET notes = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `;

    const result = await db.query(query, [notes, resultId, userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Quiz result not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating quiz notes:', error);
    res.status(500).json({ message: 'Error updating quiz notes', error: error.message });
  }
});

// Get progress tracking
router.get('/progress', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { quizType } = req.query;

    const query = `
      WITH monthly_scores AS (
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          AVG(score) as average_score,
          AVG(mood_rating) as average_mood,
          AVG(stress_level) as average_stress,
          AVG(sleep_hours) as average_sleep
        FROM quiz_results
        WHERE user_id = $1
          ${quizType ? 'AND quiz_type = $2' : ''}
          AND created_at >= NOW() - INTERVAL '1 year'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month
      )
      SELECT * FROM monthly_scores
    `;

    const values = quizType ? [userId, quizType] : [userId];
    const result = await db.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching progress data:', error);
    res.status(500).json({ message: 'Error fetching progress data', error: error.message });
  }
});

module.exports = router;
