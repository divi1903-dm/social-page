const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: 'https://api.dicebear.com/7.x/bottts/svg?seed=user_default',
    },
    badge: {
      type: String,
      default: '👑 Legend',
    },
    level: {
      type: Number,
      default: 7,
    },
    points: {
      type: Number,
      default: 300,
    },
    walletBalance: {
      type: Number,
      default: 0.0,
    },
    authProvider: {
      type: String,
      default: 'local', // 'local' or 'google'
    },
  },
  { timestamps: true }
);

// Virtual or helper for public profile
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
