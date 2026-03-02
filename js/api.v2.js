/**
 * API Module
 * Handles all communication with the backend
 */

class API {
  constructor() {
    // Relative path so it works at domain root and in subfolders.
    this.baseURL = 'api';
  }

  /**
   * Generic fetch wrapper with safer JSON handling
   */
  async request(endpoint, options = {}) {
    const cleanEndpoint = String(endpoint || '').replace(/^\/+/, '');
    const url = `${this.baseURL}/${cleanEndpoint}`;

    const config = {
      credentials: 'same-origin',
      ...options,
    };

    // Only set JSON header when sending a JSON body.
    if (config.body != null) {
      config.headers = {
        ...(config.headers || {}),
        'Content-Type': 'application/json',
      };
    }

    const response = await fetch(url, config);

    // Always read text first so empty/invalid responses don't crash with response.json().
    const text = await response.text();

    if (!text || !text.trim()) {
      throw new Error(`Empty response from server (HTTP ${response.status})`);
    }

    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      // Helpful when the server returns HTML or a PHP error page.
      const preview = text.slice(0, 200);
      throw new Error(`Server returned invalid JSON (HTTP ${response.status}). First bytes: ${preview}`);
    }

    if (!response.ok || result.error) {
      throw new Error(result.error || `Request failed (HTTP ${response.status})`);
    }

    return result;
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
    return await this.request('/logout.php');
  }

  /**
   * Get user's streak count
   */
  async getStreak() {
    return await this.request('/streak.php');
  }

  /**
   * Update user's streak count
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

      const raw = await response.text();
      if (!raw || !raw.trim()) {
        return text;
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch (_) {
        return text;
      }

      return data.responseData?.translatedText || text;
    } catch (error) {
      console.error('Translation Error:', error);
      return text;
    }
  }
}

// Global API instance
const api = new API();
