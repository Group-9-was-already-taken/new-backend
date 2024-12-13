const request = require('supertest');
const express = require('express');
const moodRoutes = require('../routes/mood');

// Mock the database
jest.mock('../config/database', () => ({
  query: jest.fn(),
}));

// Mock authentication middleware
jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 1 }; // Mock authenticated user
    next();
  },
}));

describe('Mood Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/mood', moodRoutes);
  });

  describe('POST /api/mood/log', () => {
    it('should log a new mood entry', async () => {
      const moodEntry = {
        mood: 'happy',
        notes: 'Feeling great today!',
        date: new Date().toISOString()
      };

      // Mock database response
      require('../config/database').query
        .mockResolvedValueOnce({ rows: [{ id: 1, ...moodEntry }] });

      const response = await request(app)
        .post('/api/mood/log')
        .send(moodEntry)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Mood logged successfully');
      expect(response.body).toHaveProperty('mood');
      expect(response.body.mood).toHaveProperty('mood', moodEntry.mood);
    });
  });

  describe('GET /api/mood/history', () => {
    it('should get mood history for user', async () => {
      const mockMoodHistory = [
        {
          id: 1,
          mood: 'happy',
          notes: 'Great day!',
          date: new Date().toISOString()
        },
        {
          id: 2,
          mood: 'calm',
          notes: 'Peaceful day',
          date: new Date().toISOString()
        }
      ];

      // Mock database response
      require('../config/database').query
        .mockResolvedValueOnce({ rows: mockMoodHistory });

      const response = await request(app)
        .get('/api/mood/history')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('mood', 'happy');
      expect(response.body[1]).toHaveProperty('mood', 'calm');
    });

    it('should handle empty mood history', async () => {
      // Mock database response with empty array
      require('../config/database').query
        .mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/mood/history')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(0);
    });
  });
});
