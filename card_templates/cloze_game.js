function initClozeGame(sentence, gameContainer, italicSentence = false) {
  gameContainer.classList.add("tappable");

  const overlay = document.createElement("div");
  overlay.id = "overlay";
  overlay.classList.add("button");
  overlay.textContent = "Anzeigen";
  overlay.onclick = () => {
    overlay.classList.add("hidden");
  };
  gameContainer.appendChild(overlay);

  const wordRegex = /([\p{L}0-9-]+[’']?|\*.+?\*)/gu;
  let words = Array.from(sentence.matchAll(wordRegex), (match) => match[0]);

  const sentenceContainer = document.createElement("div");
  sentenceContainer.id = "sentence-cloze";
  if (italicSentence) {
    sentenceContainer.style.fontStyle = "italic";
  }
  gameContainer.appendChild(sentenceContainer);

  const hr = document.createElement("hr");
  gameContainer.appendChild(hr);

  const wordButtonsContainer = document.createElement("div");
  wordButtonsContainer.id = "word-buttons";
  wordButtonsContainer.classList.add("button-container");
  gameContainer.appendChild(wordButtonsContainer);

  const sentenceParts = sentence.split(wordRegex);

  sentenceParts.forEach((part) => {
    if (words.includes(part)) {
      const span = document.createElement("span");
      span.classList.add("cloze");
      span.classList.add("spoiler");
      span.dataset.word = part;      
      if (part.includes("*")) {
        span.classList.add("word-highlight");
        span.innerText = part.replaceAll("*", "");
      } else {
        span.innerText = part;
      }
      sentenceContainer.appendChild(span);

      span.onclick = () => {
        checkWord(
          wordButtonsContainer.querySelector(`.button[data-word="${part}"]:not(.disabled)`),
          part,
          true
        );
        span.onclick = null;
      };

      const prevEl = span.previousSibling;
      if (
        prevEl &&
        ((prevEl.nodeType === Node.TEXT_NODE && prevEl.data === " ") ||
          prevEl.data === "")
      ) {
        span.classList.add("no-space");
      }
    } else {
      sentenceContainer.appendChild(document.createTextNode(part));
    }
  });

  const sortedWords = [...words].sort((a, b) =>
    a
      .replace("*", "")
      .localeCompare(b.replace("*", ""), "de", { sensitivity: "base" })
  );

  const starButtons = [];
  sortedWords.forEach((word) => {
    const wordButton = document.createElement("div");
    if (word.includes("*")) {
      wordButton.innerText = "★";
      if (starButtons.length > 0) {
        wordButton.style.display = "none";
      }
      starButtons.push(wordButton);
    } else {
      wordButton.innerText = word;
    }
    wordButton.classList.add("button");
    wordButton.classList.add("word-button");
    wordButton.dataset.word = word;
    wordButton.onclick = () => checkWord(wordButton, word);
    wordButtonsContainer.appendChild(wordButton);
  });

  function checkWord(button, word, force = false) {
    const clozeSpans = document.querySelectorAll(".cloze.spoiler");
    const clozeSpanIndex = Array.from(clozeSpans).findIndex(
      (span) => span.dataset.word === word
    );

    if (clozeSpanIndex === -1) {
      return;
    }

    if (force || clozeSpanIndex === 0) {
      const clozeSpan = clozeSpans[clozeSpanIndex];
      clozeSpan.classList.remove("spoiler");
      button.classList.add("disabled");
      button.disabled = true;

      clearErrorOutlines();

      if (clozeSpanIndex === 0 && clozeSpans.length === 1) {
        finish();
      }

      if (button.innerText === "★") {
        starButtons.forEach((starButton) => {
          if (starButton !== button) {
            checkWord(starButton, starButton.dataset.word, true);
          }
        });
      }
    } else {
      button.classList.add("error");
    }
  }

  function clearErrorOutlines() {
    document.querySelectorAll(".word-button").forEach((button) => {
      button.classList.remove("error");
    });
  }

  function finish() {
    gameContainer.classList.add("finished");
    gameContainer.classList.remove("tappable");

    if (typeof pycmd !== "undefined") {
      pycmd("ans");
    } else if (typeof study !== "undefined") {
      study.drawAnswer();
    } else if (typeof AnkiDroidJS !== "undefined") {
      showAnswer();
    } else if (window.anki && window.sendMessage2) {
      window.sendMessage2("ankitap", "midCenter");
    } else {
      sentenceContainer.click();
    }
  }
}
