const sentencesInner = document.getElementById("sentences_inner");
const sentencesData = sentencesInner.innerHTML;
const sentencesPairs = sentencesData.split("\n\n");
shuffleArray(sentencesPairs);
const fr = beautifyText(sentencesPairs[0].split("\n")[0], true);
sentencesInner.innerHTML = `<div class="fr">${fr}</div>`;
