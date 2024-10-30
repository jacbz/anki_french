formatDefinition();

const sentencesInner = document.getElementById("sentences-inner");
const sentencesData = sentencesInner.innerHTML;
const sentencesPairs = sentencesData.split("\n\n");
shuffleArray(sentencesPairs);
const sentencePair = sentencesPairs[0].split("\n");
const de = processText(sentencePair[1], false);
const fr = processText(sentencePair[0], true, false);
sentencesInner.innerHTML = `<div class="de">${de}</div>`;

(async () => {
  if (options.autoPlaySentence) {
    playAudio(de, undefined, "de-DE");
  }
})();

___CLOZE_GAME___;

const gameContainer = document.getElementById("cloze-game");
initClozeGame(fr, gameContainer);