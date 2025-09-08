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
      const lightningButton = document.createElement("div");
      lightningButton.className = "overlay-button overlay-button-lightning";
      lightningButton.innerHTML = `
        <svg viewBox="0 0 24 24" class="overlay-icon">
          <path d="M12 2 L7 12 L10.5 12 L9 22 L17 10 L13.5 10 L12 2 Z" 
                stroke="currentColor" 
                stroke-width="0.8" 
                fill="none" 
                stroke-linejoin="round" 
                stroke-linecap="round"/>
        </svg>
      `;
      lightningButton.onclick = () => {
        overlay.classList.add("hidden");
        clozeButton.style.display = "none";
        lightningButton.style.display = "none";
        document
          .querySelectorAll(".cloze:not(.word-highlight)")
          .forEach((c) => c.click());
        document.querySelector("#cloze-game hr").style.display = "none";
        document.querySelector("#cloze-game #word-buttons").style.display = "none";
      };
      
      overlay.appendChild(lightningButton);

      const divider = document.createElement("div");
      divider.className = "overlay-divider";
      overlay.appendChild(divider);
    }

    const clozeButton = document.createElement("div");
    clozeButton.className = "overlay-button overlay-button-cloze";
    clozeButton.innerHTML = `
      <svg viewBox="0 0 24 24" class="overlay-icon">
        <rect x="2" y="4" width="3.5" height="3" rx="0.5" fill="currentColor" opacity="0.8"/>
        <rect x="6.5" y="4" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.3"/>
        <rect x="10" y="4" width="4" height="3" rx="0.5" fill="currentColor" opacity="0.8"/>
        <rect x="15" y="4" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.3"/>
        <rect x="19" y="4" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.8"/>
        <rect x="2" y="9" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.3"/>
        <rect x="5.5" y="9" width="5" height="3" rx="0.5" fill="currentColor" opacity="0.8"/>
        <rect x="11.5" y="9" width="3.5" height="3" rx="0.5" fill="currentColor" opacity="0.3"/>
        <rect x="16" y="9" width="2" height="3" rx="0.5" fill="currentColor" opacity="0.8"/>
        <rect x="19" y="9" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.3"/>
        <rect x="2" y="14" width="4" height="3" rx="0.5" fill="currentColor" opacity="0.8"/>
        <rect x="7" y="14" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.3"/>
        <rect x="11" y="14" width="6" height="3" rx="0.5" fill="currentColor" opacity="0.8"/>
        <rect x="18" y="14" width="3.5" height="3" rx="0.5" fill="currentColor" opacity="0.3"/>
      </svg>
    `;
    clozeButton.onclick = () => {
      overlay.classList.add("hidden");
    };
    
    overlay.appendChild(clozeButton);
    
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
