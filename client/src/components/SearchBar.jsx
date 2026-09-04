import React from 'react';
import { Search, User as UserIcon } from 'lucide-react';

export default function SearchBar({ searchQuery, setSearchQuery, onSearch, user, onOpenProfile }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="search-section">
      <form className="search-box-container" onSubmit={handleSubmit}>
        <input
          type="text"
          className="search-input"
          placeholder="Search promotions, users, posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-submit-btn" title="Search">
          <Search size={17} />
        </button>
      </form>

      {/* Right profile icon */}
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="search-user-avatar"
          onClick={onOpenProfile}
          title={`@${user.username} - Edit Profile`}
        />
      ) : (
        <div
          className="search-avatar-fallback"
          onClick={onOpenProfile}
          title={user ? `@${user.username} - Edit Profile` : 'Profile'}
        >
          <UserIcon size={18} color="#64748b" />
        </div>
      )}
    </div>
  );
}
