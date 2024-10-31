function initClozeGame(
  sentence,
  gameContainer,
  italicSentence = false,
  showOverlay = true
) {
  gameContainer.classList.add("tappable");

  if (showOverlay) {
    const overlay = document.createElement("div");
    overlay.id = "overlay";
    overlay.textContent = "Show";
    overlay.onclick = () => {
      overlay.classList.add("hidden");
    };
    gameContainer.appendChild(overlay);
  }

  const wordRegex = /([\p{L}0-9-()/]+[’']?|\*.+?\*)/gu;
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
      if (part.includes("*")) {
        span.classList.add("word-highlight");
        span.innerText = part.replaceAll("*", "");
        span.dataset.word = "*";
      } else {
        span.innerText = part;
        span.dataset.word = part;
      }
      sentenceContainer.appendChild(span);

      span.onclick = () => {
        checkWord(
          wordButtonsContainer.querySelector(
            `.button[data-word="${part}"]:not(.disabled)`
          ),
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

  let hasStarButton = false;
  sortedWords.forEach((word) => {
    const wordButton = document.createElement("div");
    if (word.includes("*")) {
      if (hasStarButton) {
        return;
      }
      hasStarButton = true;
      wordButton.innerText = "★";
      wordButton.dataset.word = "*";
    } else {
      wordButton.innerText = word;
      wordButton.dataset.word = word;
    }
    wordButton.classList.add("button");
    wordButton.classList.add("word-button");
    wordButton.onclick = () => checkWord(wordButton);
    wordButtonsContainer.appendChild(wordButton);
  });

  function checkWord(button, force = false) {
    const word = button.dataset.word;
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

      if (word === "*") {
        document
          .querySelectorAll(".cloze.spoiler[data-word='*']")
          .forEach((cloze) => {
            cloze.classList.remove("spoiler");
          });
      }

      if (document.querySelectorAll(".cloze.spoiler").length === 0) {
        finish();
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
  }
}
