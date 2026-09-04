import React from 'react';
import { Sun, Moon, LogOut, User as UserIcon } from 'lucide-react';

export default function Header({ user, onLogout, darkMode, setDarkMode, onOpenProfile }) {
  return (
    <header className="top-header">
      <div className="brand-title">Social</div>

      <div className="header-right-badges">
        {/* Points Badge */}
        <div className="stat-pill points" title="Reward Points">
          <span>{user ? user.points : 300}</span>
          <span className="star-icon">⭐</span>
        </div>

        {/* Currency / Wallet Badge */}
        <div className="stat-pill wallet" title="Wallet Balance">
          <span>₹{user ? Number(user.walletBalance).toFixed(2) : '0.00'}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          className="theme-toggle-btn"
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle Light/Dark Theme"
        >
          {darkMode ? <Moon size={16} /> : <Sun size={17} />}
        </button>

        {/* User Profile Avatar with level */}
        {user && (
          <div
            className="user-avatar-badge"
            title={`${user.name} (@${user.username}) - Click to Edit Profile / Avatar`}
            onClick={onOpenProfile}
            style={{ cursor: 'pointer' }}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
              />
            ) : (
              <div className="header-avatar-fallback">
                <UserIcon size={18} color="#64748b" />
              </div>
            )}
            <span className="level-indicator">{user.level || 7}%</span>
          </div>
        )}

        {/* Logout Button */}
        {user && (
          <button
            onClick={onLogout}
            className="logout-header-btn"
            title="Logout to Login Page"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
