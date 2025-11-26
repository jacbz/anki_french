function formatDefinition() {
  document.querySelectorAll(".definition").forEach(function (def) {
    let text = def.innerHTML;

    if (text.includes(",") || text.includes(";")) {
      text = text.replaceAll(
        /([^,;\[\] ][^,;\[\]]+[^,;\[\] ])/g,
        (match) => `<span class="no-break">${match}</span>`
      );
      text = text.replaceAll(
        '<span class="no-break"> ',
        ' <span class="no-break">'
      );
      text = text.replaceAll(
        '</span>, <span class="no-break">',
        ',</span> <span class="no-break">'
      );
      text = text.replaceAll(
        '</span>; <span class="no-break">',
        ';</span> <span class="no-break">'
      );
    }

    text = text.replaceAll(
      /\(-?(.*?)-?\)/g,
      '<span class="pre-suffix">$1</span>'
    );
    text = text.replaceAll(/\[(.*?)\]/g, '<span class="grammar">$&</span>');

    def.innerHTML = text;
  });
}

function processText(text, isFrench, processStars = true) {
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
    // Replace " with French quote marks « ... », except inside HTML tags
    text = text.replaceAll(/"(?![^<]*>)(.*?)"(?![^<]*>)/g, "«\u202F$1\u202F»");

    // replace hyphen or en-dash at beginning of text with em-dash
    if (text.startsWith("-") || text.startsWith("–")) {
      text = "—" + text.slice(1);
    }

    // format dialogue
    if (text.includes("<br>-") || text.includes("<br>–")) {
      const lines = text.split("<br>");
      const formattedLines = [];
      for (let line of lines) {
        line = line.trim();
        line = line.replaceAll(/^(–|-|—)\s*/g, "— ");
        line = line
          .replaceAll('"', "")
          .replaceAll("«\u202F", "")
          .replaceAll("\u202F»", "");
        formattedLines.push(line);
      }
      text = formattedLines.join("<br>");
    }
  } else {
    // format dialogue
    if (text.includes("<br>-") || text.includes("<br>–")) {
      const lines = text.split("<br>");
      const formattedLines = [];
      for (let line of lines) {
        line = line.trim();
        line = line.replaceAll(/^(–|-|—)\s*/g, "");
        if (!line.startsWith('"')) {
          line = `"${line}`;
        }
        if (!line.endsWith('"')) {
          line = `${line}"`;
        }
        formattedLines.push(line);
      }
      text = formattedLines.join("<br>");
    }
    // replace with German quote marks »...«
    text = text.replaceAll("„", '"').replaceAll("“", '"');
    text = text.replaceAll(/"(?![^<]*>)(.+?)"(?![^<]*>)/g, "»\u2060$1\u2060«");
  }

  // replace *...* with word-highlight span
  if (processStars) {
    text = text.replaceAll(
      /\*(.*?)\*/g,
      '\u2060<span class="word-highlight">$1</span>\u2060'
    );
  }
  return text;
}

function shuffleArray(arr, persist = true) {
  let seed = Math.random();
  if (persist) {
    Persistence.setItem("seed", seed);
  } else {
    seed = Persistence.getItem("seed");
    Persistence.removeItem("seed");
  }
  let currentSeed = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    currentSeed = (currentSeed * 16807) % 2147483647;
    const j = Math.floor((currentSeed / 2147483647) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function fetchAudio({
  text,
  customFileName = undefined,
  lang = "fr-FR",
}) {
  const url = customFileName
    ? getAnkiPrefix() + "/" + customFileName
    : await getTTSUrl(text, false, lang);

  const audioCurrent = document.querySelector("audio");
  audioCurrent.src = url;
}

async function playAudio({ text, customFileName = undefined, lang = "fr-FR" }) {
  await fetchAudio({ text, customFileName, lang });
  const audioCurrent = document.querySelector("audio");

  try {
    await audioCurrent.play();
  } catch {
    audioCurrent.src = await getTTSUrl(text, true, lang);
    audioCurrent.play();
  }
}

function preprocessTextToRead(sentence) {
  return sentence
    .replaceAll(/(&nbsp;|<([^>]+)>)/ig, "") // remove HTML tags
    .replaceAll("*", "")
    .replaceAll("‿", " ")
    .replaceAll("/", ",")
    .replaceAll("→", ";")
    .replaceAll("’", "'")
    .replaceAll(/[\u0000-\u001F\u007F-\u009F\u200B\u2060\uFEFF\u202f]/g, "")
    .trim();
}

const memoizedTTSUrls = {};

const voices = [
  "Zephyr",
  "Puck",
  "Charon",
  "Kore",
  "Fenrir",
  "Leda",
  "Orus",
  "Aoede",
  "Callirhoe",
  "Autonoe",
  "Enceladus",
  "Iapetus",
  "Umbriel",
  "Algieba",
  "Despina",
  "Erinome",
  "Algenib",
  "Rasalgethi",
  "Laomedeia",
  "Achernar",
  "Alnilam",
  "Schedar",
  "Gacrux",
  "Pulcherrima",
  "Achird",
  "Zubenelgenubi",
  "Vindemiatrix",
  "Sadachbia",
  "Sadaltager",
  "Sulafar",
];

async function getTTSUrl(
  encodedText,
  forceGoogleTranslate = false,
  lang = "fr-FR"
) {
  const textInput = preprocessTextToRead(decodeURIComponent(encodedText));

  // if no API key is set, fallback to use the free Google Translate TTS
  if (!options.googleTTSApiKey || forceGoogleTranslate) {
    return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      textInput
    )}&tl=${lang}&client=tw-ob`;
  }

  if (memoizedTTSUrls && memoizedTTSUrls[textInput]) {
    return memoizedTTSUrls[textInput];
  }

  console.log(textInput);

  try {
    let voice = {
      languageCode: "fr-FR",
      name:
        "fr-FR-Chirp3-HD-" + voices[Math.floor(Math.random() * voices.length)],
    };
    if (lang === "de-DE") {
      voice = {
        languageCode: "de-DE",
        name:
          "de-DE-Chirp3-HD-" +
          voices[Math.floor(Math.random() * voices.length)],
      };
    }

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${options.googleTTSApiKey}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audioConfig: { audioEncoding: "LINEAR16" },
          input: { text: textInput },
          voice,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    const data = await response.json();
    const audioContent = data.audioContent;

    if (audioContent) {
      const audioBlob = b64ToBlob(audioContent, "audio/mp3");
      const audioUrl = URL.createObjectURL(audioBlob);
      if (memoizedTTSUrls) {
        memoizedTTSUrls[textInput] = audioUrl;
      }
      return audioUrl;
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

function b64ToBlob(b64Data, contentType, sliceSize = 512) {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, { type: contentType });
}

___CLOZE_GAME___;
