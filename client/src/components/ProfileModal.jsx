import React, { useState, useRef } from 'react';
import { X, Camera, Upload, Trash2, CheckCircle2, User as UserIcon, Link as LinkIcon } from 'lucide-react';
import { authApi } from '../services/api';

export default function ProfileModal({ isOpen, onClose, user, onUserUpdated }) {
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fileInputRef = useRef(null);

  if (!isOpen || !user) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file is too large (max 5MB).');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      setAvatar(customUrl.trim());
      setCustomUrl('');
      setShowUrlInput(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await authApi.updateProfile({
        name: name.trim(),
        avatar: avatar.trim(),
      });

      if (res.user) {
        onUserUpdated(res.user);
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <div className="profile-modal-title">
            <UserIcon size={20} color="var(--primary-blue)" />
            <span>My Profile & Avatar</span>
          </div>
          <button className="profile-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && <div className="auth-error-banner" style={{ margin: '10px 0' }}>{error}</div>}
        {success && <div className="auth-success-banner" style={{ margin: '10px 0' }}>{success}</div>}

        <form onSubmit={handleSaveProfile}>
          {/* Avatar Upload Section */}
          <div className="profile-avatar-upload-box">
            <div className="profile-avatar-preview-wrapper">
              {avatar ? (
                <img src={avatar} alt={user.name} className="profile-avatar-preview-img" />
              ) : (
                <div className="profile-avatar-empty">
                  <UserIcon size={44} color="#94a3b8" />
                  <span>No Photo</span>
                </div>
              )}

              <button
                type="button"
                className="profile-camera-badge-btn"
                title="Upload Photo"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={16} />
              </button>
            </div>

            <div className="profile-avatar-actions">
              <button
                type="button"
                className="avatar-action-btn primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} /> Upload Photo
              </button>

              <button
                type="button"
                className="avatar-action-btn"
                onClick={() => setShowUrlInput(!showUrlInput)}
              >
                <LinkIcon size={14} /> Image URL
              </button>

              {avatar && (
                <button
                  type="button"
                  className="avatar-action-btn danger"
                  onClick={handleRemoveAvatar}
                  title="Remove avatar"
                >
                  <Trash2 size={14} /> Clear
                </button>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />

            {/* Image URL input */}
            {showUrlInput && (
              <div className="avatar-url-input-row">
                <input
                  type="text"
                  placeholder="Paste profile photo URL..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="form-input"
                  style={{ padding: '8px 12px', fontSize: '13px' }}
                />
                <button
                  type="button"
                  className="url-add-btn"
                  onClick={handleApplyUrl}
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* User Information */}
          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your display name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              disabled
              className="form-input"
              value={`@${user.username}`}
              style={{ background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="text"
              disabled
              className="form-input"
              value={user.email || 'Not provided'}
              style={{ background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
            />
          </div>

          {/* Stats Bar */}
          <div className="profile-stats-row">
            <div className="profile-stat-box">
              <span className="stat-num">{user.points || 300}</span>
              <span className="stat-label">Points ⭐</span>
            </div>
            <div className="profile-stat-box">
              <span className="stat-num">₹{Number(user.walletBalance || 0).toFixed(2)}</span>
              <span className="stat-label">Wallet</span>
            </div>
            <div className="profile-stat-box">
              <span className="stat-num">{user.level || 7}</span>
              <span className="stat-label">Rank ({user.badge || '👑 Legend'})</span>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
            style={{ marginTop: '16px' }}
          >
            {loading ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
