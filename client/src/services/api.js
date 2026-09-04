const API_BASE = '/api';

// Retrieve auth token
const getToken = () => localStorage.getItem('social_auth_token');

// API request helper with auth headers
export const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// Auth API calls
export const authApi = {
  signup: (userData) => apiRequest('/auth/signup', 'POST', userData),
  login: (credentials) => apiRequest('/auth/login', 'POST', credentials),
  googleAuth: (credential) =>
    apiRequest('/auth/google', 'POST', { credential }),
  getMe: () => apiRequest('/auth/me', 'GET'),
  updateProfile: (data) => apiRequest('/auth/profile', 'PUT', data),
};

// Posts API calls
export const postsApi = {
  getPosts: (filter = 'all', q = '', type = 'all') => {
    const params = new URLSearchParams();
    if (filter) params.append('filter', filter);
    if (q) params.append('q', q);
    if (type) params.append('type', type);
    return apiRequest(`/posts?${params.toString()}`, 'GET');
  },
  createPost: (postData) => apiRequest('/posts', 'POST', postData),
  toggleLike: (postId) => apiRequest(`/posts/${postId}/like`, 'POST'),
  addComment: (postId, text) => apiRequest(`/posts/${postId}/comment`, 'POST', { text }),
  votePoll: (postId, optionIndex) => apiRequest(`/posts/${postId}/vote`, 'POST', { optionIndex }),
  deletePost: (postId) => apiRequest(`/posts/${postId}`, 'DELETE'),
};
