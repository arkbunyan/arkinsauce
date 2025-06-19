async function translateWord(word, targetLang) {
  const response = await fetch("https://libretranslate.de/translate", {
    method: "POST",
    body: JSON.stringify({
      q: word,
      source: "en",
      target: targetLang.toLowerCase().slice(0, 2),
      format: "text"
    }),
    headers: { "Content-Type": "application/json" }
  });
  const data = await response.json();
  return data.translatedText;
}

// Detect mode (fourdle or triodle)
const mode = document.body.dataset.mode;

const isFourdle = mode === "fourdle";

if (isFourdle) {
    var cols = 4;
    var wordList = fourLetterWords;
    var guessList = fourLetterGuesses;
} else {
    var cols = 3;
    var wordList = threeLetterWords;
    var guessList = threeLetterGuesses;
}

// Update board styling based on columns
document.getElementById("board").style.setProperty("--cols", cols);

var rows = 7, row = 0, col = 0;
var board = document.getElementById('board');
var keyboard = document.getElementById('keyboard');
var answerEl = document.getElementById('answer');
var transUI = document.getElementById('translation-ui');
var langInput = document.getElementById('lang-input');
var transBtn = document.getElementById('translate-btn');
var transRes = document.getElementById('translation-result');
var resetBtn = document.getElementById('reset-btn');
var messageEl = document.getElementById('message');
var solution = '';
var gameOver = false;

// some common language mappings
var langMap = {
  german: 'de',
  spanish: 'es',
  french: 'fr',
  italian: 'it',
  portuguese: 'pt',
  dutch: 'nl',
  hindi: 'hi'
};

document.addEventListener('DOMContentLoaded', async () => {
  initGame();
  addAuthEventListeners();

  const authRes = await fetch('api/check_auth.php');
  const { loggedIn } = await authRes.json();

  toggleAuth(loggedIn);

  if (loggedIn) {
    await fetchStreak();
  }
});


let streakCount = 0;

async function fetchStreak() {
  const res = await fetch('api/get_streak.php');
  const {streak} = await res.json();
  streakCount = streak;
  document.getElementById('streak-count').textContent = streak;
}

async function updateStreak() {
  await fetch('api/update_streak.php', {
    method: 'POST',
    body: JSON.stringify({streak: streakCount})
  });
}

// on win:
function onWin() {
  streakCount++;
  document.getElementById('streak-count').textContent = streakCount;
  updateStreak();
}

// Auth buttons
document.getElementById('login-btn').onclick = async () => {
  const user = document.getElementById('user').value;
  const pass = document.getElementById('pass').value;
  const res = await fetch('api/login.php', {
    method:'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({username:user,password:pass})
  });
  const data = await res.json();
  if (data.success) {
    await fetchStreak();
    toggleAuth(true);
  } else alert(data.error);
};

document.getElementById('reg-btn').onclick = async () => {
  const user = document.getElementById('user').value;
  const pass = document.getElementById('pass').value;
  const res = await fetch('api/register.php', {
    method:'POST',
    body: JSON.stringify({username:user,password:pass})
  });
  const data = await res.json();
  if (data.success) {
    await fetchStreak();
    toggleAuth(true);
  } else alert(data.error);
};

document.getElementById('logout-btn').onclick = async () => {
  await fetch('api/logout.php');
  toggleAuth(false);
};

function toggleAuth(loggedIn) {
  document.getElementById('login-btn').style.display = loggedIn ? 'none' : '';
  document.getElementById('reg-btn').style.display = loggedIn ? 'none' : '';
  document.getElementById('logout-btn').style.display = loggedIn ? '' : 'none';
}


async function translateWord(word, targetLang) {
  const response = await fetch("https://libretranslate.de/translate", {
    method: "POST",
    body: JSON.stringify({
      q: word,
      source: "en",
      target: targetLang.toLowerCase().slice(0, 2), // e.g., "hi" for Hindi
      format: "text"
    }),
    headers: { "Content-Type": "application/json" }
  });

  const data = await response.json();
  return data.translatedText;
}

function init() {
  // pick a random solution
  solution = wordList[Math.floor(Math.random() * wordList.length)].toUpperCase();
  row = 0; col = 0; gameOver = false;
  answerEl.textContent = '';
  transUI.classList.add('hidden');
  transRes.textContent = '';
  // clear board
  board.innerHTML = '';
  for (let r = 0; r < rows*cols; r++) {
    let tile = document.createElement('div');
    tile.className = 'tile';
    board.appendChild(tile);
  }
  // set up keyboard
  keyboard.innerHTML = '';
  ['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'].forEach((line, idx) => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'keyboard-row';

    // on the 3rd row, add an ENTER button first
    if (idx === 2) {
      const enterKey = document.createElement('div');
      enterKey.textContent = 'ENTER';
      enterKey.className = 'key';
      enterKey.onclick = () => handleKey('ENTER');
      rowDiv.appendChild(enterKey);
    }

    // letter keys
    for (let ch of line) {
      const key = document.createElement('div');
      key.textContent = ch;
      key.className = 'key';
      key.onclick = () => handleKey(ch);
      rowDiv.appendChild(key);
    }

    // on the 3rd row, add a BACK button at the end
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

function handleKey(k) {
  if (gameOver) return;
  if (k === 'ENTER') return handleEnter();
  if (k === 'BACK' || k === '⌫') return handleDelete();
  if (k.match(/^[A-Z]$/)) {
    if (col < cols) {
      board.children[row*cols + col].textContent = k;
      col++;
    }
  }
}

function handleDelete() {
  if (col > 0) {
    col--;
    board.children[row*cols + col].textContent = '';
  }
}

function handleEnter() {
  // nothing to do if game’s over or row isn’t full
  if (gameOver) return;
  if (col < cols) return;

  // build the guessed word (array of uppercase letters)
  let guess = '';
  for (let i = 0; i < cols; i++) {
    guess += board.children[row * cols + i].textContent;
  }

  // check word list (your list is all lowercase)
  if (!guessList.includes(guess.toLowerCase())) {
    messageEl.textContent = 'Not in word list';
    messageEl.classList.add('visible');
    setTimeout(() => {
      messageEl.classList.remove('visible');
      messageEl.textContent = '';
    }, 2000);
    return;
  }

  // prepare for coloring
  const solArr = solution.split('');      // e.g. ['P','E','A','R']
  const status = Array(cols).fill('absent');
  const guessArr = guess.split('');        // same, uppercase

  // 1) mark all exact matches (green)
  for (let i = 0; i < cols; i++) {
    if (guessArr[i] === solArr[i]) {
      status[i] = 'correct';
      solArr[i] = null;  // consume
    }
  }

  // 2) mark present-but-misplaced (yellow) up to remaining letters
  for (let i = 0; i < cols; i++) {
    if (status[i] === 'absent') {
      const idx = solArr.indexOf(guessArr[i]);
      if (idx > -1) {
        status[i] = 'present';
        solArr[idx] = null;  // consume that instance
      }
    }
  }

  // apply tile and key colors
  for (let i = 0; i < cols; i++) {
    const tile = board.children[row * cols + i];
    tile.classList.add(status[i]);
    colorKey(guessArr[i], status[i]);
  }

  // win?
  if (status.every(s => s === 'correct')) {
    return endGame(`You got it! The word was ${solution}`);
  }

  // move to next row
  row++;
  col = 0;

  // out of attempts?
  if (row === rows) {
    streakCount = 0;
    updateStreak();
    endGame(`Game over! The word was ${solution}`);
  }
}



function colorKey(letter, status) {
  let keys = keyboard.querySelectorAll('.key');
  keys.forEach(k => {
    if (k.textContent === letter) {
      // upgrade only if new status is stronger
      if (!k.classList.contains('correct')) {
        if (status === 'correct' ||
           (status === 'present' && !k.classList.contains('present'))) {
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

document.addEventListener('keydown', e => {
  let key = e.key.toUpperCase();
  if (key === 'ENTER') return handleKey('ENTER');
  if (key === 'BACKSPACE') return handleKey('BACK');
  if (key.match(/^[A-Z]$/)) handleKey(key);
});

transBtn.onclick = () => {
  let name = langInput.value.trim().toLowerCase();
  let code = langMap[name];
  if (!code) {
    transRes.textContent = 'Language not supported.';
    return;
  }
  fetch(`https://api.mymemory.translated.net/get?q=${solution}&langpair=en|${code}`)
    .then(r => r.json())
    .then(d => {
      transRes.textContent = 'Translation: ' + d.responseData.translatedText;
    })
    .catch(_=> transRes.textContent = 'Translation error.');
};

resetBtn.onclick = () => {
  init();
  resetBtn.blur();  // remove focus so Enter won't fire Reset again
};

// start
init();

document.getElementById("translate-btn").addEventListener("click", async () => {
  const langInput = document.getElementById("lang-input").value.trim();
  const word = document.getElementById("answer").textContent.trim();

  if (!langInput || !word) return;

  try {
    const translatedMeaning = await translateWord(word, langInput);
    document.getElementById("translation-result").innerHTML =
      `Meaning-based translation in <b>${langInput}</b>: <b>${translatedMeaning}</b>`;
  } catch (err) {
    console.error("Translation failed:", err);
    document.getElementById("translation-result").textContent = "Translation failed.";
  }
});

document.getElementById("answer").textContent = correctWord;
document.getElementById("translation-ui").classList.remove("hidden");

document.getElementById("reset-btn").addEventListener("click", () => {
  document.getElementById("translation-ui").classList.add("hidden");
  document.getElementById("translation-result").textContent = "";
});