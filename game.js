// MODE TOGGLE
let isFourdle = true;   // true = 4-letter mode, false = 3-letter mode
let cols, wordList, guessList;

const modeBtn = document.getElementById('mode-btn');
const resetBtn = document.getElementById('reset-btn');

modeBtn.addEventListener('click', () => {
  isFourdle = !isFourdle;
  applyMode();
  initGame();
  modeBtn.blur();
});

function applyMode() {
  if (isFourdle) {
    cols      = 4;
    wordList  = fourLetterWords;
    guessList = fourLetterGuesses;
    document.getElementById('title').textContent = 'Fourdle';
    modeBtn.textContent = 'Triodle';
  } else {
    cols      = 3;
    wordList  = threeLetterWords;
    guessList = threeLetterGuesses;
    document.getElementById('title').textContent = 'Triodle';
    modeBtn.textContent = 'Fourdle';
  }
  document.getElementById('board')
          .style.setProperty('--cols', cols);
}


// GAME SETUP
const board     = document.getElementById('board');
const keyboard  = document.getElementById('keyboard');
const postgame  = document.getElementById('postgame');
const answerEl  = document.getElementById('answer');
const messageEl = document.getElementById('message');
const rows      = 7;

let solution, row, col, gameOver;

function hidePostgame() {
  postgame.classList.add('hidden');
  answerEl.textContent = '';
  document.getElementById('translation-result').textContent = '';
  document.getElementById('lang-input').value = '';
}

function showPostgame() {
  postgame.classList.remove('hidden');
}

function initGame() {
  // pick a random solution
  solution = wordList[
    Math.floor(Math.random() * wordList.length)
  ].toUpperCase();
  row = 0; col = 0; gameOver = false;

  // clear board tiles
  board.innerHTML = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      board.appendChild(tile);
    }
  }

  // clear keyboard
  keyboard.innerHTML = '';
  ['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'].forEach((line, idx) => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'keyboard-row';

    // ENTER at the start of 3rd row
    if (idx === 2) {
      const enter = document.createElement('button');
      enter.textContent = '⏎';
      enter.className = 'key key-wide';
      enter.onclick = e => { handleKey('ENTER'); e.target.blur(); };
      rowDiv.appendChild(enter);
    }

    // letter keys
    for (const ch of line) {
      const key = document.createElement('button');
      key.textContent = ch;
      key.className = 'key';
      key.onclick = e => { handleKey(ch); e.target.blur(); };
      rowDiv.appendChild(key);
    }

    // BACK at the end of 3rd row
    if (idx === 2) {
      const back = document.createElement('button');
      back.textContent = '⌫';
      back.className = 'key key-wide';
      back.onclick = e => { handleKey('BACK'); e.target.blur(); };
      rowDiv.appendChild(back);
    }

    keyboard.appendChild(rowDiv);
  });

  // hide postgame UI and messages
  hidePostgame();
  messageEl.textContent = '';
}

resetBtn.addEventListener('click', () => {
  initGame();
  resetBtn.blur();
});


// ACCOUNT MODAL + AUTH
let streakCount = 0;

const accountBtn   = document.getElementById('account-btn');
const accountModal = document.getElementById('account-modal');
const accountClose = document.getElementById('account-close');
const accountBackdrop = document.getElementById('account-backdrop');
const authStatus   = document.getElementById('auth-status');

const userIn    = document.getElementById('user');
const passIn    = document.getElementById('pass');
const loginBtn  = document.getElementById('login-btn');
const regBtn    = document.getElementById('reg-btn');
const logoutBtn = document.getElementById('logout-btn');
const streakEl  = document.getElementById('streak-count');

function openModal() {
  accountModal.classList.remove('hidden');
  accountModal.setAttribute('aria-hidden', 'false');
  userIn.focus();
}

function closeModal() {
  accountModal.classList.add('hidden');
  accountModal.setAttribute('aria-hidden', 'true');
}

accountBtn.addEventListener('click', () => openModal());
accountClose.addEventListener('click', () => closeModal());
accountBackdrop.addEventListener('click', () => closeModal());

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !accountModal.classList.contains('hidden')) {
    closeModal();
  }
});

function setAuthStatus(text, isError = false) {
  authStatus.textContent = text || '';
  authStatus.style.color = isError ? '#f66' : 'rgba(224,224,224,0.9)';
}

function toggleAuth(loggedIn, username = '') {
  loginBtn.style.display  = loggedIn ? 'none' : '';
  regBtn.style.display    = loggedIn ? 'none' : '';
  logoutBtn.style.display = loggedIn ? '' : 'none';
  if (loggedIn) {
    setAuthStatus(username ? `Logged in as ${username}` : 'Logged in');
  } else {
    setAuthStatus('');
  }
}

// load streak from server
async function fetchStreak() {
  const res = await fetch('api/streak.php', { credentials: 'same-origin' });
  if (!res.ok) { console.error('fetchStreak failed', res.status); return; }
  const data = await res.json();
  streakCount = data.streak || 0;
  streakEl.textContent = streakCount;
}

// save streak to server
async function updateStreak() {
  const res = await fetch('api/streak.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ streak: streakCount })
  });
  if (!res.ok) console.error('updateStreak failed', res.status);
}

function onWin() {
  streakCount++;
  streakEl.textContent = streakCount;
  updateStreak();
}

loginBtn.addEventListener('click', async () => {
  setAuthStatus('');
  const res = await fetch('api/login.php', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    credentials: 'same-origin',
    body: JSON.stringify({
      username: userIn.value,
      password: passIn.value
    })
  });
  const data = await res.json().catch(() => ({}));
  if (data.success) {
    toggleAuth(true, data.username || userIn.value);
    fetchStreak();
    closeModal();
  } else {
    setAuthStatus(data.error || 'Login failed', true);
  }
});

regBtn.addEventListener('click', async () => {
  setAuthStatus('');
  const res = await fetch('api/register.php', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    credentials: 'same-origin',
    body: JSON.stringify({
      username: userIn.value,
      password: passIn.value
    })
  });
  const data = await res.json().catch(() => ({}));
  if (data.success) {
    toggleAuth(true, data.username || userIn.value);
    fetchStreak();
    closeModal();
  } else {
    setAuthStatus(data.error || 'Sign up failed', true);
  }
});

logoutBtn.addEventListener('click', async () => {
  await fetch('api/logout.php', { credentials: 'same-origin' });
  toggleAuth(false);
  streakCount = 0;
  streakEl.textContent = '0';
  closeModal();
});

// check session on load
fetch('api/check_auth.php', { credentials: 'same-origin' })
  .then(r => r.json())
  .then(({loggedIn, username}) => {
    toggleAuth(Boolean(loggedIn), username || '');
    if (loggedIn) fetchStreak();
  })
  .catch(e => console.error(e));


// INPUT HANDLING
function handleKey(k) {
  if (gameOver) return;
  if (!accountModal.classList.contains('hidden')) return;

  if (k === 'ENTER') return handleEnter();
  if (k === 'BACK')  return handleDelete();
  if (/^[A-Z]$/.test(k) && col < cols) {
    board.children[row*cols + col].textContent = k;
    col++;
  }
}

function handleDelete() {
  if (col > 0) {
    col--;
    board.children[row*cols + col].textContent = '';
  }
}

function handleEnter() {
  if (col < cols) return;

  // build guess
  let guess = '';
  for (let i = 0; i < cols; i++) {
    guess += board.children[row*cols + i].textContent;
  }
  guess = guess.toLowerCase();

  // invalid word
  if (!guessList.includes(guess)) {
    messageEl.textContent = 'Not in list';
    setTimeout(() => messageEl.textContent = '', 1500);
    return;
  }

  // evaluate
  const solArr = solution.split('');
  const status = Array(cols).fill('absent');

  // correct spots
  for (let i = 0; i < cols; i++) {
    if (guess[i] === solArr[i].toLowerCase()) {
      status[i] = 'correct';
      solArr[i] = null;
    }
  }
  // present elsewhere
  for (let i = 0; i < cols; i++) {
    if (status[i] === 'absent') {
      const idx = solArr.indexOf(guess[i].toUpperCase());
      if (idx > -1) {
        status[i] = 'present';
        solArr[idx] = null;
      }
    }
  }

  // color tiles and keys
  const keys = document.querySelectorAll('.key');
  for (let i = 0; i < cols; i++) {
    const tile = board.children[row*cols + i];
    tile.classList.add(status[i]);

    keys.forEach(kb => {
      if (kb.textContent === guess[i].toUpperCase()) {
        if (status[i] === 'correct') {
          kb.classList.remove('present','absent');
          kb.classList.add('correct');
        } else if (status[i] === 'present') {
          if (!kb.classList.contains('correct')) {
            kb.classList.remove('absent');
            kb.classList.add('present');
          }
        } else {
          if (!kb.classList.contains('correct') &&
              !kb.classList.contains('present')) {
            kb.classList.add('absent');
          }
        }
      }
    });
  }

  // win
  if (status.every(s => s === 'correct')) {
    onWin();
    gameOver = true;
    answerEl.textContent = solution;
    showPostgame();
    return;
  }

  // next attempt or fail
  row++;
  col = 0;
  if (row === rows) {
    streakCount = 0;
    streakEl.textContent = '0';
    updateStreak();
    gameOver = true;
    answerEl.textContent = solution;
    showPostgame();
  }
}

// ignore keypresses when typing in inputs/buttons
document.addEventListener('keydown', e => {
  const a = document.activeElement;
  if (a && (a.tagName === 'INPUT' || a.tagName === 'BUTTON')) return;
  if (!accountModal.classList.contains('hidden')) return;

  if (e.key === 'Enter') handleKey('ENTER');
  else if (e.key === 'Backspace') handleKey('BACK');
  else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toUpperCase());
});


// TRANSLATION
const langMap = {
  german:'de', spanish:'es', french:'fr',
  italian:'it', portuguese:'pt', dutch:'nl', hindi:'hi'
};

const transBtn  = document.getElementById('translate-btn');
const langInput = document.getElementById('lang-input');
const transRes  = document.getElementById('translation-result');

transBtn.addEventListener('click', () => {
  const lang = langInput.value.trim().toLowerCase();
  const code = langMap[lang];
  if (!code) {
    transRes.textContent = 'Not supported';
    return;
  }
  fetch(`https://api.mymemory.translated.net/get?q=${solution}&langpair=en|${code}`)
    .then(r => r.json())
    .then(d => transRes.textContent = d.responseData.translatedText)
    .catch(() => transRes.textContent = 'Error');
});


// INITIALIZE
applyMode();
initGame();
