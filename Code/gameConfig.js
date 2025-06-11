import { fourLetterWords, fourLetterGuesses, threeLetterWords, threeLetterGuesses} from "./wordBank.js";

export function getGameConfig() {
  const mode = document.body.dataset.mode;
  const isFourdle = mode === "fourdle";

  return {
    cols: isFourdle ? 4 : 3,
    wordList: isFourdle ? fourLetterWords : threeLetterWords,
    guessList: isFourdle ? fourLetterGuesses : threeLetterGuesses,
  };
}
