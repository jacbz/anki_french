const sentencesInner = document.getElementById("sentences-inner");
const sentencesData = sentencesInner.innerHTML;
const sentencesPairs = sentencesData.split("\n\n");
shuffleArray(sentencesPairs);
const sentencePair = sentencesPairs[0].split("\n");
const fr = processText(sentencePair[0], true);
const de = processText(sentencePair[1], false, false);
sentencesInner.innerHTML = `<div class="fr">${fr}</div>`;

(async () => {
  if (options.autoPlaySentence) {
    playAudio(fr);
  }
})();

___CLOZE_GAME___;

const gameContainer = document.getElementById("cloze-game");
initClozeGame(de, gameContainer, true);