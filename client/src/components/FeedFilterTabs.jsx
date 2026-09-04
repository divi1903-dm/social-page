import React from 'react';

const TABS = [
  { id: 'all', label: 'All Post' },
  { id: 'for_you', label: 'For You' },
  { id: 'most_liked', label: 'Most Liked' },
  { id: 'most_commented', label: 'Most Commented' },
  { id: 'most_shared', label: 'Most Shared' },
];

export default function FeedFilterTabs({ activeTab, onTabChange }) {
  return (
    <div className="filter-tabs-wrapper">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`filter-tab-pill ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
