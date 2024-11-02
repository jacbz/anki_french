formatDefinition();

const sentencesInner = document.getElementById("sentences-inner");
const sentencesData = sentencesInner.innerHTML;
const sentencesPairs = sentencesData.split("\n\n");
shuffleArray(sentencesPairs);

let sentenceIndex = 0;

sentencesInner.ondblclick = () => {
  sentenceIndex = (sentenceIndex + 1) % sentencesPairs.length;
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
}

render();