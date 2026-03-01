/**
 * UI Module
 * Handles all DOM manipulation and UI updates
 */

class GameUI {
  constructor() {
    this.elements = {
      gameTitle: document.getElementById('gameTitle'),
      gameBoard: document.getElementById('gameBoard'),
      keyboard: document.getElementById('keyboard'),
      resultBox: document.getElementById('resultBox'),
      resultLabel: document.getElementById('resultLabel'),
      resultAnswer: document.getElementById('resultAnswer'),
      resultTranslation: document.getElementById('resultTranslation'),
      messageBox: document.getElementById('messageBox'),
      streakDisplay: document.getElementById('streakDisplay'),
      streakCount: document.getElementById('streakCount'),
      resetBtn: document.getElementById('resetBtn'),
      modeBtn: document.getElementById('modeBtn'),
      authBtn: document.getElementById('authBtn'),
    };

    this.tiles = [];
    this.keyElements = {};
    this.keyboardRows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
  }

  /**
   * Initialize the game board with tiles
   */
  initializeBoard() {
    this.elements.gameBoard.innerHTML = '';
    this.elements.gameBoard.style.setProperty('--cols', gameState.cols);
    this.tiles = [];

    for (let r = 0; r < gameState.rows; r++) {
      for (let c = 0; c < gameState.cols; c++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.setAttribute('data-row', r);
        tile.setAttribute('data-col', c);
        this.elements.gameBoard.appendChild(tile);
        this.tiles.push(tile);
      }
    }
  }

  /**
   * Initialize the virtual keyboard
   */
  initializeKeyboard() {
    this.elements.keyboard.innerHTML = '';
    this.keyElements = {};

    this.keyboardRows.forEach((rowLetters, rowIdx) => {
      const rowElement = document.createElement('div');
      rowElement.className = 'keyboard__row';

      // Add Enter button at start of last row
      if (rowIdx === 2) {
        const enterBtn = this.createKeyButton('⏎', 'ENTER', true);
        rowElement.appendChild(enterBtn);
      }

      // Add letter buttons
      for (const letter of rowLetters) {
        const btn = this.createKeyButton(letter, letter, false);
        rowElement.appendChild(btn);
      }

      // Add Backspace button at end of last row
      if (rowIdx === 2) {
        const backBtn = this.createKeyButton('⌫', 'BACK', true);
        rowElement.appendChild(backBtn);
      }

      this.elements.keyboard.appendChild(rowElement);
    });
  }

  /**
   * Create a keyboard button element
   */
  createKeyButton(display, key, isAction) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = isAction ? 'key key--action' : 'key';
    btn.textContent = display;
    btn.dataset.key = key;
    btn.setAttribute('aria-label', display);

    btn.addEventListener('click', (e) => {
      e.target.blur();
      handleKeyPress(key);
    });

    if (!isAction) {
      this.keyElements[key] = btn;
    }
    return btn;
  }

  /**
   * Add letter to tile
   */
  addLetterToTile(letter) {
    const tileIndex = gameState.row * gameState.cols + (gameState.col - 1);
    if (this.tiles[tileIndex]) {
      this.tiles[tileIndex].textContent = letter.toUpperCase();
      this.tiles[tileIndex].classList.add('filled');
    }
  }

  /**
   * Remove letter from tile
   */
  removeLetterFromTile() {
    const tileIndex = gameState.row * gameState.cols + gameState.col;
    if (this.tiles[tileIndex]) {
      this.tiles[tileIndex].textContent = '';
      this.tiles[tileIndex].classList.remove('filled');
    }
  }

  /**
   * Mark tiles with evaluation status
   */
  markTiles(status) {
    const startIdx = gameState.row * gameState.cols;
    status.forEach((result, idx) => {
      const tile = this.tiles[startIdx + idx];
      tile.classList.add(result);
    });
  }

  /**
   * Update keyboard key colors
   */
  updateKeyColor(letter, status) {
    const keyBtn = this.keyElements[letter.toUpperCase()];
    if (!keyBtn) return;

    // Priority: correct > present > absent
    if (status === 'correct') {
      keyBtn.classList.remove('present', 'absent');
      keyBtn.classList.add('correct');
    } else if (status === 'present') {
      if (!keyBtn.classList.contains('correct')) {
        keyBtn.classList.remove('absent');
        keyBtn.classList.add('present');
      }
    } else if (status === 'absent') {
      if (!keyBtn.classList.contains('correct') && !keyBtn.classList.contains('present')) {
        keyBtn.classList.add('absent');
      }
    }
  }

  /**
   * Show message
   */
  showMessage(text, duration = 1500) {
    this.elements.messageBox.textContent = text;
    if (duration > 0) {
      setTimeout(() => {
        this.elements.messageBox.textContent = '';
      }, duration);
    }
  }

  /**
   * Show result box (answer + translation)
   */
  async showResultBox(answer, isWon, showTranslate = true) {
    this.elements.resultBox.style.display = 'none';
    this.elements.resultLabel.textContent = isWon ? '🎉 You Won!' : '❌ Game Over';
    this.elements.resultAnswer.textContent = answer;

    if (showTranslate) {
      this.elements.resultTranslation.innerHTML = `
        <div class="result-translation-input">
          <input 
            type="text" 
            id="langInputField" 
            placeholder="Language (e.g., Spanish)"
            autocomplete="off"
          >
          <button class="btn btn--primary" id="translateBtn">Translate</button>
        </div>
        <div class="result-translation-text" id="translatedText"></div>
      `;

      const translateBtn = document.getElementById('translateBtn');
      const langInput = document.getElementById('langInputField');
      const translatedText = document.getElementById('translatedText');

      const langMap = {
        german: 'de', spanish: 'es', french: 'fr',
        italian: 'it', portuguese: 'pt', dutch: 'nl', hindi: 'hi',
      };

      translateBtn.addEventListener('click', async () => {
        const lang = langInput.value.trim().toLowerCase();
        const code = langMap[lang];
        
        if (!code) {
          translatedText.textContent = 'Language not supported';
          return;
        }

        translatedText.textContent = 'Translating...';
        const translated = await api.translate(answer, code);
        translatedText.textContent = translated;
      });
    } else {
      this.elements.resultTranslation.innerHTML = '';
    }

    // Fade in animation
    this.elements.resultBox.style.display = '';
  }

  /**
   * Hide result box
   */
  hideResultBox() {
    this.elements.resultBox.style.display = 'none';
  }

  /**
   * Update streak display
   */
  updateStreak(streak) {
    this.elements.streakCount.textContent = streak;
  }

  /**
   * Show/hide streak display
   */
  setStreakVisible(visible) {
    this.elements.streakDisplay.style.display = visible ? '' : 'none';
  }

  /**
   * Update title
   */
  updateTitle(isFourdle) {
    this.elements.gameTitle.textContent = isFourdle ? 'Fourdle' : 'Triodle';
  }

  /**
   * Update mode button text
   */
  updateModeButton(isFourdle) {
    this.elements.modeBtn.textContent = isFourdle ? 'Triodle' : 'Fourdle';
  }

  /**
   * Update auth button text
   */
  updateAuthButton(isLoggedIn) {
    this.elements.authBtn.textContent = isLoggedIn ? 'Log Out' : 'Log In';
  }

  /**
   * Clear all tile content
   */
  clearBoard() {
    this.tiles.forEach(tile => {
      tile.textContent = '';
      tile.classList.remove('correct', 'present', 'absent');
    });
  }

  /**
   * Clear keyboard feedback
   */
  clearKeyboardFeedback() {
    Object.values(this.keyElements).forEach(btn => {
      btn.classList.remove('correct', 'present', 'absent');
    });
  }

  /**
   * Reset UI for new game
   */
  resetGame() {
    this.clearBoard();
    this.clearKeyboardFeedback();
    this.hideResultBox();
    this.showMessage('');
  }
}

// Global UI instance
const gameUI = new GameUI();
