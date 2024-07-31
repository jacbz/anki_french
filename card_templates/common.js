function formatDefinition() {
  document.querySelectorAll(".definition").forEach(function (def) {
    let text = def.innerHTML;

    if (text.includes(",") || text.includes(";")) {
      text = text.replaceAll(
        /([^,;]+)/g,
        (match) => `<span class="no-break">${match}</span>`
      );
      text = text.replaceAll('<span class="no-break"> ', ' <span class="no-break">');
      text = text.replaceAll('</span>, <span class="no-break">', ',</span> <span class="no-break">')
      text = text.replaceAll('</span>; <span class="no-break">', ';</span> <span class="no-break">')
    }

    text = text.replaceAll(/\(-?(.*?)-?\)/g, '<span class="pre-suffix">$1</span>');
    text = text.replaceAll(/\[(.*?)\]/g, '<span class="grammar">$&</span>');

    def.innerHTML = text;
  });
}

function beautifyText(text, isFrench) {
  if (text.length === 0) {
    return text;
  }
  text = text.replaceAll(/([^<>\s])'/g, "$1’"); // convert apostrophes
  text = text.replaceAll("...", "…"); // convert ellipsis
  if (isFrench) {
    text = text.replaceAll(/[\u0020\u00A0\u202F]+|&nbsp;/g, " "); // replace with regular space
    text = text.replaceAll("« ", "«").replaceAll(" »", "»");
    text = text.replaceAll("«", '"').replaceAll("»", '"');
    // insert thin non-breaking space before punctuation (but not inside HTML tags)
    text = text.replaceAll(/(?!.*<[^>]+>)(\s?)([?|:|!|;])/g, "\u202F$2");
    // Replace with French quote marks « ... »
    text = text.replaceAll(/(?!.*<[^>]+>)"([^"]*)"/g, "«\u202F$1\u202F»");

    if (text[0] === "-") {
      text = text.replaceAll("-", "–");
    }
    text = text.replaceAll("<br>-", "<br>–");
  } else {
    // format dialogue
    if (text.includes("<br>-") || text.includes("<br>–")) {
      const lines = text.split("<br>");
      const formattedLines = [];
      for (let line of lines) {
        line = line.trim();
        if (line.startsWith("–") || line.startsWith("-")) {
          line = line.replaceAll(/^(–|-)\s*/g, "");
        }
        formattedLines.push(`„${line}“`);
      }
      text = formattedLines.join("<br>");
    }
    // replace with German quote marks „...“
    text = text.replaceAll("„", '"').replaceAll("“", '"');
    text = text.replaceAll(/(?!.*<[^>]* [^>]*>)"([^"]*)"/g, "„$1“");
  }
  return text;
}

function shuffleArray(arr, persist = true) {
  let seed = Math.random();
  if (persist) {
    Persistence.setItem(seed);
  } else {
    seed = Persistence.getItem();
    Persistence.clear();
  }
  let currentSeed = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    currentSeed = (currentSeed * 16807) % 2147483647;
    const j = Math.floor((currentSeed / 2147483647) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
