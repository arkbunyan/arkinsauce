// =======================
// Utility Functions
// =======================

// Translate using LibreTranslate API
async function translateWord(word, targetLang) {
  const response = await fetch("https://libretranslate.de/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: word,
      source: "en",
      target: targetLang.toLowerCase().slice(0, 2),
      format: "text"
    })
  });
  const data = await response.json();
  return data.translatedText;
}

// =======================
// Configuration & Globals
// =======================

// Mode detection (fourdle or triodle)
const mode = document.body.dataset.mode;
const isFourdle = mode === "fourdle";

// Word bank selection (defined in external wordbank.js)
let cols, wordList, guessList;
if (isFourdle) {
  cols = 4;
  wordList = fourLetterWords;
  guessList = fourLetterGuesses;
} else {
  cols = 3;
  wordList = threeLetterWords;
  guessList = threeLetterGuesses;
}

// Apply board styling
const board = document.getElementById('board');
board.style.setProperty('--cols', cols);

// Cached DOM elements
const keyboard   = document.getElementById('keyboard');
const answerEl   = document.getElementById('answer');
const messageEl  = document.getElementById('message');
const resetBtn   = document.getElementById('reset-btn');
const transBtn   = document.getElementById('translate-btn');
const langInput  = document.getElementById('lang-input');
const transRes   = document.getElementById('translation-result');
const transUI    = document.getElementById('translation-ui');

// Game state
const rows = 7;
let row = 0, col = 0;
let solution = '';
let gameOver = false;

// Language mappings for manual translation UI
const langMap = {
  german: 'de',
  spanish: 'es',
  french: 'fr',
  italian: 'it',
  portuguese: 'pt',
  dutch: 'nl',
  hindi: 'hi'
};

// =======================
// Authentication & Streak
// =======================

let streakCount = 0;

// Fetch current streak from server
async function fetchStreak() {
  try {
    const res = await fetch('api/get_streak.php');
    const { streak } = await res.json();
    streakCount = streak;
    document.getElementById('streak-count').textContent = streakCount;
  } catch (err) {
    console.error('Error fetching streak:', err);
  }
}

// Update streak on server
async function updateStreak() {
  try {
    await fetch('api/update_streak.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ streak: streakCount })
    });
  } catch (err) {
    console.error('Error updating streak:', err);
  }
}

// Increment streak after a win
function onWin() {
  streakCount++;
  document.getElementById('streak-count').textContent = streakCount;
  updateStreak();
}

// Toggle auth UI buttons
function toggleAuth(loggedIn) {
  document.getElementById('login-btn').style.display  = loggedIn ? 'none' : '';
  document.getElementById('reg-btn').style.display    = loggedIn ? 'none' : '';
  document.getElementById('logout-btn').style.display = loggedIn ? '' : 'none';
}

// Auth button handlers
document.getElementById('login-btn').onclick = async () => {
  const user = document.getElementById('user').value;
  const pass = document.getElementById('pass').value;
  try {
    const res = await fetch('api/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    });
    const data = await res.json();
    if (data.success) {
      await fetchStreak();
      toggleAuth(true);
    } else alert(data.error);
  } catch (err) {
    console.error('Login error:', err);
  }
};

document.getElementById('reg-btn').onclick = async () => {
  const user = document.getElementById('user').value;
  const pass = document.getElementById('pass').value;
  try {
    const res = await fetch('api/register.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    });
    const data = await res.json();
    if (data.success) {
      await fetchStreak();
      toggleAuth(true);
    } else alert(data.error);
  } catch (err) {
    console.error('Register error:', err);
  }
};

document.getElementById('logout-btn').onclick = async () => {
  try {
    await fetch('api/logout.php');
    streakCount = 0;
    document.getElementById('streak-count').textContent = streakCount;
    toggleAuth(false);
  } catch (err) {
    console.error('Logout error:', err);
  }
};

// =======================
// Game Initialization
// =======================

function init() {
  // Pick a random solution word
  solution = wordList[Math.floor(Math.random() * wordList.length)].toUpperCase();
  row = 0;
  col = 0;
  gameOver = false;

  // Reset UI
  answerEl.textContent = '';
  transUI.classList.add('hidden');
  transRes.textContent = '';
  messageEl.textContent = '';

  // Build board
  board.innerHTML = '';
  for (let i = 0; i < rows * cols; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    board.appendChild(tile);
  }

  // Build on-screen keyboard
  keyboard.innerHTML = '';
  ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].forEach((line, idx) => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'keyboard-row';

    if (idx === 2) {
      const enterKey = document.createElement('div');
      enterKey.textContent = 'ENTER';
      enterKey.className = 'key';
      enterKey.onclick = () => handleKey('ENTER');
      rowDiv.appendChild(enterKey);
    }

    for (const ch of line) {
      const key = document.createElement('div');
      key.textContent = ch;
      key.className = 'key';
      key.onclick = () => handleKey(ch);
      rowDiv.appendChild(key);
    }

    if (idx === 2) {
      const delKey = document.createElement('div');
      delKey.textContent = 'BACK';
      delKey.className = 'key';
      delKey.onclick = () => handleKey('BACK');
      rowDiv.appendChild(delKey);
    }

    keyboard.appendChild(rowDiv);
  });
}

// =======================
// Input Handling
// =======================

function handleKey(k) {
  if (gameOver) return;
  if (k === 'ENTER') return handleEnter();
  if (k === 'BACK' || k === '⌫') return handleDelete();
  if (/^[A-Z]$/.test(k) && col < cols) {
    board.children[row * cols + col].textContent = k;
    col++;
  }
}

function handleDelete() {
  if (col > 0) {
    col--;
    board.children[row * cols + col].textContent = '';
  }
}

function handleEnter() {
  if (gameOver || col < cols) return;

  // Build guess word
  let guess = '';
  for (let i = 0; i < cols; i++) {
    guess += board.children[row * cols + i].textContent;
  }

  // Validate guess
  if (!guessList.includes(guess.toLowerCase())) {
    messageEl.textContent = 'Not in word list';
    messageEl.classList.add('visible');
    setTimeout(() => {
      messageEl.classList.remove('visible');
      messageEl.textContent = '';
    }, 2000);
    return;
  }

  // Evaluate guess against solution
  const solArr   = solution.split('');
  const guessArr = guess.split('');
  const status   = Array(cols).fill('absent');

  // Mark correct positions
  for (let i = 0; i < cols; i++) {
    if (guessArr[i] === solArr[i]) {
      status[i] = 'correct';
      solArr[i] = null;
    }
  }

  // Mark present but misplaced
  for (let i = 0; i < cols; i++) {
    if (status[i] === 'absent') {
      const idx = solArr.indexOf(guessArr[i]);
      if (idx > -1) {
        status[i] = 'present';
        solArr[idx] = null;
      }
    }
  }

  // Apply tile and key colors
  for (let i = 0; i < cols; i++) {
    const tile = board.children[row * cols + i];
    tile.classList.add(status[i]);
    colorKey(guessArr[i], status[i]);
  }

  // Win condition
  if (status.every(s => s === 'correct')) {
    return endGame(`You got it! The word was ${solution}`);
  }

  // Move to next row or end game
  row++;
  col = 0;
  if (row === rows) {
    streakCount = 0;
    updateStreak();
    endGame(`Game over! The word was ${solution}`);
  }
}

// =======================
// UI Feedback
// =======================

function colorKey(letter, status) {
  const keys = keyboard.querySelectorAll('.key');
  keys.forEach(k => {
    if (k.textContent === letter) {
      if (!k.classList.contains('correct')) {
        if (
          status === 'correct' ||
          (status === 'present' && !k.classList.contains('present'))
        ) {
          k.classList.add(status);
        } else if (status === 'absent' && !k.classList.contains('present')) {
          k.classList.add('absent');
        }
      }
    }
  });
}

function endGame(msg) {
  gameOver = true;
  onWin();
  answerEl.textContent = msg;
  transUI.classList.remove('hidden');
}

// =======================
// Event Listeners
// =======================

// DOM ready: init game and auth
document.addEventListener('DOMContentLoaded', async () => {
  init();
  addAuthEventListeners && addAuthEventListeners();
  try {
    const authRes = await fetch('api/check_auth.php');
    const { loggedIn } = await authRes.json();
    toggleAuth(loggedIn);
    if (loggedIn) await fetchStreak();
  } catch (e) {
    console.error('Auth check failed:', e);
  }
});

// Keyboard input
document.addEventListener('keydown', e => {
  const key = e.key.toUpperCase();
  if (key === 'ENTER') return handleKey('ENTER');
  if (key === 'BACKSPACE') return handleKey('BACK');
  if (/^[A-Z]$/.test(key)) handleKey(key);
});

// Manual translation UI
transBtn.onclick = () => {
  const name = langInput.value.trim().toLowerCase();
  const code = langMap[name];
  if (!code) {
    transRes.textContent = 'Language not supported.';
    return;
  }
  fetch(`https://api.mymemory.translated.net/get?q=${solution}&langpair=en|${code}`)
    .then(r => r.json())
    .then(d => {
      transRes.textContent = 'Translation: ' + d.responseData.translatedText;
    })
    .catch(() => {
      transRes.textContent = 'Translation error.';
    });
};

// Reset button (built-in init)
resetBtn.onclick = () => {
  init();
  resetBtn.blur();
};

// Advanced 'translateWord' button
document.getElementById('translate-btn').addEventListener('click', async () => {
  const langVal = langInput.value.trim();
  const word    = answerEl.textContent.trim();
  if (!langVal || !word) return;
  try {
    const translated = await translateWord(word, langVal);
    transRes.innerHTML = `Meaning-based translation in <b>${langVal}</b>: <b>${translated}</b>`;
  } catch (err) {
    console.error('Translation failed:', err);
    transRes.textContent = 'Translation failed.';
  }
});

// Show answer & translation UI on load if needed
answerEl.textContent = solution;
transUI.classList.remove('hidden');

// Extra reset cleanup
document.getElementById('reset-btn').addEventListener('click', () => {
  transUI.classList.add('hidden');
  transRes.textContent = '';
});

// =======================
// Startup
// =======================

// Initial game start
init();
