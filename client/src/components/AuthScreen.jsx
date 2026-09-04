import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, LogIn, UserPlus, Sparkles, CheckCircle2 } from 'lucide-react';
import { authApi } from '../services/api';
import { GoogleLogin } from '@react-oauth/google';

export default function AuthScreen({ onAuthSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' or 'signup'
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    // Validation
    if (tab === 'signup' && !isValidEmail(formData.email)) {
      setError('Please enter a valid email address (e.g. name@gmail.com)');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      let data;
      if (tab === 'login') {
        data = await authApi.login({
          loginIdentifier: formData.email,
          password: formData.password,
        });
      } else {
        data = await authApi.signup({
          ...formData,
          avatar: '', // Starts empty for user to create/upload
        });
      }

      localStorage.setItem('social_auth_token', data.token);
      onAuthSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-screen-wrapper">
      <div className="auth-card-standalone">
        {/* Brand Banner */}
        <div className="auth-header">
          <div className="auth-brand-logo">Social</div>
          <div className="auth-brand-badge">
            <Sparkles size={14} color="#f59e0b" />
            <span>TaskPlanet Feed Portal</span>
          </div>
          <p className="auth-subtitle" style={{ marginTop: '8px' }}>
            {tab === 'login'
              ? 'Login with your email to view feed, like posts, and share updates!'
              : 'Create a new account with your real email to join TaskPlanet!'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setTab('login');
              setError('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setTab('signup');
              setError('');
            }}
          >
            Create Account
          </button>
        </div>
        {/* Continue with Google */}
        <div className="google-auth-btn">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                setError('');
                setLoading(true);

                const data = await authApi.googleAuth(
                  credentialResponse.credential
                );

                localStorage.setItem(
                  'social_auth_token',
                  data.token
                );

                onAuthSuccess(data.user);
              } catch (err) {
                setError(
                  err.message || 'Google authentication failed.'
                );
              } finally {
                setLoading(false);
              }
            }}
            onError={() => {
              setError('Google Login failed. Please try again.');
            }}
            useOneTap={false}
          />
        </div>

        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        {/* Auth Form */}
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
                  placeholder="e.g. johndoe24"
                  className="form-input"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">
              {tab === 'login' ? 'Email Address or Username' : 'Email Address'}
            </label>
            <input
              type="text"
              name="email"
              required
              placeholder={tab === 'login' ? 'you@gmail.com or username' : 'you@gmail.com'}
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
            {loading ? 'Authenticating...' : tab === 'login' ? 'Sign In & Enter Social Feed →' : 'Create Account & Continue →'}
          </button>
        </form>
      </div>
    </div>
  );
}