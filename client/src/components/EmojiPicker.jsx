import React, { useState } from 'react';
import { X } from 'lucide-react';

const EMOJI_CATEGORIES = [
  {
    name: 'Smileys',
    icon: '😀',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
      '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
      '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
      '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
      '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐',
      '😕', '😟', '🙁', '😮', '😯', '😲', '😳', '🥺', '😦', '😧',
      '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓',
      '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀',
    ],
  },
  {
    name: 'Gestures',
    icon: '👍',
    emojis: [
      '👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '👊', '✊', '🤛',
      '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '🤌', '🤏', '👈', '👉',
      '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪',
      '🦾', '✍️', '🙏', '💅', '🤳', '💃', '🕺', '🏃', '🧘', '👑',
    ],
  },
  {
    name: 'Hearts',
    icon: '❤️',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌',
      '💋', '🔥', '✨', '⭐', '🌟', '💫', '⚡', '💥', '💯', '💢',
    ],
  },
  {
    name: 'Celebration & Fun',
    icon: '🎉',
    emojis: [
      '🎉', '🎊', '🎁', '🎈', '🏆', '🥇', '🥈', '🥉', '🎯', '🚀',
      '💼', '📱', '💻', '📸', '💡', '💰', '💸', '🔔', '📢', '🪐',
      '🌍', '🌈', '☕', '🍕', '🍔', '🍟', '🍦', '🎂', '🍿', '🍻',
    ],
  },
];

export default function EmojiPicker({ onSelectEmoji, onClose }) {
  const [activeCategory, setActiveCategory] = useState(0);

  const currentEmojis = EMOJI_CATEGORIES[activeCategory].emojis;

  return (
    <div className="emoji-picker-container" onClick={(e) => e.stopPropagation()}>
      <div className="emoji-picker-header">
        <span className="emoji-picker-title">Emoji Keyboard</span>
        <button type="button" className="emoji-picker-close-btn" onClick={onClose} title="Close">
          <X size={16} />
        </button>
      </div>

      {/* Category Tabs */}
      <div className="emoji-category-tabs">
        {EMOJI_CATEGORIES.map((cat, idx) => (
          <button
            key={cat.name}
            type="button"
            className={`emoji-cat-btn ${activeCategory === idx ? 'active' : ''}`}
            onClick={() => setActiveCategory(idx)}
            title={cat.name}
          >
            {cat.icon}
          </button>
        ))}
      </div>

      {/* Emojis Grid */}
      <div className="emoji-grid-scroll">
        <div className="emoji-grid">
          {currentEmojis.map((emoji, idx) => (
            <button
              key={idx}
              type="button"
              className="emoji-grid-item"
              onClick={() => {
                onSelectEmoji(emoji);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
