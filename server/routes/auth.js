const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const User = require('../models/User');
const { auth, JWT_SECRET } = require('../middleware/auth');
const { memoryStore, isMongoConnected } = require('../services/db');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
  return jwt.sign({ userId: userId.toString() }, JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, username, email, password, avatar } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'All fields (name, username, email, password) are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Please enter a valid email address (e.g. user@gmail.com).' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');

    if (isMongoConnected()) {
      const existingUser = await User.findOne({
        $or: [{ email: cleanEmail }, { username: cleanUsername }],
      });

      if (existingUser) {
        if (existingUser.email === cleanEmail) {
          return res.status(400).json({ message: 'Email already registered. Please login.' });
        }
        return res.status(400).json({ message: 'Username is already taken. Please choose another.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const userAvatar = avatar || '';

      const newUser = new User({
        name: name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        avatar: userAvatar,
        badge: '👑 Legend',
        level: 7,
        points: 300,
        walletBalance: 0.0,
        authProvider: 'local',
      });

      await newUser.save();
      const token = generateToken(newUser._id);

      return res.status(201).json({
        message: 'Account created successfully!',
        token,
        user: newUser.toJSON(),
      });
    } else {
      // Memory Store Fallback
      const existing = memoryStore.users.find(
        (u) => u.email === cleanEmail || u.username === cleanUsername
      );
      if (existing) {
        if (existing.email === cleanEmail) {
          return res.status(400).json({ message: 'Email already registered. Please login.' });
        }
        return res.status(400).json({ message: 'Username is already taken.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: 'user_' + Date.now(),
        name: name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        avatar: avatar || '',
        badge: '👑 Legend',
        level: 7,
        points: 300,
        walletBalance: 0.0,
        authProvider: 'local',
        createdAt: new Date(),
      };

      memoryStore.users.push(newUser);
      const token = generateToken(newUser._id);
      const userResponse = { ...newUser };
      delete userResponse.password;

      return res.status(201).json({
        message: 'Account created successfully!',
        token,
        user: userResponse,
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Server error during signup.', error: error.message });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { loginIdentifier, email, password } = req.body;
    const identifier = (loginIdentifier || email || '').trim().toLowerCase();

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/Username and password are required.' });
    }

    const cleanId = identifier.replace(/^@/, '');
    let user;

    if (isMongoConnected()) {
      user = await User.findOne({
        $or: [{ email: identifier }, { username: cleanId }],
      });
    } else {
      user = memoryStore.users.find((u) => u.email === identifier || u.username === cleanId);
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password. Please try again.' });
    }

    const token = generateToken(user._id);
    const userRes = user.toJSON ? user.toJSON() : { ...user };
    delete userRes.password;

    return res.json({
      message: 'Login successful!',
      token,
      user: userRes,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
});
// @route   POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: 'Google credential is required.'
      });
    }
    console.log('GOOGLE CLIENT ID:', process.env.GOOGLE_CLIENT_ID);
    console.log('CREDENTIAL TYPE:', typeof credential);
    console.log('CREDENTIAL LENGTH:', credential?.length);
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;
    const googleId = payload.sub;

    if (!email) {
      return res.status(400).json({
        message: 'Google email not available.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    let user;

    if (isMongoConnected()) {
      user = await User.findOne({ email: cleanEmail });

      if (!user) {
        const baseUsername = cleanEmail
          .split('@')[0]
          .replace(/[^a-zA-Z0-9_]/g, '')
          .toLowerCase();

        let uniqueUsername = baseUsername || 'googleuser';
        let count = 1;

        while (await User.findOne({ username: uniqueUsername })) {
          uniqueUsername = `${baseUsername}${count}`;
          count++;
        }

        const hashedPassword = await bcrypt.hash(
          `google_${googleId}`,
          10
        );

        user = new User({
          name: name || 'Google User',
          username: uniqueUsername,
          email: cleanEmail,
          password: hashedPassword,
          avatar: picture || '',
          badge: '👑 Legend',
          level: 7,
          points: 300,
          walletBalance: 0,
          authProvider: 'google',
        });

        await user.save();
      }

      const token = generateToken(user._id);

      return res.json({
        message: 'Google login successful!',
        token,
        user: user.toJSON(),
      });
    }

    user = memoryStore.users.find(
      (u) => u.email === cleanEmail
    );

    if (!user) {
      const baseUsername = cleanEmail
        .split('@')[0]
        .replace(/[^a-zA-Z0-9_]/g, '')
        .toLowerCase();

      let uniqueUsername = baseUsername || 'googleuser';
      let unique = baseUsername;
      let count = 1;

      while (
        memoryStore.users.some(
          (u) => u.username === unique
        )
      ) {
        unique = `${baseUsername}${count}`;
        count++;
      }

      const hashedPassword = await bcrypt.hash(
        `google_${googleId}`,
        10
      );

      user = {
        _id: 'user_g_' + Date.now(),
        name: name || 'Google User',
        username: unique,
        email: cleanEmail,
        password: hashedPassword,
        avatar: picture || '',
        badge: '👑 Legend',
        level: 7,
        points: 300,
        walletBalance: 0,
        authProvider: 'google',
        createdAt: new Date(),
      };

      memoryStore.users.push(user);
    }

    const token = generateToken(user._id);

    const userResponse = { ...user };
    delete userResponse.password;

    return res.json({
      message: 'Google login successful!',
      token,
      user: userResponse,
    });

  } catch (error) {
    console.error('Google auth error:', error);

    return res.status(401).json({
      message: 'Google authentication failed.'
    });
  }
});
// @route   PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const userId = req.user._id || req.user.id;

    if (isMongoConnected()) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (name && name.trim()) user.name = name.trim();
      if (typeof avatar === 'string') user.avatar = avatar.trim();

      await user.save();
      return res.json({
        message: 'Profile updated successfully!',
        user: user.toJSON(),
      });
    } else {
      const userIndex = memoryStore.users.findIndex((u) => u._id.toString() === userId.toString());
      if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (name && name.trim()) memoryStore.users[userIndex].name = name.trim();
      if (typeof avatar === 'string') memoryStore.users[userIndex].avatar = avatar.trim();

      const userRes = { ...memoryStore.users[userIndex] };
      delete userRes.password;

      return res.json({
        message: 'Profile updated successfully!',
        user: userRes,
      });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ message: 'Failed to update profile.', error: error.message });
  }
});

// @route   GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const userRes = req.user.toJSON ? req.user.toJSON() : { ...req.user };
    delete userRes.password;
    return res.json({ user: userRes });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user.', error: error.message });
  }
});

module.exports = router;
