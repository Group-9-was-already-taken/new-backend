const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Save quiz results
router.post('/quiz-results', async (req, res) => {
  try {
    const {
      quizType,
      score,
      answers,
      severity,
      recommendations,
      moodRating,
      stressLevel,
      sleepHours,
      followUpDate,
      notes
    } = req.body;

    const { rows } = await db.query(
      `INSERT INTO quiz_results 
      (quiz_type, score, answers, severity, recommendations, mood_rating, stress_level, sleep_hours, follow_up_date, notes) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *`,
      [quizType, score, JSON.stringify(answers), severity, recommendations, moodRating, stressLevel, sleepHours, followUpDate, notes]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error saving quiz results:', error);
    res.status(500).json({ error: 'Failed to save quiz results', details: error.message });
  }
});

// Get quiz history
router.get('/quiz-results', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM quiz_results ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({ error: 'Failed to fetch quiz results', details: error.message });
  }
});

module.exports = router;
