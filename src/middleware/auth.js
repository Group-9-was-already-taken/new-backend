const jwt = require('jsonwebtoken');
const db = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Fetch user details from database
    const result = await db.query(
      'SELECT user_id, username, email FROM users WHERE user_id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    req.user = {
      ...result.rows[0],
      userId: result.rows[0].user_id // Ensure userId is set correctly
    };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = auth;
