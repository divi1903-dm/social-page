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

const postSchema = new mongoose.Schema(
  {
    author: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
      avatar: {
        type: String,
      },
      badge: {
        type: String,
        default: '👑 Legend',
      },
      level: {
        type: Number,
        default: 7,
      },
    },
    content: {
      type: String,
      default: '',
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    postType: {
      type: String,
      enum: ['all', 'promotion', 'poll'],
      default: 'all',
    },
    pollOptions: [pollOptionSchema],
    likes: [likeSchema],
    comments: [commentSchema],
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual counts for quick access
postSchema.virtual('likesCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

postSchema.virtual('commentsCount').get(function () {
  return this.comments ? this.comments.length : 0;
});

// Custom validation: at least content or imageUrl or pollOptions must be present
postSchema.pre('validate', function (next) {
  if (
    (!this.content || this.content.trim() === '') &&
    (!this.imageUrl || this.imageUrl.trim() === '') &&
    (!this.pollOptions || this.pollOptions.length === 0)
  ) {
    next(new Error('Post must have either text content, an image, or poll options.'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Post', postSchema);
