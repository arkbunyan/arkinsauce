import { getGameConfig } from "./gameConfig.js";
import { translateWord } from "./translation.js";
import { setupUI } from "./ui.js";

const { cols, wordList, guessList } = getGameConfig();

const board = document.getElementById("board");
board.style.setProperty("--cols", cols);
board.style.setProperty("--rows", 7);

setupUI(wordList, guessList, cols);