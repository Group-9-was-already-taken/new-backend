const request = require('supertest');
const express = require('express');
const cors = require('cors');
const routes = require('../routes');

describe('Server', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api', routes);
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });
  });

  describe('Health Check', () => {
    it('should return status ok', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('CORS', () => {
    it('should have CORS enabled', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeTruthy();
    });
  });
});
