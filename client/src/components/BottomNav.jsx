import React from 'react';
import { Home, CheckSquare, Users, Trophy, MessageSquare, Plus } from 'lucide-react';

export default function BottomNav({ activeNav = 'social', onNavChange, onFloatingAddClick }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'social', label: 'Social', icon: Users },
    { id: 'leaderboard', label: 'Leader Board', icon: Trophy },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
  ];

  return (
    <>
      {/* Floating Add '+' Button */}
      <button
        className="floating-add-btn"
        onClick={onFloatingAddClick}
        title="Create New Post"
      >
        <Plus size={24} />
      </button>

      {/* Bottom Navigation Bar */}
      <nav className="bottom-nav-bar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          const isDummy = item.id !== 'social';
          return (
            <button
              key={item.id}
              type="button"
              disabled={isDummy}
              className={`nav-item-btn ${isActive ? 'active' : ''} ${isDummy ? 'disabled-tab' : ''}`}
              onClick={() => {
                if (!isDummy) {
                  onNavChange(item.id);
                }
              }}
              title={isDummy ? `${item.label} (Coming Soon)` : item.label}
            >
              <div className="nav-icon-wrapper">
                <Icon size={19} />
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
