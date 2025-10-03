___CONFIG___;

const wordWithArticle = document.querySelector(".word");
const word = wordWithArticle.dataset.word;
const rankElement = document.querySelector(".rank");
const rank = parseInt(rankElement.dataset.content);

/**
 * Feminine form
 */
const feminine = wordWithArticle.dataset.feminine;
function longestCommonPrefix(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return a.slice(0, i);
}

const feminineHeight = 0.65;
if (feminine) {
  const feminineWords = feminine
    .split(",")
    .map((f) => f.trim())
    .filter((f) => f.length > 0);

  let commonStem = word;
  for (const feminineWord of feminineWords) {
    commonStem = longestCommonPrefix(commonStem, feminineWord);
  }

  const wordSpan = document.createElement("span");
  wordSpan.className = "word_span";
  wordSpan.textContent = word;

  // only one feminine and word is fully contained within it => simply attach to lemma
  if (feminineWords.length === 1 && commonStem === word) {
    const feminineSpan = document.createElement("span");
    feminineSpan.className = "feminine";
    feminineSpan.textContent = feminineWords[0];

    wordSpan.appendChild(feminineSpan);
  } else {
    const marginBottom = feminineWords.length * feminineHeight;
    wordWithArticle.style.marginBottom = `${marginBottom}em`;

    feminineWords.forEach((feminineWord, index) => {
      const feminineSpan = document.createElement("span");
      feminineSpan.className = "feminine";

      const topPosition = 0.7 + index * feminineHeight;
      feminineSpan.style.top = `${topPosition}em`;

      const stemSpan = document.createElement("span");
      stemSpan.className = "stem";
      stemSpan.dataset.before = commonStem;
      stemSpan.dataset.after = feminineWord.slice(commonStem.length);
      stemSpan.textContent = commonStem.length > 0 ? commonStem : "​";

      feminineSpan.appendChild(stemSpan);

      wordSpan.appendChild(feminineSpan);
    });
  }

  const textContent = wordWithArticle.textContent;
  const parts = textContent.split(word);

  wordWithArticle.innerHTML = "";
  if (parts[0]) {
    wordWithArticle.appendChild(document.createTextNode(parts[0]));
  }
  wordWithArticle.appendChild(wordSpan);
  if (parts[1]) {
    wordWithArticle.appendChild(document.createTextNode(parts[1]));
  }
}

/**
 * POS
 */
const pos = document.querySelector(".pos");
if (pos) {
  pos.onclick = function () {
    if (!pos.classList.contains("expanded")) {
      pos.classList.add("expanded");
      const posMap = [
        ["vaux", "Hilfsverb", ""],
        ["vi", "intransitives Verb", ""],
        ["vt", "transitives Verb", ""],
        ["vr", "reflexives Verb", ""],
        ["adj", "Adjektiv", ""],
        ["adv", "Adverb", ""],
        ["art", "Artikel", ""],
        ["app", "Apposition", ""],
        ["conj", "Konjunktion", ""],
        ["det", "Determinativ", ""],
        ["intj", "Interjektion", ""],
        ["num", "Numeral", ""],
        ["prep", "Präposition", ""],
        ["pro", "Pronomen", ""],
        ["n", "Substantiv", ""],
        ["(imp)", "unpersönliches", "prefix"],
        ["pl", "nur in Plural", "suffix"],
        ["f", "feminines", "prefix"],
        ["m", "maskulines", "prefix"],
        ["i", "unveränderliches", "prefix"],
      ];
      const allPosArray = [];
      pos.innerHTML.split(", ").forEach(function (component) {
        const posArray = [];
        posMap.forEach(function (pair) {
          if (component.includes(pair[0])) {
            if (pair[2] === "prefix") {
              posArray.unshift(pair[1]);
            } else {
              posArray.push(pair[1]);
            }
            component = component.replace(pair[0], "");
          }
        });
        allPosArray.push(posArray.join(" "));
      });
      pos.innerHTML = allPosArray.join(",<br>");
    }
  };
}

/**
 * Definition
 */
formatDefinition();

/**
 * Sentences
 */
const sentencesInner = document.getElementById("sentences-inner");
const sentencesData = sentencesInner.innerHTML;
const sentencesPairs = sentencesData.split("\n\n");
shuffleArray(sentencesPairs, false);

let currentSentence = 0;
let showClozeGame = false;
const sentenceCounter = document.getElementById("sentence-counter");

const audioButton = function (text, customFileName = "") {
  return `<div class="button svg-button small play-sentence" data-text="${encodeURIComponent(
    text
  )}" data-file-name="${customFileName}">
    <div class="svg-icon icon-play"></div>
  </div>`;
};

const gameContainer = document.getElementById("cloze-game");
function refreshExampleSentences() {
  const fr = sentencesPairs[currentSentence].split("\n")[0];
  const de = sentencesPairs[currentSentence].split("\n")[1];

  if (showClozeGame) {
    sentencesInner.innerHTML = frenchFirst
      ? `<div class="fr">${fr}</div>`
      : `<div class="de">${de}</div>`;

    gameContainer.style.display = null;

    gameContainer.innerHTML = "";
    gameContainer.className = "";
    initClozeGame({
      sentence: frenchFirst
        ? processText(de, false, false)
        : processText(fr, true, false),
      sentenceToRead: processText(fr, true, false),
      gameContainer,
      isGerman: frenchFirst,
      showOverlay: false,
    });
  } else {
    sentencesInner.innerHTML = frenchFirst
      ? `<div class="fr">${fr}</div><span class="de spoiler">${de}</span>`
      : `<div class="de">${de}</div><span class="fr spoiler">${fr}</span>`;

    gameContainer.style.display = "none";
  }

  sentenceCounter.textContent = `${currentSentence + 1}/${
    sentencesPairs.length
  }`;
  formatLanguageText(document.querySelector("#sentences"));
}

function formatLanguageText(within = document) {
  within.querySelectorAll(".fr").forEach(function (el) {
    if (el.querySelector(".sentence-with-audio")) {
      return;
    }

    const text = processText(el.innerHTML, true);

    // show audio button if sentence ends with punctuation
    const shouldShow =
      !el.classList.contains("no-audio") &&
      (text.match(/[.!?…→]/) || el.classList.contains("force-audio"));
    el.innerHTML = text;
    if (shouldShow) {
      const textContent = el.textContent;
      const customFileName = el.dataset.audioFile;
      el.innerHTML = `<span class="sentence-with-audio">${audioButton(
        textContent,
        customFileName
      )}<span>${text}</span></span>`;
      if (el.classList.contains("spoiler")) {
        el.classList.remove("spoiler");
        el.querySelector(".sentence-with-audio > span").classList.add(
          "spoiler"
        );
      }
    }
  });

  within.querySelectorAll(".de").forEach(function (el) {
    el.innerHTML = processText(el.innerHTML, false);
  });

  within.querySelectorAll(".spoiler:not(.cloze)").forEach(function (el) {
    if (!options.hideSpoilers) {
      el.classList.add("clicked");
    } else {
      el.onclick = function () {
        this.classList.toggle("clicked");
      };
    }
  });

  initAudioButtons(within);
}

async function initAudioButtons(within = document) {
  within.querySelectorAll(".play-sentence").forEach(function (el) {
    el.onclick = async function (event) {
      event.stopPropagation();
      const text = this.dataset.text;
      const customFileName = this.dataset.fileName;

      playAudio({ text, customFileName });
    };
  });

  if (within == document && options.autoPlaySentence) {
    setTimeout(() => {
      if (options.autoPlaySentenceInGerman) {
        playAudio({ text: sentencesPairs[0].split("\n")[1], lang: "de-DE" });
      } else {
        playAudio({ text: sentencesPairs[0].split("\n")[0] });
      }
    }, options.autoPlaySentenceDelay ?? 1000);
  }
}

refreshExampleSentences();
formatLanguageText();

// do not show spoiler for first sentence
document.querySelector(".spoiler").classList.add("clicked");

const nextSentenceButton = document.getElementById("next-sentence");
const clozeGameButton = document.getElementById("cloze-game-button");
nextSentenceButton.onclick = nextSentenceHandler;
sentencesInner.ondblclick = nextSentenceHandler;

function nextSentenceHandler(event) {
  if (event.target.closest(".spoiler")) {
    return;
  }
  currentSentence = (currentSentence + 1) % sentencesPairs.length;
  refreshExampleSentences();
}

clozeGameButton.onclick = function (e) {
  e.stopPropagation();
  showClozeGame = !showClozeGame;
  refreshExampleSentences();
};

/**
 * Conjugations
 */
const conjugationTable = document.getElementById("conjugation-table");
const conjugationGrammar = document.getElementById("conjugation-grammar");

const aux = conjugationTable ? conjugationTable.dataset.aux : "avoir";
const isHAspire = conjugationTable
  ? conjugationTable.dataset.hAspire === "true"
  : false;
const isOnlyThirdPerson = conjugationTable
  ? conjugationTable.dataset.onlyThirdPerson === "true"
  : false;
const isReflexive = conjugationTable
  ? conjugationTable.dataset.reflexive === "true"
  : false;

if (conjugationTable) {
  let showRegularConjugations = false;
  const showHideButton = document.getElementById("show-hide-button");
  const label = document.getElementById("show-hide-label");
  const verbClassification = document.getElementById("verb-classification");

  document.querySelectorAll("tr[data-tense]").forEach(function (el) {
    const dataTense = el.dataset.tense;
    if (!options.tenses.includes(dataTense)) {
      el.style.display = "none";
    }
  });

  const regularTenseRows = document.querySelectorAll("tr.regular_tense");
  if (regularTenseRows.length === 0) {
    showHideButton.remove();
  } else {
    function toggleConjugations() {
      showRegularConjugations = !showRegularConjugations;
      document.querySelectorAll("tr.regular_tense").forEach(function (el) {
        el.classList.toggle("show", showRegularConjugations);
      });
      label.textContent = showRegularConjugations
        ? "Nur unregelmäßige anzeigen"
        : "Alles anzeigen";
      squish_cells();

      if (verbClassification && conjugationTable.offsetHeight > 0) {
        conjugationTable.style.marginTop = "0.5em";
      } else {
        conjugationTable.style.marginTop = null;
      }
    }

    showHideButton.onclick = toggleConjugations;
    if (verbClassification) {
      verbClassification.ondblclick = toggleConjugations;
    }
  }

  function squish_cells() {
    document
      .querySelectorAll(":is(.tense,.regular,.irregular) > div")
      .forEach(function (el) {
        el.classList.add("squished");
        const scaleRatio = el.offsetWidth / el.scrollWidth;
        if (scaleRatio < 1) {
          el.style.transform = `scaleX(${scaleRatio})`;
        }
      });
  }
  squish_cells();

  function loadConjugationGrammar(grammarIds) {
    conjugationGrammar.innerHTML = "";
    for (const grammarId of grammarIds) {
      const grammarElement = document.createElement("grammar");
      grammarElement.dataset.id = grammarId;
      conjugationGrammar.appendChild(grammarElement);
    }
    const loadedGrammarElements = loadAllGrammar();
    if (loadedGrammarElements.length === 1) {
      toggleSection(loadedGrammarElements[0]);
    }
    if (loadedGrammarElements.length > 0) {
      window.scrollTo({
        top: conjugationTable.getBoundingClientRect().top + window.scrollY,
        behavior: "smooth",
      });
    }
  }

  conjugationTable.querySelectorAll("tr").forEach(function (el) {
    const tense = el.dataset.tense;
    el.onclick = function () {
      loadConjugationGrammar(grammar.tenses[tense]);
    };
  });
}

/**
 * Grammar loader
 */
const grammarLibrary = document.getElementById("grammar-library");
let grammar = {
  index: {},
  tenses: {},
  content: {},
  github: {},
};
fetch(`${getAnkiPrefix()}/FR5000_grammar____VERSION___.json`)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  })
  .then((loadedGrammar) => {
    grammar = loadedGrammar;
    loadAllGrammar();
  })
  .catch((err) => {
    console.error(err);
    grammarLibrary.classList.remove("collapsed");
    grammarLibrary.innerHTML = `<div class="error-message">
        <p>Es ist ein Fehler beim Laden der Grammatik-Bibliothek aufgetreten:</p>
        <p class="error-details">${err.message}</p>
        <p>Bitte melde das Problem auf <a href='https://github.com/jacbz/anki_french/issues'>GitHub</a>.</p>
      </div>`;
  });

function loadGrammar(id, into) {
  id = id.normalize();
  if (!grammar.content[id]) {
    into.innerHTML = `Fehler: Grammatik ${id} nicht gefunden.`;
    return;
  }
  const htmlString = grammar.content[id];

  const grammarElement = document.createElement("div");
  grammarElement.className = "section";
  grammarElement.dataset.id = id;
  grammarElement.innerHTML = htmlString;

  into.parentElement.replaceChild(grammarElement, into);

  const content = grammarElement.querySelector(".section-content");

  if (!content) {
    console.error("Loaded grammar has no content:", id, grammarElement);
    return grammarElement;
  }

  content.innerHTML += `<div class="github"><a href="${grammar.github[id]}">Auf GitHub bearbeiten</a></div>`;
  // highlight lemmas that match the current word
  content.querySelectorAll(".marklemma").forEach(function (el) {
    const normalize = (s) => (s ? s.normalize().toLowerCase() : s);
    const text = el.textContent.trim();
    const lemmaAttr =
      el.dataset.lemma ||
      el.getAttribute("data-lemma") ||
      el.getAttribute("lemma");

    if (
      normalize(text) !== normalize(word) &&
      normalize(lemmaAttr) !== normalize(word)
    ) {
      el.classList.remove("marklemma");
    }
  });

  enableSectionToggle(grammarElement);
  formatLanguageText(grammarElement);
  initGrammarLinks(grammarElement);

  // fall back map
  let conjugationInfinitive = "regarder";
  const tenseMap = {
    P: ["regarde", "regardes", "regarde", "regardons", "regardez", "regardent"],
    PC: ["regardé"],
    IT: [
      "regardais",
      "regardais",
      "regardait",
      "regardions",
      "regardiez",
      "regardaient",
    ],
    F: [
      "regarderai",
      "regarderas",
      "regardera",
      "regarderons",
      "regarderez",
      "regarderont",
    ],
    IF: ["", "regarde", "", "regardons", "regardez", ""],
    G: ["regardant"],
    C: [
      "regarderais",
      "regarderais",
      "regarderait",
      "regarderions",
      "regarderiez",
      "regarderaient",
    ],
    S: [
      "regarde",
      "regardes",
      "regarde",
      "regardions",
      "regardiez",
      "regardent",
    ],
    SI: [
      "regardasse",
      "regardasses",
      "regardât",
      "regardassions",
      "regardassiez",
      "regardassent",
    ],
    PS: [
      "regardai",
      "regardas",
      "regarda",
      "regardâmes",
      "regardâtes",
      "regardèrent",
    ],
  };
  if (
    conjugationTable &&
    conjugationGrammar &&
    conjugationGrammar.contains(grammarElement)
  ) {
    conjugationInfinitive = word;
    document.querySelectorAll("#conjugation-table tr").forEach(function (el) {
      const tenseValues = [...el.querySelectorAll("td[data-full]")].map(
        (td) => td.dataset.full
      );
      tenseMap[el.dataset.tense] = tenseValues;
    });
  }

  for (const tense in tenseMap) {
    fillInConjugationTable(grammarElement, tenseMap[tense], tense);
  }
  fillInConjugationTable(grammarElement, [conjugationInfinitive], "INFINITIVE");

  formatConjugationTables(grammarElement);
  return grammarElement;
}

function loadAllGrammar() {
  const loadedGrammarElements = [];
  document.querySelectorAll("grammar[data-id]").forEach(function (el) {
    const id = el.dataset.id;
    loadedGrammarElements.push(loadGrammar(id, el));
  });
  initGrammarLinks();
  return loadedGrammarElements;
}

function fillInConjugationTable(within, tenseValues, tense) {
  if (tenseValues.length > 0) {
    within
      .querySelectorAll(`.section *[data-tense="${tense}"]`)
      .forEach(function (tenseElement, index) {
        if (tenseValues[index] !== "") {
          const tenseValue =
            tenseValues[Math.min(index, tenseValues.length - 1)];
          tenseElement.textContent += tenseValue;

          if (tenseValue.match(/^[aeiouàâäéèêëîïôöùûüh]/) && !isHAspire) {
            tenseElement.parentElement.classList.add("elision");
          }
        }
      });
  }
}

function formatConjugationTables(within) {
  within.querySelectorAll(".section-conjugation-table").forEach(function (el) {
    if (!el.dataset.aux) {
      el.dataset.aux = aux;
      el.dataset.onlyThirdPerson = isOnlyThirdPerson;
      el.dataset.reflexive = isReflexive;
    }

    const audioSentence = [...el.querySelectorAll("tr")]
      .map((tr) => getVisibleText(tr) + ". ")
      .map((text) => text.charAt(0).toUpperCase() + text.slice(1))
      .filter((text) => text.length > 0)
      .join("")
      .replaceAll("’ ", "'")
      .replaceAll("' ", "'")
      .replaceAll("/", ", ");

    if (
      el.parentElement.classList.contains("section-conjugation-table-wrapper")
    ) {
      el.parentElement.querySelector(".play-sentence").outerHTML =
        audioButton(audioSentence);
    } else {
      const wrapper = document.createElement("div");
      wrapper.className = "section-conjugation-table-wrapper";
      wrapper.innerHTML = `
          <div class="section-conjugation-table-wrapper">
            ${audioButton(audioSentence)}
            ${el.outerHTML}
            <div class="button svg-button small reflexive-button">
                <div class="svg-icon icon-reflexive"></div>
            </div>
          </div>
        `;
      el.parentNode.replaceChild(wrapper, el);
      const reflexiveButton = wrapper.querySelector(".reflexive-button");
      if (isReflexive || !wrapper.querySelector(".reflexive")) {
        reflexiveButton.style.display = "none";
      }
      reflexiveButton.onclick = () => {
        const table = wrapper.querySelector(".section-conjugation-table");
        table.dataset.reflexive =
          table.dataset.reflexive === "true" ? "false" : "true";
        table.dataset.aux = table.dataset.reflexive === "true" ? "etre" : aux;
        formatConjugationTables(wrapper);
      };
    }
  });
  initAudioButtons();
}

/**
 * Grammar library
 */
const grammarSections = document.getElementById("grammar-sections");
const showHideGrammarLibraryButton = document.getElementById(
  "show-hide-grammar-library"
);
const closeLibraryButton = document.getElementById("close-grammar-library");
let isRendered = false;

function showGrammarLibrary() {
  if (!isRendered) {
    renderGrammarLibrary();
    isRendered = true;
  }
  setTimeout(() => {
    grammarLibrary.classList.remove("collapsed");
    setTimeout(() => {
      grammarSections.classList.remove("fly-in");
    }, 500);
  }, 10);
}

if (grammar) {
  showHideGrammarLibraryButton.onclick = function () {
    window.scrollTo({ top: grammarLibrary.offsetTop, behavior: "smooth" });
    grammarSections.classList.add("fly-in");
    showGrammarLibrary();
  };
  closeLibraryButton.onclick = function () {
    grammarLibrary.classList.add("collapsed");
  };
} else {
  grammarLibrary.remove();
}

function renderGrammarLibrary() {
  for (const [category, subcategories] of Object.entries(grammar.index)) {
    const categorySection = document.createElement("div");
    categorySection.className = "section";
    categorySection.dataset.id = category;

    const categoryTitle = document.createElement("div");
    categoryTitle.className = "section-title";
    categoryTitle.textContent = category;
    categorySection.appendChild(categoryTitle);

    const categoryContent = document.createElement("div");
    categoryContent.className = "section-content";
    categoryContent.classList.add("has-subsections");

    for (const id of subcategories) {
      const subcategorySection = document.createElement("div");
      subcategorySection.className = "section";
      subcategorySection.dataset.id = id;

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = grammar.sectionTitles[id];
      const subcategoryTitle = tempDiv.firstElementChild;
      subcategorySection.appendChild(subcategoryTitle);

      categoryContent.appendChild(subcategorySection);
    }

    categorySection.appendChild(categoryContent);
    grammarSections.appendChild(categorySection);
  }
  enableSectionToggle();
  initCefrFilter();
  initGrammarSearch();
}
function filter(expandSections = false) {
  const cefrLevels = ["A1", "A2", "B1", "B2", "C1"];
  const activePills = document.querySelectorAll(".pill.active");
  const selectedLevels = Array.from(activePills).map(
    (pill) => pill.dataset.level
  );

  const searchInput = document.getElementById("grammar-search-input");
  const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const normalizeText = (str) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normalizedSearchTerm = normalizeText(searchTerm);

  // Set initial visibility on all sections based on filters ---
  grammarLibrary.querySelectorAll(".section").forEach((section) => {
    const titleElement = section.querySelector(".section-title[data-topic]");
    let shouldShow = true;

    if (titleElement) {
      const topicLevels = titleElement.dataset.topic
        .split("/")
        .map((l) => l.trim());
      shouldShow =
        // if every level is selected, show all
        selectedLevels.length === cefrLevels.length ||
        // if no level is selected, show only sections without level
        (selectedLevels.length === 0 &&
          topicLevels.every((l) => !cefrLevels.includes(l))) ||
        // if there is a filter, show only matching levels
        topicLevels.some((l) => selectedLevels.includes(l));
    }

    if (shouldShow && searchTerm) {
      const sectionTitle = section.querySelector(".section-title");
      if (sectionTitle) {
        const titleText = sectionTitle.textContent.toLowerCase();
        shouldShow = normalizeText(titleText).includes(normalizedSearchTerm);
      } else {
        shouldShow = false;
      }
    }
    section.style.display = shouldShow ? "" : "none";
  });

  // Hide any parent sections that now have no visible children
  grammarLibrary
    .querySelectorAll("#grammar-sections > .section")
    .forEach((section) => {
      const hasVisibleChildren = Array.from(
        section.querySelectorAll(".section")
      ).some((child) => child.style.display !== "none");
      section.style.display = hasVisibleChildren ? "" : "none";
    });

  // Adjust height for sections that were already expanded
  grammarLibrary.querySelectorAll(".section.expanded").forEach((section) => {
    if (section.style.display !== "none") {
      const content = section.querySelector(".section-content");
      if (content) {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    }
  });

  // Animate the expansion of newly revealed sections ---
  if (expandSections) {
    grammarLibrary
      .querySelectorAll("#grammar-sections > .section:not(.expanded)")
      .forEach((section) => {
        if (section.style.display !== "none") {
          toggleSection(section, true);
        }
      });
  }

  // Update the "no results" message ---
  const noResultsElement = document.getElementById("grammar-no-results");
  const visibleTopLevelCount = grammarLibrary.querySelectorAll(
    "#grammar-sections > .section:not([style*='display: none'])"
  ).length;
  if (noResultsElement) {
    noResultsElement.style.display =
      searchTerm && visibleTopLevelCount === 0 ? "block" : "none";
  }
}

function initCefrFilter() {
  const levelPills = document.querySelectorAll(".pill");

  levelPills.forEach((pill) => {
    pill.onclick = () => {
      pill.classList.toggle("active");
      filter(true);
    };
  });

  filter();
}

function initGrammarSearch() {
  const searchInput = document.getElementById("grammar-search-input");
  const clearButton = document.getElementById("grammar-search-clear");

  if (!searchInput || !clearButton) return;

  let searchTimeout;
  let hasScrolledToSearch = false;

  // Scroll to search input when first focused
  searchInput.addEventListener("focus", () => {
    if (!hasScrolledToSearch) {
      hasScrolledToSearch = true;
      setTimeout(() => {
        searchInput.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }, 100); // Small delay to ensure the element is properly positioned
    }
  });

  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      filter(searchInput.value.trim() !== "");

      // Scroll to search input after filtering (especially useful on mobile)
      if (searchInput.value.trim()) {
        setTimeout(() => {
          searchInput.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
        }, 100);
      }
    }, 300); // Debounce search
  });

  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    filter();
  });

  // Show/hide clear button based on input content
  const toggleClearButton = () => {
    clearButton.style.display = searchInput.value.trim() ? "block" : "none";
  };

  searchInput.addEventListener("input", toggleClearButton);
  toggleClearButton(); // Initial state
}

/**
 * Collapsible sections
 */
function loadGrammarSection(section) {
  if (section.dataset.id && !section.querySelector(".section-content")) {
    const newGrammar = loadGrammar(section.dataset.id, section);
    return newGrammar;
  }
  return section;
}

function enableSectionToggle(within = document) {
  const sections = within.classList?.contains("section")
    ? [within]
    : within.querySelectorAll(".section");

  sections.forEach(function (section) {
    const title = section.querySelector(".section-title");
    if (!title) {
      console.error("Section has no title:", section);
      return;
    }
    title.onclick = function () {
      if (!section.querySelector(".section-content")) {
        toggleSection(loadGrammarSection(section));
      } else {
        toggleSection(section);
      }
    };
  });
}

enableSectionToggle();

function removeSectionButtons(section) {
  const container = section.querySelector(".section-buttons-container");
  if (container) {
    container.remove();
  }
}

function updateSectionButtons(section) {
  const content = section.querySelector(".section-content");
  if (!content) return;

  removeSectionButtons(section);

  const buttons = [];

  // 1. "Return button"
  if (section._returnLink) {
    const button = document.createElement("div");
    button.className = "section-button button";
    button.dataset.buttonType = "return";

    const iconSpan = document.createElement("div");
    iconSpan.className = "svg-icon icon-return";
    button.appendChild(iconSpan);
    button.appendChild(document.createTextNode("Zurück"));

    button.onclick = (e) => {
      e.stopPropagation();
      toggleSection(section, false, true);
      const link = section._returnLink;
      setTimeout(() => {
        link.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        link.classList.add("flash-highlight");
        link.addEventListener(
          "animationend",
          () => {
            link.classList.remove("flash-highlight");
          },
          { once: true }
        );
      }, 200);
    };
    buttons.push(button);
  }

  // 2. "Go to marked lemma" button
  const marklemma = content.querySelector(".marklemma");
  if (marklemma) {
    const button = document.createElement("div");
    button.className = "section-button button";
    button.dataset.buttonType = "lemma";

    const iconSpan = document.createElement("div");
    iconSpan.className = "svg-icon icon-star";
    button.appendChild(iconSpan);
    button.appendChild(
      document.createTextNode(
        marklemma.dataset.lemma || marklemma.textContent.trim()
      )
    );

    button.onclick = (e) => {
      e.stopPropagation();
      marklemma.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    buttons.push(button);
  }

  if (buttons.length > 0) {
    const container = document.createElement("div");
    container.className = "section-buttons-container";
    buttons.forEach((btn) => container.appendChild(btn));
    content.insertBefore(container, content.firstChild);
  }
}

function toggleSection(section, forceExpand = false, disableScroll = false) {
  const content = section.querySelector(".section-content");
  if (!content) {
    console.error("Section has no content to expand:", section);
    return;
  }

  const isExpanding = forceExpand || !section.classList.contains("expanded");
  const isCollapsing = !isExpanding;

  // This function contains the logic that changes the class and style to trigger the animation.
  const performToggleAnimation = () => {
    if (isExpanding) {
      section.classList.add("expanded");
      updateSectionButtons(section);
      content.style.maxHeight = content.scrollHeight + "px";

      // Allow parent containers to grow
      let ancestor = section.parentElement;
      while (ancestor && ancestor.classList.contains("section-content")) {
        ancestor.style.maxHeight = "unset";
        ancestor = ancestor.parentElement;
      }
    } else {
      // Collapsing
      removeSectionButtons(section);
      section.classList.remove("expanded");
      content.style.maxHeight = null;
    }
  };

  if (isCollapsing) {
    const title = section.querySelector(".section-title");
    if (title) {
      const titleRect = title.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      const isStickyActive = sectionRect.top < titleRect.top - 10;

      if (isStickyActive) {
        // Perform the scroll immediately to prevent visual jump.
        const sectionAbsoluteTop = window.scrollY + sectionRect.top;
        const targetScrollY = sectionAbsoluteTop - titleRect.top;
        const newScrollPosition = Math.max(0, targetScrollY);
        if (!disableScroll) {
          window.scrollTo(0, newScrollPosition);
        }

        // Defer the animation logic to the next event loop tick.
        setTimeout(performToggleAnimation, 0);
        return;
      }
    }
  }

  setTimeout(performToggleAnimation, 0);
}

// Returns the parent .sections of the given element, from outermost to innermost, including the element itself if it is a .section
function getParentSections(el) {
  const sections = [];
  let current = el;
  while (current) {
    if (current.classList && current.classList.contains("section")) {
      sections.unshift(current);
    }
    current = current.parentElement;
  }
  return sections;
}

function initGrammarLinks(within = document) {
  within.querySelectorAll("a[grammar]").forEach(function (el) {
    const grammarId = el.getAttribute("grammar");
    if (
      !grammarId ||
      (!grammar.content[grammarId] && !grammar.index[grammarId])
    ) {
      console.log(grammarId, grammar.content, grammar.index);
      el.classList.add("red-link");
      return;
    }
    el.title = grammarId;

    el.onclick = function (e) {
      e.preventDefault();
      if (grammarLibrary.classList.contains("collapsed")) {
        showGrammarLibrary();
      }

      let section = grammarLibrary.querySelector(
        `.section[data-id="${grammarId}"]`
      );
      if (section) {
        for (const ancestorSection of getParentSections(section)) {
          if (!ancestorSection.classList.contains("expanded")) {
            section = loadGrammarSection(ancestorSection);
            toggleSection(section, true, false);
          }
        }

        setTimeout(() => {
          window.scrollTo({
            top: section.getBoundingClientRect().top + window.scrollY - 100,
            behavior: "smooth",
          });

          section._returnLink = el;
          if (section.classList.contains("expanded")) {
            updateSectionButtons(section);
          }
        }, 200);
      }
    };
  });
}

___DICT___;

/**
 * Easter egg: Clicking on rank shows the number spelled out
 */
function numberToFrench(n) {
  if (n === 0) return "zéro";

  const units = [
    "",
    "un",
    "deux",
    "trois",
    "quatre",
    "cinq",
    "six",
    "sept",
    "huit",
    "neuf",
    "dix",
    "onze",
    "douze",
    "treize",
    "quatorze",
    "quinze",
    "seize",
  ];
  const tens = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante"];

  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    const remainder = n % 1000;
    const prefix = thousands === 1 ? "mille" : units[thousands] + " mille";
    return prefix + (remainder > 0 ? " " + numberToFrench(remainder) : "");
  }
  if (n >= 100) {
    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;
    const prefix = hundreds === 1 ? "cent" : units[hundreds] + " cent";
    return (
      prefix +
      (remainder === 0 && hundreds > 1 ? "s" : "") +
      (remainder > 0 ? " " + numberToFrench(remainder) : "")
    );
  }
  if (n >= 80)
    return "quatre-vingt" + (n === 80 ? "s" : "-" + numberToFrench(n - 80));
  if (n >= 70)
    return "soixante" + (n === 71 ? " et onze" : "-" + numberToFrench(n - 60));
  if (n >= 20) {
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    if (unit === 0) return tens[ten];
    return tens[ten] + (unit === 1 ? " et un" : "-" + units[unit]);
  }
  if (n > 16) return "dix-" + units[n % 10];

  return units[n];
}

if (rank >= 1) {
  rankElement.onclick = function () {
    rankElement.classList.add("spelled-out");
    rankElement.innerHTML = `<div class="fr force-audio condensed">${numberToFrench(
      rank
    )}</div>`;
    formatLanguageText(rankElement);
    rankElement.onclick = null;
  };
}

/**
 * GitHub
 */
const github = document.querySelector(".github > a");
if (rank >= 1 && rank <= 5000) {
  github.href = `https://github.com/jacbz/anki_french/blob/main/cards/${rank
    .toString()
    .padStart(4, "0")}_${word}.yml`;
} else {
  github.remove();
}

/**
 * Update notice
 */
const lastUpdated = new Date(___VERSION___);
const numberOfDaysSince = Math.floor(
  (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
);
if (numberOfDaysSince >= 180) {
  document.getElementById("update-notice-days").textContent = numberOfDaysSince;
  document.getElementById("update-notice").style.display = "block";
}

/**
 * Helper functions
 */
___COMMONJS___;

function getAnkiPrefix() {
  return globalThis.ankiPlatform === "desktop"
    ? ""
    : globalThis.AnkiDroidJS
    ? "https://appassets.androidplatform.net"
    : ".";
}

// Dirty hack to get visible text including pseudo-elements
// Code should be refactored at some point to avoid needing this
function getVisibleText(htmlElement) {
  const isVisible = (element) => {
    const style = window.getComputedStyle(element);
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0"
    );
  };
  const getPseudoElementContent = (element, pseudo) => {
    const style = window.getComputedStyle(element, pseudo);
    const content = style.content.replace(/^["']|["']$/g, "");
    return content !== "none" ? content : "";
  };
  let visibleText = "";
  const processNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (isVisible(node.parentElement)) {
        const text = node.textContent.trim();
        if (text.length > 0) {
          if (node.parentElement.tagName !== "TD") {
            visibleText = visibleText.trim();
          }
          visibleText += text + " ";
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (isVisible(node)) {
        const beforeContent = getPseudoElementContent(node, ":before");
        if (beforeContent) visibleText = visibleText.trim() + beforeContent;
        for (const childNode of node.childNodes) {
          processNode(childNode);
        }
        const afterContent = getPseudoElementContent(node, ":after");
        if (afterContent) visibleText = visibleText.trim() + afterContent;
      }
    }
  };
  processNode(htmlElement);
  return visibleText.trim();
}
