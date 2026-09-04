import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Send,
  Trash2,
  CheckCircle2,
  Pin,
  User as UserIcon,
} from 'lucide-react';
import LikersModal from './LikersModal';
import ShareModal from './ShareModal';

export default function PostCard({
  post,
  currentUser,
  onLike,
  onComment,
  onVote,
  onDelete,
  onRequireAuth,
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showLikersModal, setShowLikersModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  // Check if current user has liked
  const isLiked = currentUser
    ? post.likes?.some((like) => like.userId?.toString() === currentUser._id?.toString())
    : false;

  // Format relative timestamp
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Poll calculations
  const totalVotes = post.pollOptions?.reduce((acc, opt) => acc + (opt.votes || 0), 0) || 0;
  const userVotedOptionIndex = currentUser && post.pollOptions
    ? post.pollOptions.findIndex((opt) =>
      opt.votedUsers?.some((uid) => uid.toString() === currentUser._id?.toString())
    )
    : -1;

  const handleLikeClick = () => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    onLike(post._id);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      await onComment(post._id, commentText.trim());
      setCommentText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleVoteClick = (index) => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    if (userVotedOptionIndex !== -1) return; // already voted
    onVote(post._id, index);
  };

  const isAuthor = currentUser && post.author?.userId?.toString() === currentUser._id?.toString();

  return (
    <div className="post-card">
      {/* Pinned badge */}
      {post.isPinned && (
        <div className="pin-indicator" title="Pinned Post">
          📌
        </div>
      )}

      {/* Post Header */}
      <div className="post-header">
        <div className="post-author-meta">
          {post.author?.avatar ? (
            <img
              src={post.author.avatar}
              alt={post.author?.name}
              className="author-avatar"
            />
          ) : (
            <div className="author-avatar-fallback">
              <UserIcon size={20} color="#64748b" />
            </div>
          )}

          <div className="author-details">
            <div className="author-name-row">
              <span className="author-name">{post.author?.name || 'TaskPlanet Member'}</span>
              <span className="author-badge-pill">
                <span className="author-level">{post.author?.level || 7}</span>
                <span>{post.author?.badge || '👑 Legend'}</span>
              </span>
            </div>
            <div className="author-username-row">
              <span className="author-username">@{post.author?.username || 'member'}</span>
              <span className="post-time">{formatTimeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="post-header-actions">
          {!isAuthor && (
            <button
              className={`follow-btn ${isFollowing ? 'following' : ''}`}
              onClick={() => {
                if (!currentUser) onRequireAuth();
                else setIsFollowing(!isFollowing);
              }}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}

          <div style={{ position: 'relative' }}>
            <button
              className="more-options-btn"
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              title="More options"
            >
              <MoreHorizontal size={20} />
            </button>

            {showOptionsMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '28px',
                  background: '#ffffff',
                  boxShadow: 'var(--shadow-md)',
                  borderRadius: '10px',
                  padding: '6px',
                  zIndex: 10,
                  minWidth: '130px',
                  border: '1px solid var(--border-color)',
                }}
              >
                {isAuthor && (
                  <button
                    onClick={() => {
                      setShowOptionsMenu(false);
                      onDelete(post._id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#dc2626',
                      background: 'none',
                      border: 'none',
                      padding: '8px 10px',
                      fontSize: '13px',
                      width: '100%',
                      cursor: 'pointer',
                      borderRadius: '6px',
                    }}
                  >
                    <Trash2 size={15} /> Delete Post
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowOptionsMenu(false);
                    setShowShareModal(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--text-main)',
                    background: 'none',
                    border: 'none',
                    padding: '8px 10px',
                    fontSize: '13px',
                    width: '100%',
                    cursor: 'pointer',
                    borderRadius: '6px',
                  }}
                >
                  <Share2 size={15} /> Share Post
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Text Content */}
      {post.content && (
        <div className="post-content-text" style={{ fontFamily: post.pollOptions?.length ? 'Fredoka, sans-serif' : 'inherit' }}>
          {post.content}
        </div>
      )}

      {/* Attached Image if present */}
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post attached media"
          className="post-attached-image"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}

      {/* Poll Component */}
      {post.pollOptions && post.pollOptions.length > 0 && (
        <div className="poll-container">
          {post.pollOptions.map((option, idx) => {
            const votes = option.votes || 0;
            const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
            const isSelected = userVotedOptionIndex === idx;

            return (
              <div
                key={idx}
                className={`poll-option-row ${isSelected ? 'voted' : ''}`}
                onClick={() => handleVoteClick(idx)}
                style={{
                  cursor: userVotedOptionIndex !== -1 ? 'default' : 'pointer',
                  borderColor: isSelected ? 'var(--primary-blue)' : undefined,
                }}
              >
                {/* Progress bar fill */}
                {totalVotes > 0 && (
                  <div
                    className="poll-progress-bg"
                    style={{ width: `${percentage}%` }}
                  />
                )}

                <div className="poll-option-left">
                  <div className="poll-radio-circle">
                    {isSelected && <div className="poll-radio-dot" />}
                  </div>
                  <span className="poll-option-text">{option.text}</span>
                </div>

                <span className="poll-percentage">{percentage}%</span>
              </div>
            );
          })}

          <div className="poll-footer-meta">
            <span>{totalVotes} votes</span>
            <span>🕒 5d 22h left</span>
          </div>
        </div>
      )}

      {/* Post Action Bar (Like, Comment, Share) */}
      <div className="post-action-bar">
        {/* Like Button */}
        <button
          className={`post-action-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLikeClick}
          title={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart size={18} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : 'currentColor'} />
          <span>{post.likes?.length || 0}</span>
        </button>

        {/* Comment Button */}
        <button
          className="post-action-btn"
          onClick={() => setShowComments(!showComments)}
          title="Comments"
        >
          <MessageCircle size={18} />
          <span>{post.comments?.length || 0}</span>
        </button>

        {/* Share Button */}
        <button
          className="post-action-btn"
          onClick={() => setShowShareModal(true)}
          title="Share post"
        >
          <Share2 size={18} />
          <span>Share</span>
        </button>
      </div>

      {/* Likers snippet */}
      {post.likes && post.likes.length > 0 && (
        <div className="likers-preview">
          <span>Liked by</span>
          <b onClick={() => setShowLikersModal(true)}>
            {post.likes[post.likes.length - 1]?.name || post.likes[post.likes.length - 1]?.username}
          </b>
          {post.likes.length > 1 && (
            <span onClick={() => setShowLikersModal(true)} style={{ cursor: 'pointer' }}>
              {' '}and <b style={{ color: 'var(--primary-blue)' }}>{post.likes.length - 1} other{post.likes.length > 2 ? 's' : ''}</b>
            </span>
          )}
        </div>
      )}

      {/* Comments Section */}
      {showComments && (
        <div className="comments-container">
          {/* List of comments */}
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((cmt, idx) => (
              <div key={cmt._id || idx} className="comment-item">
                {cmt.avatar ? (
                  <img
                    src={cmt.avatar}
                    alt={cmt.name}
                    className="comment-avatar"
                  />
                ) : (
                  <div className="comment-avatar-fallback">
                    <UserIcon size={14} color="#64748b" />
                  </div>
                )}
                <div className="comment-bubble">
                  <div>
                    <span className="comment-bubble-name">{cmt.name || `@${cmt.username}`}</span>
                    <span className="comment-bubble-text">{cmt.text}</span>
                  </div>
                  <span className="comment-time">{formatTimeAgo(cmt.createdAt)}</span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', padding: '4px 0' }}>
              No comments yet. Write the first comment!
            </div>
          )}

          {/* Add comment box */}
          <form className="comment-input-row" onSubmit={handleCommentSubmit}>
            <input
              type="text"
              className="comment-input-box"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={isSubmittingComment}
            />
            <button
              type="submit"
              className="comment-send-btn"
              disabled={isSubmittingComment || !commentText.trim()}
              title="Post comment"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Likers Modal Popup */}
      <LikersModal
        isOpen={showLikersModal}
        onClose={() => setShowLikersModal(false)}
        likes={post.likes || []}
      />

      {/* Share Modal Popup */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        post={post}
      />
    </div>
  );
}
