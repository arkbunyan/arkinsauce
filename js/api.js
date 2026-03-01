/**
 * API Module
 * Handles all communication with the backend
 */

class API {
  constructor() {
    // Use a relative base path so the app works whether it's hosted at the
    // domain root (/) or inside a subdirectory (e.g. /arkinsauce/).
    this.baseURL = 'api';
  }

  /**
   * Generic fetch wrapper with error handling
   */
  async request(endpoint, options = {}) {
    const cleanEndpoint = String(endpoint || '').replace(/^\/+/, '');
    const url = `${this.baseURL}/${cleanEndpoint}`;

    const config = {
      credentials: 'same-origin',
      ...options,
    };

    // Only set JSON headers when we're actually sending a JSON body.
    // (Some servers/middleware behave oddly when GET requests include
    // Content-Type: application/json.)
    if (config.body != null) {
      config.headers = {
        ...(config.headers || {}),
        'Content-Type': 'application/json',
      };
    }

    try {
      const response = await fetch(url, config);

      const text = await response.text();
      if (!text || !text.trim()) {
        throw new Error(`Empty response from server (HTTP ${response.status})`);
      }

      let result;
      try {
        result = JSON.parse(text);
      } catch (_) {
        throw new Error(`Server returned invalid JSON (HTTP ${response.status})`);
      }

      if (!response.ok || (result.error)) {
        throw new Error(result.error || 'An error occurred');
      }

      return result;
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
      const data = await this.request('/check_auth.php');
      return Boolean(data.loggedIn);
    } catch (error) {
      return false;
    }
  }

  /**
   * Log in user
   */
  async login(username, password) {
    return await this.request('/login.php', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  /**
   * Register new user
   */
  async register(username, password) {
    return await this.request('/register.php', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  /**
   * Log out user
   */
  async logout() {
    await this.request('/logout.php', { method: 'POST' });
  }

  /**
   * Fetch user's current streak
   */
  async getStreak() {
    try {
      const data = await this.request('/streak.php', { method: 'GET' });
      return data.streak || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Update user's streak
   */
  async updateStreak(streak) {
    return await this.request('/streak.php', {
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
