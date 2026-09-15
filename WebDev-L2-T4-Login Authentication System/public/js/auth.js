/**
 * Auth API Module
 * Communicates with backend Express API endpoints
 */
const AuthAPI = {
  /**
   * Register a new user
   * @param {Object} userData - { username, email, password }
   */
  async register(userData) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      return { status: response.status, ...data };
    } catch (err) {
      console.error('API register error:', err);
      return { success: false, message: 'Network or server connection error.' };
    }
  },

  /**
   * Login user with username/email and password
   * @param {Object} credentials - { identifier, password }
   */
  async login(credentials) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      return { status: response.status, ...data };
    } catch (err) {
      console.error('API login error:', err);
      return { success: false, message: 'Network or server connection error.' };
    }
  },

  /**
   * Check current session status
   */
  async checkAuth() {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await response.json();
      return { status: response.status, ...data };
    } catch (err) {
      console.error('API checkAuth error:', err);
      return { authenticated: false };
    }
  },

  /**
   * Logout current session
   */
  async logout() {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      return { status: response.status, ...data };
    } catch (err) {
      console.error('API logout error:', err);
      return { success: false, message: 'Network error during logout.' };
    }
  },
};

