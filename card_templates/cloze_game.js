function initClozeGame({
  sentence,
  sentenceToRead = sentence,
  gameContainer,
  isGerman = false,
  showOverlay = true,
}) {
  gameContainer.classList.add("tappable");

  if (showOverlay) {
    const overlay = document.createElement("div");
    overlay.id = "overlay";
    
    if (sentence.includes("*")) {      
      const lightningOverlay = document.createElement("div");
      lightningOverlay.className = "overlay-button overlay-button-lightning";
      lightningOverlay.innerHTML = `
        <div class="svg-icon icon-lightning extra-large"></div>
      `;
      lightningOverlay.onclick = () => {
        overlay.classList.add("hidden");
        clozeOverlay.style.display = "none";
        lightningOverlay.style.display = "none";
        document
          .querySelectorAll(".cloze:not(.word-highlight)")
          .forEach((c) => c.click());
        document.querySelector("#cloze-game hr").style.display = "none";
        document.querySelector("#cloze-game #word-buttons").style.display = "none";
      };
      
      overlay.appendChild(lightningOverlay);

      const divider = document.createElement("div");
      divider.className = "overlay-divider";
      overlay.appendChild(divider);
    }

    const clozeOverlay = document.createElement("div");
    clozeOverlay.className = "overlay-button overlay-button-cloze";
    clozeOverlay.innerHTML = `
      <div class="svg-icon icon-cloze huge"></div>
    `;
    clozeOverlay.onclick = () => {
      overlay.classList.add("hidden");
    };
    
    overlay.appendChild(clozeOverlay);
    
    gameContainer.appendChild(overlay);
  }

  // remove HTML tags from sentence
  sentence = sentence.replace(/<[^>]+>/g, "");

  const wordRegex = /([\p{L}0-9-()/]+[’']?|\*.+?\*)/gu;
  let words = Array.from(sentence.matchAll(wordRegex), (match) => match[0]);

  const sentenceContainer = document.createElement("div");
  sentenceContainer.id = "sentence-cloze";
  if (isGerman) {
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
        part = "*";
      } else {
        span.innerText = part;
      }
      span.dataset.word = part;
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
      wordButton.innerHTML = '<div class="svg-icon icon-star"></div>';
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

  let preloadAudio = true;
  let preloadCountdown = 2; // preload audio after 2 words

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
      preloadCountdown--;

      if (
        options.autoPlaySentenceOnClozeFinish &&
        preloadAudio &&
        preloadCountdown <= 0
      ) {
        preloadAudio = false;
        fetchAudio({ text: sentenceToRead });
      }

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
    if (options.autoPlaySentenceOnClozeFinish) {
      playAudio({ text: sentenceToRead });
    }
  }
}
