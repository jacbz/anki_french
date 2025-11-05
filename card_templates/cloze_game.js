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
    
    const hasStar = sentence.includes("*");
    const buttons = [];

    // Add lightning button if sentence has *
    if (hasStar) {
      buttons.push({
        type: "lightning",
        icon: "lightning",
        iconSize: "extra-large",
        onClick: (overlay, allButtons) => {
          overlay.classList.add("hidden");
          allButtons.forEach(btn => btn.element.style.display = "none");
          document
            .querySelectorAll(".cloze:not(.word-highlight)")
            .forEach((c) => c.click());
          document.querySelector("#cloze-game hr").style.display = "none";
          document.querySelector("#cloze-game #word-buttons").style.display = "none";
        }
      });
    }

    // Add audio button
    buttons.push({
      type: "play",
      icon: "play",
      iconSize: "large",
      onClick: () => {
        playAudio({ text: sentenceToRead });
      }
    });

    // Add cloze button (always present)
    buttons.push({
      type: "cloze",
      icon: "cloze",
      iconSize: "huge",
      onClick: (overlay) => {
        overlay.classList.add("hidden");
      }
    });

    // Create button elements
    const buttonElements = buttons.map(config => {
      const button = document.createElement("div");
      button.className = `overlay-button overlay-button-${config.type}`;
      button.innerHTML = `<div class="svg-icon icon-${config.icon} ${config.iconSize}"></div>`;
      return { element: button, config };
    });

    // If we have multiple buttons before cloze (lightning and/or play), wrap them in a container
    if (buttons.length > 1 && (hasStar || isGerman)) {
      const preButtonsCount = buttons.length - 1; // all except cloze
      
      if (preButtonsCount > 0) {
        const container = document.createElement("div");
        container.className = "overlay-buttons-row";
        
        for (let i = 0; i < preButtonsCount; i++) {
          container.appendChild(buttonElements[i].element);
          
          // Add divider between buttons (but not after the last one)
          if (i < preButtonsCount - 1) {
            const divider = document.createElement("div");
            divider.className = "overlay-divider vertical";
            container.appendChild(divider);
          }
        }
        
        overlay.appendChild(container);
        
        // Add horizontal divider after the container
        const divider = document.createElement("div");
        divider.className = "overlay-divider";
        overlay.appendChild(divider);
      }
      
      // Add cloze button (last one)
      overlay.appendChild(buttonElements[buttonElements.length - 1].element);
    } else {
      // Just add the cloze button directly
      buttonElements.forEach(({ element }) => overlay.appendChild(element));
    }

    // Attach click handlers
    buttonElements.forEach(({ element, config }) => {
      element.onclick = () => config.onClick(overlay, buttonElements);
    });
    
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
