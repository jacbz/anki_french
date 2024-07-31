___CONFIG___;

const googleTTSApiKey = "___GOOGLE_TTS_API_KEY___";

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

if (feminine) {
  wordWithArticle.innerHTML = wordWithArticle.textContent.replace(
    word,
    `<span class="word_span">${word}<span class="feminine">${feminine}</span></span>`
  );
  if (word !== feminine.slice(0, word.length)) {
    const stem = longestCommonPrefix(word, feminine);
    document.querySelector(
      ".feminine"
    ).innerHTML = `<span class="stem" data-before="${stem}" data-after="${feminine.slice(
      stem.length
    )}">${stem.length > 0 ? stem : "​"}</span>`;
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
        ["nadj", "Substantiv/Adjektiv", ""],
        ["adj", "Adjektiv", ""],
        ["adv", "Adverb", ""],
        ["conj", "Konjunktion", ""],
        ["det", "Determinativ", ""],
        ["intj", "Interjektion", ""],
        ["prep", "Präposition", ""],
        ["pro", "Pronomen", ""],
        ["n", "Substantiv", ""],
        ["(f)", "ohne eigenständiges Femininum", "suffix"],
        ["(pl)", "ohne eigenständige Pluralform", "suffix"],
        ["(imp)", "unpersönliches", "prefix"],
        ["pl", "nur mit Plural", "suffix"],
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
const sentencesInner = document.getElementById("sentences_inner");
const sentencesData = sentencesInner.innerHTML;
const sentencesPairs = sentencesData.split("\n\n");
shuffleArray(sentencesPairs, false);

let currentSentence = 0;
const sentenceCounter = document.getElementById("sentence_counter");

const audioButton = function (text, customFileName = "") {
  return `<div class="button svg-button small play-sentence" data-text="${encodeURIComponent(
    text
  )}" data-file-name="${customFileName}">
    <svg width="800px" height="800px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <path d="m 7 1.007812 c -0.296875 -0.003906 -0.578125 0.125 -0.769531 0.351563 l -3.230469 3.640625 h -1 c -1.09375 0 -2 0.84375 -2 2 v 2 c 0 1.089844 0.910156 2 2 2 h 1 l 3.230469 3.640625 c 0.210937 0.253906 0.492187 0.363281 0.769531 0.359375 z m 6.460938 0.960938 c -0.191407 -0.003906 -0.386719 0.054688 -0.558594 0.167969 c -0.457032 0.3125 -0.578125 0.933593 -0.269532 1.390625 c 1.824219 2.707031 1.824219 6.238281 0 8.945312 c -0.308593 0.457032 -0.1875 1.078125 0.269532 1.390625 c 0.457031 0.308594 1.078125 0.1875 1.390625 -0.269531 c 1.136719 -1.691406 1.707031 -3.640625 1.707031 -5.59375 s -0.570312 -3.902344 -1.707031 -5.59375 c -0.195313 -0.285156 -0.511719 -0.4375 -0.832031 -0.4375 z m -3.421876 2.019531 c -0.222656 -0.007812 -0.453124 0.058594 -0.644531 0.203125 c -0.261719 0.199219 -0.394531 0.5 -0.394531 0.804688 v 0.058594 c 0.011719 0.191406 0.074219 0.375 0.199219 0.535156 c 1.074219 1.429687 1.074219 3.390625 0 4.816406 c -0.125 0.164062 -0.1875 0.347656 -0.199219 0.535156 v 0.0625 c 0 0.304688 0.132812 0.605469 0.394531 0.804688 c 0.441407 0.332031 1.066407 0.242187 1.398438 -0.199219 c 0.804687 -1.066406 1.207031 -2.335937 1.207031 -3.609375 s -0.402344 -2.542969 -1.207031 -3.613281 c -0.183594 -0.246094 -0.464844 -0.382813 -0.753907 -0.398438 z m 0 0"/>
    </svg>
  </div>`;
};

function refreshExampleSentences() {
  const fr = sentencesPairs[currentSentence].split("\n")[0];
  const de = sentencesPairs[currentSentence].split("\n")[1];
  sentencesInner.innerHTML = frenchFirst
    ? `<div class="fr">${fr}</div><span class="de spoiler">${de}</span>`
    : `<div class="de">${de}</div><span class="fr spoiler">${fr}</span>`;
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

    const text = beautifyText(el.innerHTML, true);

    // show audio button if sentence ends with punctuation
    const shouldShow =
      !el.classList.contains("no-audio") &&
      (text.match(/[.!?…]/) || el.classList.contains("force-audio"));
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
    el.innerHTML = beautifyText(el.innerHTML, false);
  });

  within.querySelectorAll(".spoiler").forEach(function (el) {
    el.onclick = function () {
      this.classList.toggle("clicked");
    };
  });

  initAudioButtons(within);
}

const memoizedTTSUrls = {};
async function getTTSUrl(text, forceGoogleTranslate = false) {
  // if no API key is set, fallback to use the free Google Translate TTS
  if (!googleTTSApiKey || forceGoogleTranslate) {
    return `https://translate.google.com/translate_tts?ie=UTF-8&q=${text}&tl=fr-FR&client=tw-ob`;
  }

  if (memoizedTTSUrls[text]) {
    return memoizedTTSUrls[text];
  }

  try {
    let textInput = decodeURIComponent(text);
    let useSsml = false;
    if (textInput.includes("\n")) {
      useSsml = true;
      textInput = textInput.replaceAll("\n", "<break/>");
      textInput = `<speak>${textInput}</speak>`;
    }
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleTTSApiKey}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audioConfig: { audioEncoding: "MP3" },
          input: useSsml ? { ssml: textInput } : { text: textInput },
          voice: { languageCode: "fr-FR", name: "fr-FR-Studio-" + (Math.random() < 0.5 ? "A" : "D") },
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    const data = await response.json();
    const audioContent = data.audioContent;

    if (audioContent) {
      const audioBlob = b64ToBlob(audioContent, "audio/mp3");
      const audioUrl = URL.createObjectURL(audioBlob);
      memoizedTTSUrls[text] = audioUrl;
      return audioUrl;
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

function b64ToBlob(b64Data, contentType, sliceSize = 512) {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, { type: contentType });
}

async function initAudioButtons(within = document) {
  within.querySelectorAll(".play-sentence").forEach(function (el) {
    el.onclick = async function (event) {
      event.stopPropagation();
      const text = this.dataset.text;
      const customFileName = this.dataset.fileName;

      const url = customFileName
        ? getAnkiPrefix() + "/" + customFileName
        : await getTTSUrl(text);

      const audioCurrent = document.querySelector("audio");
      audioCurrent.src = url;

      try {
        await audioCurrent.play();
      } catch {
        audioCurrent.src = await getTTSUrl(text, true);
        audioCurrent.play();
      }
    };
  });
}

refreshExampleSentences();
formatSentences();
const nextSentenceButton = document.getElementById("next_sentence");
nextSentenceButton.onclick = nextSentenceHandler;
sentencesInner.ondblclick = nextSentenceHandler;

function nextSentenceHandler(event) {
  if (event.target.closest(".spoiler")) {
    return;
  }
  currentSentence = (currentSentence + 1) % sentencesPairs.length;
  refreshExampleSentences();
}

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

  conjugationTable.querySelectorAll("tr").forEach(function (el) {
    const tense = el.dataset.tense;
    el.onclick = function () {
      conjugationGrammar.innerHTML = "";
      for (const grammarId of grammar.tenses[tense]) {
        const grammarElement = document.createElement("grammar");
        grammarElement.dataset.id = grammarId;
        conjugationGrammar.appendChild(grammarElement);
      }
      const loadedGrammarElements = loadAllGrammar();
      if (loadedGrammarElements.length === 1) {
        expandSection(loadedGrammarElements[0]);
      }
      if (loadedGrammarElements.length > 0) {
        window.scrollTo({
          top: conjugationTable.getBoundingClientRect().top + window.scrollY,
          behavior: "smooth",
        });
      }
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
  .then((response) => response.json())
  .then((loadedGrammar) => {
    grammar = loadedGrammar;
    loadAllGrammar();
  })
  .catch((err) => {
    console.error(err);
    grammarLibrary.classList.remove("collapsed");
    grammarLibrary.innerHTML =
      "<p>Es ist ein Fehler beim Laden der Grammatik-Bibliothek aufgetreten. Bitte melde das Problem auf <a href='https://github.com/jacbz/anki_french/issues/new'>GitHub</a>.</p>";
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
  grammarElement.innerHTML = htmlString;

  into.parentElement.replaceChild(grammarElement, into);

  const content = grammarElement.querySelector(".section-content");
  if (content) {
    content.innerHTML += `<div class="github"><a href="${grammar.github[id]}">Auf GitHub bearbeiten</a></div>`;
  }
  content.querySelectorAll(".marklemma").forEach(function (el) {
    if (el.textContent !== word) {
      el.classList.remove("marklemma");
    }
  });

  enableSectionToggle(grammarElement);
  formatSentences(grammarElement);

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
      .map((tr) => getVisibleText(tr))
      .filter((text) => text.length > 0)
      .join(",\n")
      .replaceAll("’ ", "’");

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
      if (isReflexive) {
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
if (grammar) {
  showHideGrammarLibraryButton.onclick = function () {
    grammarLibrary.classList.remove("collapsed");

    if (!isRendered) {
      isRendered = true;
      renderGrammaryLibrary();
    }
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

    const categoryTitle = document.createElement("div");
    categoryTitle.className = "section-title";
    categoryTitle.textContent = category;
    categorySection.appendChild(categoryTitle);

    const categoryContent = document.createElement("div");
    categoryContent.className = "section-content";

    for (const [subcategory, id] of Object.entries(subcategories)) {
      const subcategorySection = document.createElement("div");
      subcategorySection.className = "section";

      const subcategoryTitle = document.createElement("div");
      subcategoryTitle.className = "section-title";
      subcategoryTitle.dataset.grammar = id;
      subcategoryTitle.innerHTML = subcategory;
      subcategorySection.appendChild(subcategoryTitle);

      categoryContent.appendChild(subcategorySection);
    }

    categorySection.appendChild(categoryContent);
    grammarSections.appendChild(categorySection);
  }
  enableSectionToggle();
}

/**
 * Collapsible sections
 */
function enableSectionToggle(within = document) {
  within.querySelectorAll(".section-title").forEach(function (title) {
    title.onclick = function () {
      if (title.dataset.grammar) {
        const newGrammar = loadGrammar(
          title.dataset.grammar,
          title.parentElement
        );
        expandSection(newGrammar);
        return;
      }
      expandSection(title.parentElement);
    };
  });
}
enableSectionToggle();

function expandSection(section) {
  const content = section.querySelector(".section-content");
  section.classList.toggle("expanded");

  if (content.style.maxHeight) {
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
if (numberOfDaysSince >= 90) {
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
