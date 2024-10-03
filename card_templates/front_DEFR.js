formatDefinition();

const sentencesInner = document.getElementById("sentences_inner");
const sentencesData = sentencesInner.innerHTML;
const sentencesPairs = sentencesData.split("\n\n");
shuffleArray(sentencesPairs);
const de = beautifyText(sentencesPairs[0].split("\n")[1], false);
sentencesInner.innerHTML = `<div class="de">${de}</div>`;

(async () => {
  if (options.autoPlaySentence) {
    playAudio(de, "de-DE");
  }
})();