import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CreatePost from './components/CreatePost';
import FeedFilterTabs from './components/FeedFilterTabs';
import PostCard from './components/PostCard';
import BottomNav from './components/BottomNav';
import AuthScreen from './components/AuthScreen';
import ProfileModal from './components/ProfileModal';
import { authApi, postsApi } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNav, setActiveNav] = useState('social');
  const [darkMode, setDarkMode] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  // Check auth session on launch
  useEffect(() => {
    const token = localStorage.getItem('social_auth_token');
    if (!token) {
      setLoadingAuth(false);
      return;
    }

    authApi
      .getMe()
      .then((res) => setUser(res.user))
      .catch(() => localStorage.removeItem('social_auth_token'))
      .finally(() => setLoadingAuth(false));
  }, []);

  // Fetch posts from API
  const fetchPosts = useCallback(async () => {
    if (!user) return;
    setLoadingPosts(true);
    try {
      const res = await postsApi.getPosts(activeTab, searchQuery);
      setPosts(res.posts || []);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  }, [activeTab, searchQuery, user]);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [fetchPosts, user]);

  // Handle Post Creation
  const handlePostCreated = async (postData) => {
    const res = await postsApi.createPost(postData);
    if (res.post) {
      setPosts((prev) => [res.post, ...prev]);
    }
  };

  // Instant Like Update
  const handleLike = async (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id === postId) {
          const hasLiked = post.likes?.some((l) => l.userId?.toString() === user._id?.toString());
          const newLikes = hasLiked
            ? post.likes.filter((l) => l.userId?.toString() !== user._id?.toString())
            : [
              ...(post.likes || []),
              {
                userId: user._id,
                username: user.username,
                name: user.name,
                avatar: user.avatar,
              },
            ];
          return { ...post, likes: newLikes };
        }
        return post;
      })
    );

    try {
      const res = await postsApi.toggleLike(postId);
      if (res.post) {
        setPosts((prevPosts) =>
          prevPosts.map((p) => (p._id === postId ? { ...p, likes: res.post.likes } : p))
        );
      }
    } catch (err) {
      console.error('Failed to sync like:', err);
      fetchPosts();
    }
  };

  // Instant Comment Update
  const handleComment = async (postId, text) => {
    try {
      const res = await postsApi.addComment(postId, text);
      if (res.post) {
        setPosts((prevPosts) =>
          prevPosts.map((p) => (p._id === postId ? { ...p, comments: res.post.comments } : p))
        );
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  // Poll Vote
  const handleVote = async (postId, optionIndex) => {
    try {
      const res = await postsApi.votePoll(postId, optionIndex);
      if (res.post) {
        setPosts((prevPosts) =>
          prevPosts.map((p) => (p._id === postId ? { ...p, pollOptions: res.post.pollOptions } : p))
        );
      }
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  // Delete Post
  const handleDeletePost = async (postId) => {
    try {
      await postsApi.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  // Logout handler
  const handleLogout = () => {
    if (window.confirm(`Logout from @${user.username}?`)) {
      localStorage.removeItem('social_auth_token');
      setUser(null);
    }
  };

  // Scroll to create post
  const scrollToCreatePost = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const textarea = document.querySelector('.post-input-textarea');
    if (textarea) textarea.focus();
  };

  // Initial Auth Loading screen
  if (loadingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-color)' }}>
        <div style={{ textAlign: 'center', color: '#0076fe', fontWeight: 700 }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🪐</div>
          Loading TaskPlanet...
        </div>
      </div>
    );
  }

  // If user is NOT logged in, show dedicated Login & Sign Up Screen first!
  if (!user) {
    return <AuthScreen onAuthSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  // Once authenticated, show the complete Social Web Application Page!
  return (
    <div className="app-container">
      <div className="feed-wrapper">
        {/* Top Header */}
        <Header
          user={user}
          onLogout={handleLogout}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onOpenProfile={() => setShowProfileModal(true)}
        />

        {/* Search Bar */}
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={fetchPosts}
          user={user}
          onOpenProfile={() => setShowProfileModal(true)}
        />

        {/* Create Post Section */}
        <CreatePost
          user={user}
          onPostCreated={handlePostCreated}
          onRequireAuth={() => { }}
        />

        {/* Feed Filter Tabs */}
        <FeedFilterTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Posts List */}
        <div className="post-list">
          {loadingPosts ? (
            <div className="empty-feed-card">
              <div className="empty-icon">⏳</div>
              <p>Loading social feed...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-feed-card">
              <div className="empty-icon">📝</div>
              <p style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-main)' }}>
                No posts found
              </p>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>
                Be the first to share an update or promotion!
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUser={user}
                onLike={handleLike}
                onComment={handleComment}
                onVote={handleVote}
                onDelete={handleDeletePost}
                onRequireAuth={() => { }}
              />
            ))
          )}
        </div>

        {/* Bottom Navigation */}
        <BottomNav
          activeNav={activeNav}
          onNavChange={setActiveNav}
          onFloatingAddClick={scrollToCreatePost}
        />

        {/* Profile Edit / Avatar Customization Modal */}
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          user={user}
          onUserUpdated={(updatedUser) => {
            setUser(updatedUser);
            fetchPosts();
          }}
        />
      </div>
    </div>
  );
}
