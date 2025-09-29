___CONFIG___;

const wordWithArticle = document.querySelector(".word");
const word = wordWithArticle.dataset.word;
const rank = parseInt(document.querySelector(".rank").dataset.content);

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
    <svg width="800px" height="800px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <path d="m 7 1.007812 c -0.296875 -0.003906 -0.578125 0.125 -0.769531 0.351563 l -3.230469 3.640625 h -1 c -1.09375 0 -2 0.84375 -2 2 v 2 c 0 1.089844 0.910156 2 2 2 h 1 l 3.230469 3.640625 c 0.210937 0.253906 0.492187 0.363281 0.769531 0.359375 z m 6.460938 0.960938 c -0.191407 -0.003906 -0.386719 0.054688 -0.558594 0.167969 c -0.457032 0.3125 -0.578125 0.933593 -0.269532 1.390625 c 1.824219 2.707031 1.824219 6.238281 0 8.945312 c -0.308593 0.457032 -0.1875 1.078125 0.269532 1.390625 c 0.457031 0.308594 1.078125 0.1875 1.390625 -0.269531 c 1.136719 -1.691406 1.707031 -3.640625 1.707031 -5.59375 s -0.570312 -3.902344 -1.707031 -5.59375 c -0.195313 -0.285156 -0.511719 -0.4375 -0.832031 -0.4375 z m -3.421876 2.019531 c -0.222656 -0.007812 -0.453124 0.058594 -0.644531 0.203125 c -0.261719 0.199219 -0.394531 0.5 -0.394531 0.804688 v 0.058594 c 0.011719 0.191406 0.074219 0.375 0.199219 0.535156 c 1.074219 1.429687 1.074219 3.390625 0 4.816406 c -0.125 0.164062 -0.1875 0.347656 -0.199219 0.535156 v 0.0625 c 0 0.304688 0.132812 0.605469 0.394531 0.804688 c 0.441407 0.332031 1.066407 0.242187 1.398438 -0.199219 c 0.804687 -1.066406 1.207031 -2.335937 1.207031 -3.609375 s -0.402344 -2.542969 -1.207031 -3.613281 c -0.183594 -0.246094 -0.464844 -0.382813 -0.753907 -0.398438 z m 0 0"/>
    </svg>
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
  formatSentences(document.querySelector("#sentences"));
}

function formatSentences(within = document) {
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
formatSentences();

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
    const normalize = (s) => (s ? s.normalize() : s);
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
  formatSentences(grammarElement);
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
                <svg version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 122.88 88.15" style="enable-background:new 0 0 122.88 88.15" xml:space="preserve"><g><path d="M0,33.54l37.45,37.02H0.27v17.59h118.09V70.56H57.24l52.56-48.14v18.73c0,3.62,2.92,6.54,6.54,6.54s6.54-2.92,6.54-6.54 V6.52h-0.02c0-1.69-0.65-3.37-1.94-4.65c-1.37-1.35-3.2-1.97-4.99-1.86H83.54C79.92,0.01,77,2.94,77,6.55s2.92,6.54,6.54,6.54 h17.13L47.05,61.79L0.25,15.77L0,33.54L0,33.54z"/></g></svg>
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
  grammarLibrary.classList.remove("collapsed");

  if (!isRendered) {
    isRendered = true;
    renderGrammaryLibrary();
  }
}

if (grammar) {
  showHideGrammarLibraryButton.onclick = function () {
    showGrammarLibrary();
  };
  closeLibraryButton.onclick = function () {
    grammarLibrary.classList.add("collapsed");
  };
} else {
  grammarLibrary.remove();
}

function renderGrammaryLibrary() {
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

  // Store sections that were previously hidden but are becoming visible
  const sectionsBecomingVisible = [];

  grammarLibrary.querySelectorAll(".section").forEach((section) => {
    const wasHidden = section.style.display === "none";
    const titleElement = section.querySelector(".section-title[data-topic]");
    let shouldShow = true;

    // CEFR level filtering
    if (titleElement) {
      const sectionTopic = titleElement.dataset.topic;
      const topicLevels = sectionTopic.split("/").map((level) => level.trim());

      shouldShow =
        // if every level is selected, show all
        selectedLevels.length === cefrLevels.length ||
        // if no level is selected, show only sections without level
        (selectedLevels.length === 0 &&
          topicLevels.every((level) => !cefrLevels.includes(level))) ||
        // if there is a filter, show only matching levels
        topicLevels.some((level) => selectedLevels.includes(level));
    } else {
      // sections without data-topic should always be shown by CEFR filter
      shouldShow = true;
    }

    // Search filtering
    if (shouldShow && searchTerm) {
      const sectionTitle = section.querySelector(".section-title");
      if (sectionTitle) {
        const titleText = sectionTitle.textContent.toLowerCase();
        const normalizedTitleText = normalizeText(titleText);
        shouldShow = normalizedTitleText.includes(normalizedSearchTerm);
      } else {
        shouldShow = false;
      }
    }

    // Track sections becoming visible that might need expansion state reset
    if (wasHidden && shouldShow) {
      sectionsBecomingVisible.push(section);
    }

    section.style.display = shouldShow ? "" : "none";
  });

  grammarLibrary
    .querySelectorAll("#grammar-sections > .section")
    .forEach((section) => {
      const wasHidden = section.style.display === "none";
      // if all children are hidden, hide the parent section as well
      const visibleChildren = Array.from(
        section.querySelectorAll(".section")
      ).filter((child) => child.style.display !== "none");
      const shouldShowParent = visibleChildren.length > 0;

      // Track parent sections becoming visible
      if (wasHidden && shouldShowParent) {
        sectionsBecomingVisible.push(section);
      }

      section.style.display = shouldShowParent ? "" : "none";
    });

  // Fix expansion state for sections that were hidden and are now becoming visible
  sectionsBecomingVisible.forEach((section) => {
    const content = section.querySelector(".section-content");
    if (content && section.classList.contains("expanded")) {
      // Section is marked as expanded but might have corrupted maxHeight due to being hidden
      // Reset the maxHeight to ensure proper display
      content.style.maxHeight = content.scrollHeight + "px";

      // Also fix any nested ancestor maxHeights
      let ancestor = section.parentElement;
      while (ancestor) {
        if (ancestor.classList.contains("section-content")) {
          ancestor.style.maxHeight = "unset";
        }
        ancestor = ancestor.parentElement;
      }
    }
  });

  if (expandSections) {
    grammarLibrary
      .querySelectorAll("#grammar-sections > .section:not(.expanded)")
      .forEach((section) => {
        toggleSection(section);
      });
  }

  // Show/hide "no results" message
  const noResultsElement = document.getElementById("grammar-no-results");
  const visibleSectionsCount = Array.from(
    grammarLibrary.querySelectorAll("#grammar-sections > .section")
  ).filter((section) => section.style.display !== "none").length;

  if (noResultsElement) {
    if (searchTerm && visibleSectionsCount === 0) {
      noResultsElement.style.display = "block";
    } else {
      noResultsElement.style.display = "none";
    }
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

function toggleSection(section, forceExpand = false) {
  const content = section.querySelector(".section-content");
  if (!content) {
    console.error("Section has no content to expand:", section);
    return;
  }

  const isCollapsing = section.classList.contains("expanded") && !forceExpand;

  const performToggleAnimation = () => {
    section.classList.toggle(
      "expanded",
      forceExpand || !section.classList.contains("expanded")
    );

    if (content.style.maxHeight && !forceExpand) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";

      let ancestor = section.parentElement;
      while (ancestor) {
        if (ancestor.classList.contains("section-content")) {
          ancestor.style.maxHeight = "unset";
        }
        ancestor = ancestor.parentElement;
      }
    }
  };

  if (isCollapsing) {
    const title = section.querySelector(".section-title");
    if (title) {
      const titleRect = title.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      const isStickyActive = sectionRect.top < titleRect.top - 1;

      if (isStickyActive) {
        // Perform the scroll immediately to prevent visual jump.
        const sectionAbsoluteTop = window.scrollY + sectionRect.top;
        const targetScrollY = sectionAbsoluteTop - titleRect.top;
        const newScrollPosition = Math.max(0, targetScrollY);
        window.scrollTo(0, newScrollPosition);

        // Defer the animation logic to the next event loop tick.
        // This prevents the mobile browser from cancelling it.
        setTimeout(performToggleAnimation, 0);
        return; // Exit early as the deferred function will handle the rest.
      }
    }
  }

  // For all other cases (expanding, or collapsing a non-sticky section),
  // run the animation logic immediately.
  performToggleAnimation();
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
            toggleSection(section, true);
          }
        }

        window.scrollTo({
          top: section.getBoundingClientRect().top + window.scrollY - 100,
          behavior: "smooth",
        });
      }
      e.preventDefault();
    };
  });
}

___DICT___;

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
