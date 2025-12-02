formatDefinition();

const sentencesInner = document.getElementById("sentences-inner");
const sentencesData = sentencesInner.innerHTML;
const sentencesPairs = sentencesData.split("\n\n");
shuffleArray(sentencesPairs);

let sentenceIndex = 0;
Persistence.setItem("sentenceIndex", sentenceIndex);

sentencesInner.ondblclick = () => {
  sentenceIndex = (sentenceIndex + 1) % sentencesPairs.length;
  Persistence.setItem("sentenceIndex", sentenceIndex);
  render();
}

function render() {
  const sentencePair = sentencesPairs[sentenceIndex].split("\n");
  const de = processText(sentencePair[1], false);
  const fr = processText(sentencePair[0], true, false);
  sentencesInner.innerHTML = `<div class="de">${de}</div>`;
  
  (async () => {
    if (options.autoPlaySentence) {
      playAudio({text: de, lang: "de-DE"});
    }
  })();
  
  const gameContainer = document.getElementById("cloze-game");
  gameContainer.innerHTML = "";
  gameContainer.className = "";
  initClozeGame({sentence: fr, gameContainer});

  // if sentence contains a marking, move the definition down and make it small
  const definition = document.querySelector(".definition");
  if (de.includes("word-highlight")) {
    definition.classList.add("small");
    definition.parentNode.appendChild(definition);
    definition.innerHTML = definition.innerHTML.replaceAll("<br>", "; ");
  }
}

render();