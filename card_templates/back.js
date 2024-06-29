___CONFIG___;

/**
 * Feminine form
 */
var wordWithArticle = document.querySelector(".word");
var word = wordWithArticle.dataset.word;
var feminine = wordWithArticle.dataset.feminine;

function longestCommonPrefix(a, b) {
  var i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return a.slice(0, i);
}

if (feminine) {
  wordWithArticle.innerHTML = wordWithArticle.textContent.replace(
    word,
    `<span class="word_span">${word}<span class="feminine">${feminine}</span></span>`
  );
  if (word !== feminine.slice(0, word.length)) {
    var stem = longestCommonPrefix(word, feminine);
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
var pos = document.querySelector(".pos");
if (pos) {
  pos.onclick = function () {
    if (!pos.classList.contains("expanded")) {
      pos.classList.add("expanded");
      var posMap = [
        ["nadj", "Substantiv/Adjektiv", ""],
        ["adj", "Adjektiv", ""],
        ["adv", "Adverb", ""],
        ["conj", "Konjunktion", ""],
        ["det", "Determinativ", ""],
        ["intj", "Interjektion", ""],
        ["prep", "Präposition", ""],
        ["pro", "Pronomen", ""],
        ["n", "Substantiv", ""],
        ["v", "Verb", ""],
        ["(f)", "ohne eigenständiges Femininum", "suffix"],
        ["(pl)", "ohne eigenständige Pluralform", "suffix"],
        ["pl", "nur mit Plural", "suffix"],
        ["f", "feminines", "prefix"],
        ["m", "maskulines", "prefix"],
        ["i", "unveränderliches", "prefix"],
      ];
      var allPosArray = [];
      pos.innerHTML.split(", ").forEach(function (component) {
        var posArray = [];
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
var sentencesInner = document.getElementById("sentences_inner");
var sentencesData = sentencesInner.innerHTML;
var sentencesPairs = sentencesData.split("\n\n");
shuffleArray(sentencesPairs, false);

var currentSentence = 0;
var sentenceCounter = document.getElementById("sentence_counter");

var audioButton = function (text) {
  return `<div class="button svg-button small play-sentence" data-text="${encodeURIComponent(
    text
  )}">
    <svg width="800px" height="800px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <path d="m 7 1.007812 c -0.296875 -0.003906 -0.578125 0.125 -0.769531 0.351563 l -3.230469 3.640625 h -1 c -1.09375 0 -2 0.84375 -2 2 v 2 c 0 1.089844 0.910156 2 2 2 h 1 l 3.230469 3.640625 c 0.210937 0.253906 0.492187 0.363281 0.769531 0.359375 z m 6.460938 0.960938 c -0.191407 -0.003906 -0.386719 0.054688 -0.558594 0.167969 c -0.457032 0.3125 -0.578125 0.933593 -0.269532 1.390625 c 1.824219 2.707031 1.824219 6.238281 0 8.945312 c -0.308593 0.457032 -0.1875 1.078125 0.269532 1.390625 c 0.457031 0.308594 1.078125 0.1875 1.390625 -0.269531 c 1.136719 -1.691406 1.707031 -3.640625 1.707031 -5.59375 s -0.570312 -3.902344 -1.707031 -5.59375 c -0.195313 -0.285156 -0.511719 -0.4375 -0.832031 -0.4375 z m -3.421876 2.019531 c -0.222656 -0.007812 -0.453124 0.058594 -0.644531 0.203125 c -0.261719 0.199219 -0.394531 0.5 -0.394531 0.804688 v 0.058594 c 0.011719 0.191406 0.074219 0.375 0.199219 0.535156 c 1.074219 1.429687 1.074219 3.390625 0 4.816406 c -0.125 0.164062 -0.1875 0.347656 -0.199219 0.535156 v 0.0625 c 0 0.304688 0.132812 0.605469 0.394531 0.804688 c 0.441407 0.332031 1.066407 0.242187 1.398438 -0.199219 c 0.804687 -1.066406 1.207031 -2.335937 1.207031 -3.609375 s -0.402344 -2.542969 -1.207031 -3.613281 c -0.183594 -0.246094 -0.464844 -0.382813 -0.753907 -0.398438 z m 0 0"/>
    </svg>
  </div>`;
};

var refreshSentences = function () {
  var fr = sentencesPairs[currentSentence].split("\n")[0];
  var de = sentencesPairs[currentSentence].split("\n")[1];
  sentencesInner.innerHTML = frenchFirst
    ? `<div class="fr">${fr}</div><span class="de spoiler">${de}</span>`
    : `<div class="de">${de}</div><span class="fr spoiler">${fr}</span>`;
  sentenceCounter.textContent = `${currentSentence + 1}/${
    sentencesPairs.length
  }`;

  document
    .querySelectorAll(".fr:not(:has(.sentence-with-audio))")
    .forEach(function (el) {
      var text = beautifyText(el.innerHTML, true);
      var containsPunctuation = text.match(/[.!?]/);
      el.innerHTML = text;
      if (containsPunctuation) {
        var textContent = el.textContent;
        el.innerHTML = `<span class="sentence-with-audio">${audioButton(
          textContent
        )}<span>${text}</span></span>`;
        if (el.classList.contains("spoiler")) {
          el.classList.remove("spoiler");
          el.querySelector(".sentence-with-audio > span").classList.add(
            "spoiler"
          );
        }
      }
    });

  document.querySelectorAll(".de").forEach(function (el) {
    el.innerHTML = beautifyText(el.innerHTML, false);
  });

  document.querySelectorAll(".spoiler").forEach(function (el) {
    el.onclick = function () {
      this.classList.toggle("clicked");
    };
  });

  initAudioButtons();
};

function initAudioButtons() {
  document.querySelectorAll(".play-sentence").forEach(function (el) {
    el.onclick = function (event) {
      event.stopPropagation();
      var text = this.dataset.text;
      var url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${text}&tl=fr-FR&client=tw-ob`;

      var audioCurrent = document.querySelector("audio");
      audioCurrent.src = url;
      audioCurrent.play();
    };
  });
}

refreshSentences();
var nextSentenceButton = document.getElementById("next_sentence");
nextSentenceButton.addEventListener("click", nextSentenceHandler);
sentencesInner.addEventListener("dblclick", nextSentenceHandler);

function nextSentenceHandler() {
  currentSentence = (currentSentence + 1) % sentencesPairs.length;
  refreshSentences();
}

/**
 * Conjugations
 */
var conjugationTable = document.getElementById("conjugation-table");
if (conjugationTable) {
  var showRegularConjugations = false;
  var showHideButton = document.getElementById("show-hide-button");
  var label = document.getElementById("show-hide-label");
  var verbClassification = document.getElementById("verb-classification");

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
    }
  }

  showHideButton.addEventListener("click", toggleConjugations);

  if (verbClassification) {
    verbClassification.addEventListener("dblclick", toggleConjugations);
  }

  function squish_cells() {
    document
      .querySelectorAll(":is(.tense,.regular,.irregular) > div")
      .forEach(function (el) {
        el.classList.add("squished");
        var scaleRatio = el.offsetWidth / el.scrollWidth;
        if (scaleRatio < 1) {
          el.style.transform = `scaleX(${scaleRatio})`;
        }
      });
  }
  squish_cells();

  // load conjugation grammar
  fetch(`${getAnkiPrefix()}/_FR5000_tenses.html`)
    .then((response) => response.text())
    .then((html) => {
      var conjugationGrammar = document.getElementById("conjugation-grammar");
      conjugationGrammar.innerHTML = html;
      conjugationGrammar.dataset.aux = aux;
      conjugationGrammar.dataset.onlyThirdPerson = isOnlyThirdPerson;
      conjugationGrammar.dataset.reflexive = isReflexive;
      enableSectionToggle();
      refreshSentences();

      // fill in conjugation table
      document.querySelectorAll("#conjugation-table tr").forEach(function (el) {
        const tenseValues = [...el.querySelectorAll("td[data-full]")].map(
          (td) => td.dataset.full
        );
        var tense = el.dataset.tense;
        fillInConjugationTable(tenseValues, tense);
      });
      fillInConjugationTable([word], "INFINITIVE");
      formatConjugationTables(conjugationGrammar);
    });

  function fillInConjugationTable(tenseValues, tense) {
    if (tenseValues.length > 0) {
      document
        .querySelectorAll(`.section *[data-tense="${tense}"]`)
        .forEach(function (tenseElement, index) {
          if (tenseValues[index] !== "") {
            var tenseValue =
              tenseValues[Math.min(index, tenseValues.length - 1)];
            tenseElement.textContent += tenseValue;

            if (tenseValue.match(/^[aeiouàâäéèêëîïôöùûüh]/) && !isHAspire) {
              tenseElement.parentElement.classList.add("elision");
            }
          }
        });
    }
  }

  function formatConjugationTables(conjugationGrammar) {
    document
      .querySelectorAll(".section-conjugation-table")
      .forEach(function (el) {
        var audioSentence = [...el.querySelectorAll("tr")]
          .map((tr) => getVisibleText(tr))
          .filter((text) => text.length > 0)
          .join(", ")
          .replaceAll("’ ", "’");

        if (
          el.parentElement.classList.contains(
            "section-conjugation-table-wrapper"
          )
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
          var reflexiveButton = wrapper.querySelector(".reflexive-button");
          if (isReflexive) {
            reflexiveButton.style.display = "none";
          }
          reflexiveButton.onclick = () => {
            isReflexive = !isReflexive;
            conjugationGrammar.dataset.reflexive = isReflexive;
            conjugationGrammar.dataset.aux = isReflexive ? "etre" : aux;
            formatConjugationTables(conjugationGrammar);
          };
        }
      });
    initAudioButtons();
  }

  var conjugationTable = document.getElementById("conjugation-table");
  var aux = conjugationTable.dataset.aux;
  var isHAspire = conjugationTable.dataset.hAspire === "true";
  var isOnlyThirdPerson = conjugationTable.dataset.onlyThirdPerson === "true";
  var isReflexive = conjugationTable.dataset.reflexive === "true";
  document.querySelectorAll("#conjugation-table tr").forEach(function (el) {
    var tense = el.dataset.tense;
    el.onclick = function () {
      var displayedElements = [];
      document.getElementById("conjugation-grammar").style.display = "block";
      document
        .querySelectorAll("#conjugation-grammar .section-title")
        .forEach(function (section) {
          var showForTenses = section.dataset.tenses.split(",");
          if (showForTenses.includes(tense)) {
            displayedElements.push(section);
            section.style.display = "block";
          } else {
            section.style.display = "none";
            section.classList.remove("expanded");
            section.nextElementSibling.classList.remove("expanded");
            section.nextElementSibling.style.maxHeight = null;
          }
        });
      if (displayedElements.length === 1) {
        displayedElements[0].click();
      }
      if (displayedElements.length > 0) {
        window.scrollTo({
          top:
            conjugationTable.getBoundingClientRect().top + window.pageYOffset,
          behavior: "smooth",
        });
      }
    };
  });
}

/**
 * Collapsible sections
 */
function enableSectionToggle() {
  document.querySelectorAll(".box .section-title").forEach(function (el) {
    el.onclick = function () {
      this.classList.toggle("expanded");
      var content = this.nextElementSibling;
      content.classList.toggle("expanded");
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    };
  });
}
enableSectionToggle();

/**
 * GitHub
 */
var github = document.querySelector("#github > a");
var rank = document.querySelector(".rank").dataset.content;
if (rank >= "1" && rank <= "5000") {
  github.href = `https://github.com/jacbz/anki_french/blob/main/cards/${rank.padStart(
    4,
    "0"
  )}_${word}.yml`;
} else {
  github.remove();
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
  var isVisible = (element) => {
    var style = window.getComputedStyle(element);
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0"
    );
  };
  var getPseudoElementContent = (element, pseudo) => {
    var style = window.getComputedStyle(element, pseudo);
    var content = style.content.replace(/^["']|["']$/g, "");
    return content !== "none" ? content : "";
  };
  var visibleText = "";
  var processNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (isVisible(node.parentElement)) {
        var text = node.textContent.trim();
        if (text.length > 0) {
          visibleText += text + " ";
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (isVisible(node)) {
        var beforeContent = getPseudoElementContent(node, ":before");
        if (beforeContent) visibleText = visibleText.trim() + beforeContent;
        for (var childNode of node.childNodes) {
          processNode(childNode);
        }
        var afterContent = getPseudoElementContent(node, ":after");
        if (afterContent) visibleText = visibleText.trim() + afterContent;
      }
    }
  };
  processNode(htmlElement);
  return visibleText.trim();
}
