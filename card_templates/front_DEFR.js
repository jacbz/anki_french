formatDefinition();

var sentencesInner = document.getElementById("sentences_inner");
var sentencesData = sentencesInner.innerHTML;
var sentencesPairs = sentencesData.split("\n\n");
shuffleArray(sentencesPairs);
var de = beautifyText(sentencesPairs[0].split("\n")[1], false);
sentencesInner.innerHTML = `<div class="de">${de}</div>`;
