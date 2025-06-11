export async function translateWord(word, targetLang) {
  try {
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

    if (!response.ok) throw new Error("Failed to fetch translation.");

    const data = await response.json();
    return data.translatedText;
  } catch (err) {
    console.error("Translation error:", err);
    return "Translation failed.";
  }
}
