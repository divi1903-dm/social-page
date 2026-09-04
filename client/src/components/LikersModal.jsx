import React from 'react';
import { X, Heart } from 'lucide-react';

export default function LikersModal({ isOpen, onClose, likes = [] }) {
  if (!isOpen) return null;

  return (
    <div className="likers-modal-overlay" onClick={onClose}>
      <div className="likers-modal" onClick={(e) => e.stopPropagation()}>
        <div className="likers-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '16px' }}>
            <Heart size={18} color="#ef4444" fill="#ef4444" />
            <span>Liked by ({likes.length})</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="likers-modal-list">
          {likes.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '16px' }}>
              No likes yet. Be the first to like!
            </p>
          ) : (
            likes.map((liker, idx) => (
              <div key={idx} className="liker-item">
                <img
                  src={liker.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'}
                  alt={liker.name}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                    {liker.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    @{liker.username}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
