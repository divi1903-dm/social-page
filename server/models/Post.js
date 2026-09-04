const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const likeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    likedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const pollOptionSchema = new mongoose.Schema({
  text: String,
  votes: {
    type: Number,
    default: 0,
  },
  votedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

postSchema.pre('validate', async function () {
  if (
    (!this.content || this.content.trim() === '') &&
    (!this.imageUrl || this.imageUrl.trim() === '') &&
    (!this.pollOptions || this.pollOptions.length === 0)
  ) {
    throw new Error(
      'Post must have either text content, an image, or poll options.'
    );
  }
});