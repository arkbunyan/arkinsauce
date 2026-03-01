/**
 * Game Module
 * Core game logic and state management
 */

class GameState {
  constructor() {
    this.isFourdle = true;
    this.solution = null;
    this.row = 0;
    this.col = 0;
    this.gameOver = false;
    this.isWon = false;
    this.streak = 0;
    this.cols = 4;
    this.rows = 7;
    this.wordList = [];
    this.guessList = [];
  }

  reset() {
    this.row = 0;
    this.col = 0;
    this.gameOver = false;
    this.isWon = false;
    this.solution = this.pickRandomWord();
  }

  setMode(isFourdle) {
    this.isFourdle = isFourdle;
    this.cols = isFourdle ? 4 : 3;
    this.wordList = isFourdle ? fourLetterWords : threeLetterWords;
    this.guessList = isFourdle ? fourLetterGuesses : threeLetterGuesses;
  }

  pickRandomWord() {
    const randomIndex = Math.floor(Math.random() * this.wordList.length);
    return this.wordList[randomIndex].toUpperCase();
  }

  addLetter(letter) {
    if (this.col < this.cols && !this.gameOver) {
      this.col++;
      return true;
    }
    return false;
  }

  removeLetter() {
    if (this.col > 0 && !this.gameOver) {
      this.col--;
      return true;
    }
    return false;
  }

  getCurrentGuess(tiles) {
    let guess = '';
    const startIdx = this.row * this.cols;
    for (let i = 0; i < this.cols; i++) {
      guess += tiles[startIdx + i]?.textContent || '';
    }
    return guess.toLowerCase();
  }

  isValidGuess(guess) {
    // Accept word if it's in either the solution word list OR the valid guess list
    return this.wordList.includes(guess) || this.guessList.includes(guess);
  }

  evaluateGuess(guess, tiles) {
    const solArr = this.solution.split('');
    const status = Array(this.cols).fill('absent');

    // First pass: mark correct positions
    for (let i = 0; i < this.cols; i++) {
      if (guess[i] === solArr[i].toLowerCase()) {
        status[i] = 'correct';
        solArr[i] = null;
      }
    }

    // Second pass: mark present letters
    for (let i = 0; i < this.cols; i++) {
      if (status[i] === 'absent') {
        const idx = solArr.indexOf(guess[i].toUpperCase());
        if (idx > -1) {
          status[i] = 'present';
          solArr[idx] = null;
        }
      }
    }

    return status;
  }

  advance() {
    this.row++;
    this.col = 0;
    return this.row < this.rows;
  }

  checkWin(status) {
    return status.every(s => s === 'correct');
  }

  isGameOver() {
    return this.gameOver || this.row >= this.rows;
  }

  endGame(isWon) {
    this.gameOver = true;
    this.isWon = isWon;

    if (isWon) {
      this.streak++;
    } else {
      this.streak = 0;
    }
  }
}

// Global game state
const gameState = new GameState();
