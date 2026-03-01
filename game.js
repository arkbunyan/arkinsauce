//  MODE TOGGLE 
let isFourdle = true;   // true = 4-letter mode, false = 3-letter mode
let cols, wordList, guessList;

const modeBtn = document.getElementById('mode-btn');
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


//  GAME SETUP 
const board     = document.getElementById('board');
const keyboard  = document.getElementById('keyboard');
const answerEl  = document.getElementById('answer');
const messageEl = document.getElementById('message');
const resultsEl = document.getElementById('results-panel');
const resetBtn  = document.getElementById('reset-btn');
const rows      = 7;

let solution, row, col, gameOver;

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

    // ⏎ ENTER at the start of 3rd row
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

    // ⌫ BACK at the end of 3rd row
    if (idx === 2) {
      const back = document.createElement('button');
      back.textContent = '⌫';
      back.className = 'key key-wide';
      back.onclick = e => { handleKey('BACK'); e.target.blur(); };
      rowDiv.appendChild(back);
    }

    keyboard.appendChild(rowDiv);
  });

  // hide answer and messages
  answerEl.textContent = '';
  messageEl.textContent = '';
  resultsEl.classList.add('hidden');
  document.getElementById('translation-result').textContent = '';
  document.getElementById('lang-input').value = '';
}

resetBtn.addEventListener('click', () => {
  initGame();
  resetBtn.blur();
});


//  STREAK & AUTH 
let streakCount = 0;

const userIn    = document.getElementById('user');
const passIn    = document.getElementById('pass');
const loginBtn  = document.getElementById('login-btn');
const regBtn    = document.getElementById('reg-btn');
const logoutBtn = document.getElementById('logout-btn');
const streakEl  = document.getElementById('streak-count');

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

function toggleAuth(loggedIn) {
  loginBtn.style.display  = loggedIn ? 'none' : '';
  regBtn.style.display    = loggedIn ? 'none' : '';
  logoutBtn.style.display = loggedIn ? '' : 'none';
}

// Account modal
const accountBtn   = document.getElementById('account-btn');
const accountModal = document.getElementById('account-modal');
const accountClose = document.getElementById('account-close');

function openAccountModal() {
  accountModal.classList.remove('hidden');
  accountModal.setAttribute('aria-hidden', 'false');
  // focus the first input for fast login
  setTimeout(() => userIn.focus(), 0);
}

function closeAccountModal() {
  accountModal.classList.add('hidden');
  accountModal.setAttribute('aria-hidden', 'true');
  accountBtn.blur();
}

accountBtn.addEventListener('click', () => {
  openAccountModal();
});

accountClose.addEventListener('click', () => {
  closeAccountModal();
});

accountModal.addEventListener('click', (e) => {
  if (e.target && e.target.dataset && e.target.dataset.close === 'true') {
    closeAccountModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !accountModal.classList.contains('hidden')) {
    closeAccountModal();
  }
});

loginBtn.addEventListener('click', async () => {
  const res = await fetch('api/login.php', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      username: userIn.value,
      password: passIn.value
    })
  });
  const data = await res.json();
  if (data.success) {
    toggleAuth(true);
    fetchStreak();
    closeAccountModal();
  } else {
    alert(data.error);
  }
});

regBtn.addEventListener('click', async () => {
  const res = await fetch('api/register.php', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      username: userIn.value,
      password: passIn.value
    })
  });
  const data = await res.json();
  if (data.success) {
    toggleAuth(true);
    fetchStreak();
    closeAccountModal();
  } else {
    alert(data.error);
  }
});

logoutBtn.addEventListener('click', async () => {
  await fetch('api/logout.php');
  toggleAuth(false);
  streakCount = 0;
  streakEl.textContent = '0';
  closeAccountModal();
});

// check session on load
fetch('api/check_auth.php')
  .then(r => r.json())
  .then(({loggedIn}) => {
    toggleAuth(loggedIn);
    if (loggedIn) fetchStreak();
  })
  .catch(e => console.error(e));


//  INPUT HANDLING ===
function handleKey(k) {
  if (gameOver) return;
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

    // key coloring with priority: correct > present > absent
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
        } else { // absent
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
    resultsEl.classList.remove('hidden');
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
    resultsEl.classList.remove('hidden');
  }
}

// ignore keypresses when typing in inputs/buttons
document.addEventListener('keydown', e => {
  const a = document.activeElement;
  if (a.tagName === 'INPUT' || a.tagName === 'BUTTON') return;
  if (e.key === 'Enter')      handleKey('ENTER');
  else if (e.key === 'Backspace') handleKey('BACK');
  else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toUpperCase());
});


//  TRANSLATION
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


//  INITIALIZE
applyMode();
initGame();
