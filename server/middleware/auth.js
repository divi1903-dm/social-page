const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { memoryStore, isMongoConnected } = require('../services/db');

const JWT_SECRET = process.env.JWT_SECRET || 'taskplanet_super_secret_jwt_key_2026';

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const decoded = jwt.verify(token, JWT_SECRET);

    let user;
    if (isMongoConnected()) {
      user = await User.findById(decoded.userId);
    } else {
      user = memoryStore.users.find((u) => u._id.toString() === decoded.userId.toString());
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found or token invalid.' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.', error: error.message });
  }
};

module.exports = { auth, JWT_SECRET };
