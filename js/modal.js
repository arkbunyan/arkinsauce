/**
 * Modal Module
 * Handles login/signup modal interactions
 */

class AuthModal {
  constructor() {
    this.elements = {
      modal: document.getElementById('authModal'),
      overlay: document.getElementById('modalOverlay'),
      closeBtn: document.getElementById('modalCloseBtn'),
      form: document.getElementById('authForm'),
      usernameInput: document.getElementById('username'),
      passwordInput: document.getElementById('password'),
      submitBtn: document.getElementById('authSubmitBtn'),
      toggleBtn: document.getElementById('authToggleBtn'),
      toggleText: document.getElementById('authToggleText'),
      modalTitle: document.getElementById('authModalTitle'),
      formError: document.getElementById('formError'),
      usernameError: document.getElementById('usernameError'),
      passwordError: document.getElementById('passwordError'),
    };

    this.isLoginMode = true;
    this.init();
  }

  init() {
    // Close button
    this.elements.closeBtn.addEventListener('click', () => this.close());

    // Overlay click to close
    this.elements.overlay.addEventListener('click', () => this.close());

    // Toggle between login and signup
    this.elements.toggleBtn.addEventListener('click', () => this.toggleMode());

    // Form submission
    this.elements.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Clear errors on input
    this.elements.usernameInput.addEventListener('input', () => this.clearError('username'));
    this.elements.passwordInput.addEventListener('input', () => this.clearError('password'));
  }

  /**
   * Open modal
   */
  open(isLogin = true) {
    this.isLoginMode = isLogin;
    this.setMode(isLogin);
    this.elements.modal.classList.add('modal--open');
    this.elements.modal.setAttribute('aria-hidden', 'false');
    this.elements.usernameInput.focus();

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close modal
   */
  close() {
    this.elements.modal.classList.remove('modal--open');
    this.elements.modal.setAttribute('aria-hidden', 'true');
    this.clearForm();

    // Restore body scroll
    document.body.style.overflow = '';
  }

  /**
   * Toggle between login and signup modes
   */
  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.setMode(this.isLoginMode);
    this.clearForm();
  }

  /**
   * Set modal UI for login or signup
   */
  setMode(isLogin) {
    if (isLogin) {
      this.elements.modalTitle.textContent = 'Log In';
      this.elements.submitBtn.textContent = 'Log In';
      this.elements.toggleText.textContent = "Don't have an account?";
      this.elements.toggleBtn.textContent = 'Sign Up';
    } else {
      this.elements.modalTitle.textContent = 'Sign Up';
      this.elements.submitBtn.textContent = 'Sign Up';
      this.elements.toggleText.textContent = 'Already have an account?';
      this.elements.toggleBtn.textContent = 'Log In';
    }
  }

  /**
   * Handle form submission
   */
  async handleSubmit(e) {
    e.preventDefault();

    const username = this.elements.usernameInput.value.trim();
    const password = this.elements.passwordInput.value.trim();

    // Validate
    if (!this.validate(username, password)) {
      return;
    }

    // Disable button during submission
    this.elements.submitBtn.disabled = true;
    this.elements.submitBtn.textContent = 'Loading...';

    try {
      if (this.isLoginMode) {
        await api.login(username, password);
      } else {
        await api.register(username, password);
      }

      // Success
      this.close();
      window.handleAuthSuccess();
    } catch (error) {
      this.setFormError(error.message);
    } finally {
      this.elements.submitBtn.disabled = false;
      this.elements.submitBtn.textContent = this.isLoginMode ? 'Log In' : 'Sign Up';
    }
  }

  /**
   * Validate form inputs
   */
  validate(username, password) {
    let isValid = true;

    if (!username) {
      this.setFieldError('username', 'Username is required');
      isValid = false;
    } else if (username.length < 3) {
      this.setFieldError('username', 'Username must be at least 3 characters');
      isValid = false;
    }

    if (!password) {
      this.setFieldError('password', 'Password is required');
      isValid = false;
    } else if (password.length < 6) {
      this.setFieldError('password', 'Password must be at least 6 characters');
      isValid = false;
    }

    if (isValid) {
      this.clearError('form');
    }

    return isValid;
  }

  /**
   * Set field error
   */
  setFieldError(field, message) {
    const errorElement = this.elements[`${field}Error`];
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  /**
   * Clear field error
   */
  clearError(field) {
    if (field === 'form') {
      this.elements.formError.textContent = '';
    } else {
      const errorElement = this.elements[`${field}Error`];
      if (errorElement) {
        errorElement.textContent = '';
      }
    }
  }

  /**
   * Set form-level error
   */
  setFormError(message) {
    this.elements.formError.textContent = message;
  }

  /**
   * Clear form
   */
  clearForm() {
    this.elements.form.reset();
    this.elements.formError.textContent = '';
    this.elements.usernameError.textContent = '';
    this.elements.passwordError.textContent = '';
  }
}

// Global modal instance
const authModal = new AuthModal();
