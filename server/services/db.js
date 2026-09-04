// Smart Unified Data Layer (MongoDB Mongoose + In-Memory Fallback)
// Ensures 100% reliable functionality with strictly 2 Collections: Users and Posts

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let isMongoConnected = false;

mongoose.connection.on('connected', () => {
  isMongoConnected = true;
  console.log('✅ MongoDB Mongoose connected to database.');
});

mongoose.connection.on('disconnected', () => {
  isMongoConnected = false;
});

// Fallback Memory Data Store strictly modeled as 2 Collections
const memoryStore = {
  users: [],
  posts: [],
};

// Seed initial memory store if needed
const initSeedMemory = async () => {
  if (memoryStore.users.length === 0) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const nitin = {
      _id: 'user_nitin3w_01',
      name: 'Nitin Pandey',
      username: 'nitin3w',
      email: 'nitin@taskplanet.com',
      password: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      badge: '👑 Legend',
      level: 7,
      points: 300,
      walletBalance: 0.0,
      authProvider: 'local',
      createdAt: new Date(),
    };

    const demo = {
      _id: 'user_demo_02',
      name: 'Demo Explorer',
      username: 'demo_user',
      email: 'demo@taskplanet.com',
      password: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      badge: '⭐ Pro Member',
      level: 5,
      points: 150,
      walletBalance: 25.0,
      authProvider: 'local',
      createdAt: new Date(),
    };

    memoryStore.users.push(nitin, demo);

    const post1 = {
      _id: 'post_cpa_poll_01',
      author: {
        userId: nitin._id,
        name: nitin.name,
        username: nitin.username,
        avatar: nitin.avatar,
        badge: nitin.badge,
        level: nitin.level,
      },
      content: 'Have you tried CPA Lead offers yet?',
      imageUrl: '',
      postType: 'all',
      isPinned: true,
      pollOptions: [
        { text: 'Yes, still waiting.', votes: 76, votedUsers: [] },
        { text: 'I will try now.', votes: 29, votedUsers: [] },
        { text: 'Yes, I earned points!', votes: 16, votedUsers: [] },
        { text: 'Not yet, I need Help!', votes: 52, votedUsers: [] },
      ],
      likes: [
        {
          userId: nitin._id,
          username: nitin.username,
          name: nitin.name,
          avatar: nitin.avatar,
          likedAt: new Date(),
        },
      ],
      comments: [
        {
          _id: 'cmt_01',
          userId: nitin._id,
          username: nitin.username,
          name: nitin.name,
          avatar: nitin.avatar,
          text: 'Feel free to ask questions about CPA campaigns below! 🚀',
          createdAt: new Date(Date.now() - 3600000),
        },
      ],
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
    };

    const post2 = {
      _id: 'post_promo_02',
      author: {
        userId: 'user_priya_03',
        name: 'Priya Sharma',
        username: 'priya_creative',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        badge: '💎 Elite Creator',
        level: 9,
      },
      content: 'Excited to announce our new community rewards! Check out the brand new design! 🌟✨',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      postType: 'all',
      isPinned: false,
      pollOptions: [],
      likes: [],
      comments: [],
      createdAt: new Date(Date.now() - 172800000),
    };

    memoryStore.posts.push(post1, post2);
  }
};

initSeedMemory();

module.exports = {
  memoryStore,
  isMongoConnected: () => isMongoConnected,
};
