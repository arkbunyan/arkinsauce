/**
 * API Module
 * Handles all communication with the backend
 */

class API {
  constructor() {
    this.baseURL = '/api';
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Generic fetch wrapper with error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      credentials: 'same-origin',
      headers: this.headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'An error occurred');
      }

      return result.data || result;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * Check authentication status
   */
  async checkAuth() {
    try {
      const data = await this.request('/auth/check');
      return data.loggedIn === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Log in user
   */
  async login(username, password) {
    return await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  /**
   * Register new user
   */
  async register(username, password) {
    return await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  /**
   * Log out user
   */
  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
  }

  /**
   * Fetch user's current streak
   */
  async getStreak() {
    try {
      const data = await this.request('/game/streak', { method: 'GET' });
      return data.streak || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Update user's streak
   */
  async updateStreak(streak) {
    return await this.request('/game/streak', {
      method: 'POST',
      body: JSON.stringify({ streak }),
    });
  }

  /**
   * Translate text using MyMemory API
   */
  async translate(text, targetLanguage) {
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLanguage}`
      );
      const data = await response.json();
      return data.responseData?.translatedText || text;
    } catch (error) {
      console.error('Translation Error:', error);
      return text;
    }
  }
}

// Global API instance
const api = new API();
