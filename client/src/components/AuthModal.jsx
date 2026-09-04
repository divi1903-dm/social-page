import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, LogIn, UserPlus } from 'lucide-react';
import { authApi } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' or 'signup'
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (tab === 'login') {
        data = await authApi.login({
          loginIdentifier: formData.email,
          password: formData.password,
        });
      } else {
        data = await authApi.signup(formData);
      }

      localStorage.setItem('social_auth_token', data.token);
      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // One-click Google Login flow
  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      // Mock Google Profile / OAuth Flow
      const mockGoogleProfiles = [
        {
          email: 'alex.rivera@gmail.com',
          name: 'Alex Rivera',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        },
        {
          email: 'sam.taylor@gmail.com',
          name: 'Sam Taylor',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        },
      ];

      const selected = mockGoogleProfiles[Math.floor(Math.random() * mockGoogleProfiles.length)];
      const data = await authApi.googleAuth(selected);

      localStorage.setItem('social_auth_token', data.token);
      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Demo user fast login
  const handleFastDemoLogin = async (username, password) => {
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login({
        loginIdentifier: username,
        password: password,
      });
      localStorage.setItem('social_auth_token', data.token);
      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-card" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Auth Brand Header */}
        <div className="auth-header">
          <div className="auth-logo">Social</div>
          <p className="auth-subtitle">
            {tab === 'login'
              ? 'Welcome back! Login to explore & create posts.'
              : 'Join the community and start posting today!'}
          </p>
        </div>

        {/* Tabs for Login / Sign Up */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setTab('login');
              setError('');
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setTab('signup');
              setError('');
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Continue with Google Option */}
        <button
          type="button"
          className="google-auth-btn"
          onClick={handleGoogleAuth}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="auth-divider">
          <span>or with email</span>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        {/* Email & Password Form */}
        <form className="auth-form" onSubmit={handleAuth}>
          {tab === 'signup' && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. John Doe"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="e.g. johndoe"
                  className="form-input"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">
              {tab === 'login' ? 'Email or Username' : 'Email Address'}
            </label>
            <input
              type="text"
              name="email"
              required
              placeholder={tab === 'login' ? 'nitin3w or nitin@taskplanet.com' : 'you@example.com'}
              className="form-input"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Quick Demo Logins for easy evaluation */}
        <div style={{ marginTop: '16px', background: '#f8fafc', padding: '10px 12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '6px', textAlign: 'center' }}>
            ⚡ QUICK DEMO LOGINS:
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleFastDemoLogin('nitin3w', 'password123')}
              style={{
                flex: 1,
                padding: '6px',
                fontSize: '11px',
                fontWeight: 600,
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              👑 Nitin Pandey
            </button>
            <button
              type="button"
              onClick={() => handleFastDemoLogin('demo_user', 'password123')}
              style={{
                flex: 1,
                padding: '6px',
                fontSize: '11px',
                fontWeight: 600,
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              ⭐ Demo User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
