import React, { useState, useRef } from 'react';
import { Camera, Smile, ListPlus, Megaphone, Send, X, RotateCw, Image as ImageIcon } from 'lucide-react';
import EmojiPicker from './EmojiPicker';

export default function CreatePost({ onPostCreated, user, onRequireAuth }) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [postType, setPostType] = useState('all'); // 'all' or 'promotion'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPollBuilder, setShowPollBuilder] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);

  const fileInputRef = useRef(null);

  // Handle local image file upload (converts to base64)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file is too large (max 5MB).');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectEmoji = (emoji) => {
    setContent((prev) => prev + emoji);
  };

  const handlePollOptionChange = (index, value) => {
    const updated = [...pollOptions];
    updated[index] = value;
    setPollOptions(updated);
  };

  const addPollOptionField = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const isFormValid =
    (content.trim().length > 0 || imageUrl.trim().length > 0 || (showPollBuilder && pollOptions.filter(o => o.trim()).length >= 2)) &&
    !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }

    if (!isFormValid) {
      setError('Please add some text, an image, or poll options to post.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const validPollOptions = showPollBuilder
        ? pollOptions.filter((opt) => opt.trim().length > 0).map((text) => ({ text: text.trim() }))
        : [];

      await onPostCreated({
        content: content.trim(),
        imageUrl: imageUrl.trim(),
        postType,
        pollOptions: validPollOptions.length >= 2 ? validPollOptions : undefined,
      });

      // Reset form
      setContent('');
      setImageUrl('');
      setShowUrlInput(false);
      setShowPollBuilder(false);
      setShowEmojiPicker(false);
      setPollOptions(['', '']);
    } catch (err) {
      setError(err.message || 'Failed to publish post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-card" style={{ position: 'relative' }}>
      {/* Header with Title and Toggle */}
      <div className="create-post-header">
        <h2 className="create-post-title">Create Post</h2>

        <div className="post-type-toggle">
          <button
            className="refresh-icon-btn"
            title="Reset form"
            onClick={() => {
              setContent('');
              setImageUrl('');
              setShowPollBuilder(false);
              setShowEmojiPicker(false);
            }}
          >
            <RotateCw size={14} />
          </button>
          <button
            className={`toggle-pill-btn ${postType === 'all' ? 'active' : ''}`}
            onClick={() => setPostType('all')}
          >
            All Posts
          </button>
          <button
            className={`toggle-pill-btn ${postType === 'promotion' ? 'active' : ''}`}
            onClick={() => setPostType('promotion')}
          >
            Promotions
          </button>
        </div>
      </div>

      {error && <div className="auth-error-banner" style={{ margin: '8px 0' }}>{error}</div>}

      {/* Text Area */}
      <textarea
        className="post-input-textarea"
        placeholder="What's on your mind?"
        rows={2}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onClick={() => {
          if (!user) onRequireAuth();
        }}
      />

      {/* Image Preview if selected */}
      {imageUrl && (
        <div className="image-preview-container">
          <img src={imageUrl} alt="Attached Preview" className="image-preview-img" />
          <button
            className="remove-img-btn"
            onClick={() => setImageUrl('')}
            title="Remove image"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Image URL input field */}
      {showUrlInput && !imageUrl && (
        <div className="url-input-container">
          <input
            type="text"
            className="url-text-input"
            placeholder="Paste image web URL..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <button
            className="url-add-btn"
            type="button"
            onClick={() => setShowUrlInput(false)}
          >
            Done
          </button>
        </div>
      )}

      {/* Poll Builder View */}
      {showPollBuilder && (
        <div style={{ marginBottom: '12px', background: '#f8fafc', padding: '10px', borderRadius: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-main)' }}>
            Poll Options (min 2):
          </div>
          {pollOptions.map((opt, idx) => (
            <input
              key={idx}
              type="text"
              className="search-input"
              style={{ marginBottom: '6px', fontSize: '13px', padding: '8px 12px' }}
              placeholder={`Option ${idx + 1}...`}
              value={opt}
              onChange={(e) => handlePollOptionChange(idx, e.target.value)}
            />
          ))}
          {pollOptions.length < 4 && (
            <button
              type="button"
              onClick={addPollOptionField}
              style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              + Add another option
            </button>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleFileUpload}
      />

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <EmojiPicker
          onSelectEmoji={handleSelectEmoji}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {/* Action Tools and Post Button */}
      <div className="create-post-actions">
        <div className="action-tools-left">
          {/* Camera / Photo Upload */}
          <button
            type="button"
            className="tool-btn"
            title="Upload image from device / Camera"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera size={19} />
          </button>

          {/* Web Image URL */}
          <button
            type="button"
            className="tool-btn"
            title="Image Web URL"
            onClick={() => setShowUrlInput(!showUrlInput)}
          >
            <ImageIcon size={18} />
          </button>

          {/* Emoji Keyboard Picker */}
          <button
            type="button"
            className={`tool-btn ${showEmojiPicker ? 'active' : ''}`}
            title="Emoji keyboard"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile size={19} />
          </button>

          {/* Poll Builder Button */}
          <button
            type="button"
            className="tool-btn"
            title="Create Poll"
            onClick={() => setShowPollBuilder(!showPollBuilder)}
          >
            <ListPlus size={19} />
          </button>

          {/* Promote Button */}
          <button
            type="button"
            className="tool-btn"
            onClick={() => setPostType(postType === 'promotion' ? 'all' : 'promotion')}
            style={{ color: postType === 'promotion' ? '#d97706' : 'var(--primary-blue)' }}
          >
            <Megaphone size={17} />
            <span>Promote</span>
          </button>
        </div>

        {/* Post Button */}
        <button
          type="button"
          className={`post-submit-btn ${isFormValid ? 'enabled' : ''}`}
          disabled={!isFormValid || loading}
          onClick={handleSubmit}
        >
          <Send size={15} />
          <span>{loading ? 'Posting...' : 'Post'}</span>
        </button>
      </div>
    </div>
  );
}
