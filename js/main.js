/**
 * Main Module
 * Entry point and game orchestration
 */

let isLoggedIn = false;

/**
 * Initialize game
 */
function initGame() {
  gameState.reset();
  gameUI.resetGame();
  gameUI.initializeBoard();
  gameUI.initializeKeyboard();
}

/**
 * Switch game mode
 */
function switchMode() {
  gameState.setMode(!gameState.isFourdle);
  gameUI.updateTitle(gameState.isFourdle);
  gameUI.updateModeButton(gameState.isFourdle);
  initGame();
}

/**
 * Handle key press (letter, Enter, Backspace)
 */
function handleKeyPress(key) {
  if (gameState.gameOver) return;
  
  // Remove focus from any button to prevent space/enter from activating buttons
  document.activeElement?.blur();

  if (key === 'ENTER') {
    handleEnter();
  } else if (key === 'BACK') {
    handleBackspace();
  } else if (/^[A-Z]$/.test(key) && gameState.col < gameState.cols) {
    if (gameState.addLetter(key)) {
      gameUI.addLetterToTile(key);
    }
  }
}

/**
 * Handle backspace
 */
function handleBackspace() {
  if (gameState.removeLetter()) {
    gameUI.removeLetterFromTile();
  }
}

/**
 * Handle enter/submit guess
 */
async function handleEnter() {
  // Check if row is complete
  if (gameState.col < gameState.cols) {
    gameUI.showMessage('Not enough letters');
    return;
  }

  // Get current guess
  const guess = gameState.getCurrentGuess(gameUI.tiles);
  console.log('Guess:', guess, 'Valid:', gameState.isValidGuess(guess), 'GuessList length:', gameState.guessList.length);

  // Validate word
  if (!gameState.isValidGuess(guess)) {
    gameUI.showMessage('Not in word list');
    return;
  }

  // Evaluate guess
  const status = gameState.evaluateGuess(guess, gameUI.tiles);

  // Mark tiles
  gameUI.markTiles(status);

  // Update keyboard colors
  for (let i = 0; i < gameState.cols; i++) {
    gameUI.updateKeyColor(guess[i], status[i]);
  }

  // Check for win
  const isWon = gameState.checkWin(status);

  if (isWon) {
    gameState.endGame(true);
    await handleGameEnd(true);
    return;
  }

  // Check for loss
  if (!gameState.advance()) {
    gameState.endGame(false);
    await handleGameEnd(false);
    return;
  }
}

/**
 * Handle game end (win or loss)
 */
async function handleGameEnd(isWon) {
  // Update streak
  if (isLoggedIn) {
    gameUI.updateStreak(gameState.streak);
    try {
      await api.updateStreak(gameState.streak);
    } catch (error) {
      console.error('Failed to update streak:', error);
    }
  }

  // Show result box
  gameUI.showResultBox(gameState.solution, isWon);
}

/**
 * Handle auth success
 */
async function handleAuthSuccess() {
  isLoggedIn = true;
  gameUI.updateAuthButton(true);
  gameUI.setStreakVisible(true);

  try {
    gameState.streak = await api.getStreak();
    gameUI.updateStreak(gameState.streak);
  } catch (error) {
    console.error('Failed to fetch streak:', error);
  }
}

/**
 * Handle logout
 */
async function handleLogout() {
  try {
    await api.logout();
    isLoggedIn = false;
    gameState.streak = 0;
    gameUI.updateAuthButton(false);
    gameUI.setStreakVisible(false);
    gameUI.updateStreak(0);
    initGame();
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

/**
 * Handle physical keyboard input
 */
function handlePhysicalKeyboard(event) {
  // Don't interfere with form inputs
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    return;
  }

  const key = event.key.toUpperCase();

  if (key === 'ENTER') {
    handleKeyPress('ENTER');
  } else if (key === 'BACKSPACE') {
    handleKeyPress('BACK');
  } else if (/^[A-Z]$/.test(key)) {
    handleKeyPress(key);
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  gameUI.elements.resetBtn.addEventListener('click', (e) => {
    e.target.blur();
    initGame();
  });

  gameUI.elements.modeBtn.addEventListener('click', (e) => {
    e.target.blur();
    switchMode();
  });

  gameUI.elements.authBtn.addEventListener('click', (e) => {
    e.target.blur();
    if (isLoggedIn) {
      handleLogout();
    } else {
      authModal.open();
    }
  });

  // Physical keyboard
  document.addEventListener('keydown', handlePhysicalKeyboard);
}

/**
 * Initialize application
 */
async function initApp() {
  // Check authentication status
  isLoggedIn = await api.checkAuth();

  // Setup game state
  gameState.setMode(true);
  console.log('Word list loaded:', gameState.wordList.length, 'words');
  console.log('Guess list loaded:', gameState.guessList.length, 'guesses');
  console.log('Sample words:', gameState.wordList.slice(0, 5));
  console.log('Sample guesses:', gameState.guessList.slice(0, 5));
  
  gameUI.initializeBoard();
  gameUI.initializeKeyboard();
  gameUI.updateTitle(gameState.isFourdle);
  gameUI.updateAuthButton(isLoggedIn);

  // If logged in, fetch and show streak
  if (isLoggedIn) {
    gameUI.setStreakVisible(true);
    try {
      gameState.streak = await api.getStreak();
      gameUI.updateStreak(gameState.streak);
    } catch (error) {
      console.error('Failed to fetch streak:', error);
    }
  } else {
    gameUI.setStreakVisible(false);
  }

  // Start game
  gameState.reset();

  // Setup event listeners
  setupEventListeners();

  console.log('Arkinsauce initialized successfully');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
