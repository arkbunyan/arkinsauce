export function setupUI(wordList, guessList, cols) {
  const board = document.getElementById("board");
  const keyboard = document.getElementById("keyboard");
  const message = document.getElementById("message");
  const answerDisplay = document.getElementById("answer");

  const solution = wordList[Math.floor(Math.random() * wordList.length)];
  let currentRow = 0;
  let currentGuess = "";

  const maxRows = 7;
  const totalTiles = cols * maxRows;

  // Render board tiles
  for (let i = 0; i < totalTiles; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    board.appendChild(tile);
  }

  // Keyboard layout
  const rows = [
    "QWERTYUIOP",
    "ASDFGHJKL",
    "ZXCVBNM"
  ];

  rows.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("keyboard-row");

    if (row === "ZXCVBNM") {
      const enterKey = createKey("ENTER");
      const backKey = createKey("⌫");
      rowDiv.appendChild(enterKey);
    }

    for (const char of row) {
      const key = createKey(char);
      rowDiv.appendChild(key);
    }

    if (row === "ZXCVBNM") {
      const backKey = createKey("⌫");
      rowDiv.appendChild(backKey);
    }

    keyboard.appendChild(rowDiv);
  });

  function createKey(label) {
    const key = document.createElement("div");
    key.classList.add("key");
    key.textContent = label;
    key.addEventListener("click", () => handleKey(label));
    return key;
  }

  function handleKey(key) {
    if (key === "ENTER") {
      if (currentGuess.length !== cols) return showMessage("Not enough letters");
      if (!guessList.includes(currentGuess.toLowerCase())) return showMessage("Invalid word");

      submitGuess();
    } else if (key === "⌫") {
      currentGuess = currentGuess.slice(0, -1);
      updateTiles();
    } else if (key.length === 1 && currentGuess.length < cols) {
      currentGuess += key;
      updateTiles();
    }
  }

  function updateTiles() {
    for (let i = 0; i < cols; i++) {
      const tileIndex = currentRow * cols + i;
      const tile = board.children[tileIndex];
      tile.textContent = currentGuess[i] || "";
    }
  }

  function submitGuess() {
    const guess = currentGuess.toLowerCase();
    const letterStates = Array(cols).fill("absent");
    const used = Array(cols).fill(false);

    // Mark correct letters
    for (let i = 0; i < cols; i++) {
      if (guess[i] === solution[i]) {
        letterStates[i] = "correct";
        used[i] = true;
      }
    }

    // Mark present letters
    for (let i = 0; i < cols; i++) {
      if (letterStates[i] === "correct") continue;
      for (let j = 0; j < cols; j++) {
        if (!used[j] && guess[i] === solution[j]) {
          letterStates[i] = "present";
          used[j] = true;
          break;
        }
      }
    }

    // Apply styles to tiles and keyboard
    for (let i = 0; i < cols; i++) {
      const tileIndex = currentRow * cols + i;
      const tile = board.children[tileIndex];
      tile.classList.add(letterStates[i]);

      const key = [...keyboard.querySelectorAll(".key")].find(k => k.textContent === guess[i].toUpperCase());
      if (key) key.classList.add(letterStates[i]);
    }

    if (guess === solution) {
      showMessage("You got it!");
      answerDisplay.textContent = solution.toUpperCase();
      disableInput();
    } else {
      currentRow++;
      currentGuess = "";
      if (currentRow === maxRows) {
        showMessage("Out of tries!");
        answerDisplay.textContent = solution.toUpperCase();
        disableInput();
      }
    }
  }

  function disableInput() {
    [...keyboard.querySelectorAll(".key")].forEach(k => k.removeEventListener("click", () => {}));
  }

  function showMessage(msg) {
    message.textContent = msg;
    message.classList.add("visible");
    setTimeout(() => message.classList.remove("visible"), 2000);
  }

  // Optional: Handle real keyboard input too
  document.addEventListener("keydown", (e) => {
    const key = e.key.toUpperCase();
    if (key === "BACKSPACE") handleKey("⌫");
    else if (key === "ENTER") handleKey("ENTER");
    else if (/^[A-Z]$/.test(key)) handleKey(key);
  });

  // Reset button
  document.getElementById("reset-btn").addEventListener("click", () => location.reload());
}
