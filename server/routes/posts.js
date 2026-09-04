const express = require('express');
const Post = require('../models/Post');
const { auth } = require('../middleware/auth');
const { memoryStore, isMongoConnected } = require('../services/db');

const router = express.Router();

// @route   GET /api/posts
router.get('/', async (req, res) => {
  try {
    const { filter, q, type } = req.query;

    if (isMongoConnected()) {
      let query = {};
      if (q && q.trim()) {
        const regex = new RegExp(q.trim(), 'i');
        query.$or = [
          { content: regex },
          { 'author.name': regex },
          { 'author.username': regex },
        ];
      }
      if (type && type !== 'all') {
        query.postType = type;
      }

      let posts = await Post.find(query).sort({ isPinned: -1, createdAt: -1 });

      if (filter === 'most_liked') {
        posts = posts.sort((a, b) => b.likes.length - a.likes.length);
      } else if (filter === 'most_commented') {
        posts = posts.sort((a, b) => b.comments.length - a.comments.length);
      }

      return res.json({ posts });
    } else {
      let posts = [...memoryStore.posts];

      if (q && q.trim()) {
        const term = q.trim().toLowerCase();
        posts = posts.filter(
          (p) =>
            (p.content && p.content.toLowerCase().includes(term)) ||
            (p.author?.name && p.author.name.toLowerCase().includes(term)) ||
            (p.author?.username && p.author.username.toLowerCase().includes(term))
        );
      }

      if (type && type !== 'all') {
        posts = posts.filter((p) => p.postType === type);
      }

      // Sort pinned first, then newest
      posts.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      if (filter === 'most_liked') {
        posts.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
      } else if (filter === 'most_commented') {
        posts.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
      }

      return res.json({ posts });
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({ message: 'Failed to fetch posts.', error: error.message });
  }
});

// @route   POST /api/posts
router.post('/', auth, async (req, res) => {
  try {
    const { content, imageUrl, postType, pollOptions } = req.body;

    const hasContent = content && content.trim().length > 0;
    const hasImage = imageUrl && imageUrl.trim().length > 0;
    const hasPoll = Array.isArray(pollOptions) && pollOptions.length >= 2;

    if (!hasContent && !hasImage && !hasPoll) {
      return res.status(400).json({
        message: 'Post must have either text content, an image, or poll options.',
      });
    }

    const authorData = {
      userId: req.user._id,
      name: req.user.name,
      username: req.user.username,
      avatar: req.user.avatar,
      badge: req.user.badge || '👑 Legend',
      level: req.user.level || 7,
    };

    if (isMongoConnected()) {
      const newPost = new Post({
        author: authorData,
        content: hasContent ? content.trim() : '',
        imageUrl: hasImage ? imageUrl.trim() : '',
        postType: postType || 'all',
        pollOptions: hasPoll
          ? pollOptions.map((opt) => ({
              text: opt.text || opt,
              votes: 0,
              votedUsers: [],
            }))
          : [],
        likes: [],
        comments: [],
      });

      await newPost.save();
      return res.status(201).json({ message: 'Post created successfully!', post: newPost });
    } else {
      const newPost = {
        _id: 'post_' + Date.now(),
        author: authorData,
        content: hasContent ? content.trim() : '',
        imageUrl: hasImage ? imageUrl.trim() : '',
        postType: postType || 'all',
        pollOptions: hasPoll
          ? pollOptions.map((opt) => ({
              text: opt.text || opt,
              votes: 0,
              votedUsers: [],
            }))
          : [],
        likes: [],
        comments: [],
        isPinned: false,
        createdAt: new Date(),
      };

      memoryStore.posts.unshift(newPost);
      return res.status(201).json({ message: 'Post created successfully!', post: newPost });
    }
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({ message: 'Failed to create post.', error: error.message });
  }
});

// @route   POST /api/posts/:id/like
router.post('/:id/like', auth, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: 'Post not found.' });

      const idx = post.likes.findIndex((l) => l.userId.toString() === req.user._id.toString());
      let isLiked = false;
      if (idx > -1) {
        post.likes.splice(idx, 1);
        isLiked = false;
      } else {
        post.likes.push({
          userId: req.user._id,
          username: req.user.username,
          name: req.user.name,
          avatar: req.user.avatar,
          likedAt: new Date(),
        });
        isLiked = true;
      }
      await post.save();
      return res.json({ message: isLiked ? 'Post liked!' : 'Post unliked!', isLiked, post });
    } else {
      const post = memoryStore.posts.find((p) => p._id.toString() === req.params.id.toString());
      if (!post) return res.status(404).json({ message: 'Post not found.' });

      if (!post.likes) post.likes = [];
      const idx = post.likes.findIndex((l) => l.userId.toString() === req.user._id.toString());
      let isLiked = false;
      if (idx > -1) {
        post.likes.splice(idx, 1);
        isLiked = false;
      } else {
        post.likes.push({
          userId: req.user._id,
          username: req.user.username,
          name: req.user.name,
          avatar: req.user.avatar,
          likedAt: new Date(),
        });
        isLiked = true;
      }

      return res.json({ message: isLiked ? 'Post liked!' : 'Post unliked!', isLiked, post });
    }
  } catch (error) {
    console.error('Error liking post:', error);
    return res.status(500).json({ message: 'Failed to toggle like.', error: error.message });
  }
});

// @route   POST /api/posts/:id/comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text cannot be empty.' });
    }

    const newComment = {
      _id: 'cmt_' + Date.now(),
      userId: req.user._id,
      username: req.user.username,
      name: req.user.name,
      avatar: req.user.avatar,
      text: text.trim(),
      createdAt: new Date(),
    };

    if (isMongoConnected()) {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: 'Post not found.' });

      post.comments.push(newComment);
      await post.save();
      return res.status(201).json({ message: 'Comment added!', comment: newComment, post });
    } else {
      const post = memoryStore.posts.find((p) => p._id.toString() === req.params.id.toString());
      if (!post) return res.status(404).json({ message: 'Post not found.' });

      if (!post.comments) post.comments = [];
      post.comments.push(newComment);
      return res.status(201).json({ message: 'Comment added!', comment: newComment, post });
    }
  } catch (error) {
    console.error('Error adding comment:', error);
    return res.status(500).json({ message: 'Failed to add comment.', error: error.message });
  }
});

// @route   POST /api/posts/:id/vote
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { optionIndex } = req.body;

    if (isMongoConnected()) {
      const post = await Post.findById(req.params.id);
      if (!post || !post.pollOptions || !post.pollOptions[optionIndex]) {
        return res.status(400).json({ message: 'Invalid poll option.' });
      }

      const alreadyVoted = post.pollOptions.some((opt) =>
        opt.votedUsers?.some((uid) => uid.toString() === req.user._id.toString())
      );
      if (alreadyVoted) {
        return res.status(400).json({ message: 'You have already voted.' });
      }

      post.pollOptions[optionIndex].votes = (post.pollOptions[optionIndex].votes || 0) + 1;
      post.pollOptions[optionIndex].votedUsers.push(req.user._id);
      await post.save();

      return res.json({ message: 'Vote recorded!', post });
    } else {
      const post = memoryStore.posts.find((p) => p._id.toString() === req.params.id.toString());
      if (!post || !post.pollOptions || !post.pollOptions[optionIndex]) {
        return res.status(400).json({ message: 'Invalid poll option.' });
      }

      const alreadyVoted = post.pollOptions.some((opt) =>
        opt.votedUsers?.some((uid) => uid.toString() === req.user._id.toString())
      );
      if (alreadyVoted) {
        return res.status(400).json({ message: 'You have already voted.' });
      }

      post.pollOptions[optionIndex].votes = (post.pollOptions[optionIndex].votes || 0) + 1;
      if (!post.pollOptions[optionIndex].votedUsers) {
        post.pollOptions[optionIndex].votedUsers = [];
      }
      post.pollOptions[optionIndex].votedUsers.push(req.user._id);

      return res.json({ message: 'Vote recorded!', post });
    }
  } catch (error) {
    console.error('Error voting:', error);
    return res.status(500).json({ message: 'Failed to submit vote.', error: error.message });
  }
});

// @route   DELETE /api/posts/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: 'Post not found.' });

      if (post.author.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized to delete this post.' });
      }

      await Post.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Post deleted successfully.', postId: req.params.id });
    } else {
      const index = memoryStore.posts.findIndex((p) => p._id.toString() === req.params.id.toString());
      if (index === -1) return res.status(404).json({ message: 'Post not found.' });

      if (memoryStore.posts[index].author.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized to delete this post.' });
      }

      memoryStore.posts.splice(index, 1);
      return res.json({ message: 'Post deleted successfully.', postId: req.params.id });
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    return res.status(500).json({ message: 'Failed to delete post.', error: error.message });
  }
});

module.exports = router;
