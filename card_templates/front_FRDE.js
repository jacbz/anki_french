var sentencesInner = document.getElementById("sentences_inner");
var sentencesData = sentencesInner.innerHTML;
var sentencesPairs = sentencesData.split("\n\n");
shuffleArray(sentencesPairs);
var fr = beautifyText(sentencesPairs[0].split("\n")[0], true);
sentencesInner.innerHTML = `<div class="fr">${fr}</div>`;
