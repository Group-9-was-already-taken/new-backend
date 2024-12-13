const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/auth');
const jwt = require('jsonwebtoken');

// Mock the database
jest.mock('../config/database', () => ({
  query: jest.fn(),
}));

describe('Auth Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const newUser = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      // Mock database response
      require('../config/database').query
        .mockResolvedValueOnce({ rows: [] }) // Check if email exists
        .mockResolvedValueOnce({ rows: [{ id: 1, ...newUser }] }); // Insert user

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', newUser.email);
    });

    it('should not register user with existing email', async () => {
      const existingUser = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User'
      };

      // Mock database to return existing user
      require('../config/database').query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const response = await request(app)
        .post('/api/auth/register')
        .send(existingUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login existing user', async () => {
      const user = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock database response with hashed password
      require('../config/database').query
        .mockResolvedValueOnce({
          rows: [{
            id: 1,
            email: user.email,
            password: '$2b$10$somehashedpassword', // This should be a proper bcrypt hash
            name: 'Test User'
          }]
        });

      const response = await request(app)
        .post('/api/auth/login')
        .send(user)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', user.email);
    });

    it('should not login with invalid credentials', async () => {
      const user = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      };

      // Mock database to return no user
      require('../config/database').query
        .mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/api/auth/login')
        .send(user)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });
});
