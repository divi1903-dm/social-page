import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, Twitter, Facebook, Share2 } from 'lucide-react';

export default function ShareModal({ isOpen, onClose, post }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !post) return null;

  const shareUrl = window.location.origin;
  const shareText = `Check out this post by @${post.author?.username || 'user'} on TaskPlanet: "${post.content ? post.content.substring(0, 100) : 'Social post'}"`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TaskPlanet Social',
          text: shareText,
          url: shareUrl,
        });
        onClose();
      } catch (err) {
        console.log('Native share canceled or failed', err);
      }
    }
  };

  const shareToWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="share-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <div className="share-modal-title">
            <Share2 size={18} color="var(--primary-blue)" />
            <span>Share Post</span>
          </div>
          <button className="share-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Post snippet */}
        <div className="share-post-preview">
          <div className="share-author-row">
            <span className="share-author-name">{post.author?.name || 'TaskPlanet User'}</span>
            <span className="share-author-handle">@{post.author?.username || 'member'}</span>
          </div>
          <p className="share-post-text">{post.content || '(Media attachment)'}</p>
        </div>

        {/* Social Share Buttons Grid */}
        <div className="share-options-grid">
          {navigator.share && (
            <button type="button" className="share-btn native" onClick={handleNativeShare}>
              <div className="share-icon-circle native">
                <Share2 size={20} />
              </div>
              <span>More Options</span>
            </button>
          )}

          <button type="button" className="share-btn whatsapp" onClick={shareToWhatsApp}>
            <div className="share-icon-circle whatsapp">
              💬
            </div>
            <span>WhatsApp</span>
          </button>

          <button type="button" className="share-btn twitter" onClick={shareToTwitter}>
            <div className="share-icon-circle twitter">
              <Twitter size={18} />
            </div>
            <span>X (Twitter)</span>
          </button>

          <button type="button" className="share-btn facebook" onClick={shareToFacebook}>
            <div className="share-icon-circle facebook">
              <Facebook size={18} />
            </div>
            <span>Facebook</span>
          </button>
        </div>

        {/* Copy Link Input Section */}
        <div className="share-copy-box">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="share-copy-input"
          />
          <button
            type="button"
            className={`share-copy-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopyLink}
          >
            {copied ? (
              <>
                <Check size={16} />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
