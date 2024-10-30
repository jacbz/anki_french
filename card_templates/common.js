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
    text = text.replace(/"([^"]*?)"(?=(?:[^<]*<(?!\/?[^>]+>))*[^<]*$)/g, "«\u202F$1\u202F»");

    if (text[0] === "-") {
      text[0] = "–";
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
        formattedLines.push(`"${line}"`);
      }
      text = formattedLines.join("<br>");
    }
    // replace with German quote marks »...«
    text = text.replaceAll("„", '"').replaceAll("“", '"');
    text = text.replaceAll(/"(?![^<]*>)(.*?)"(?![^<]*>)/g, "»\u2060$1\u2060«");
  }

  // replace *...* with word-highlight span
  if (processStars) {
    text = text.replaceAll(/\*(.*?)\*/g, '\u2060<span class="word-highlight">$1</span>\u2060');
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

async function playAudio(text, customFileName = undefined, lang = "fr-FR") {
  const url = customFileName
    ? getAnkiPrefix() + "/" + customFileName
    : await getTTSUrl(text, false, lang);

  const audioCurrent = document.querySelector("audio");
  audioCurrent.src = url;

  try {
    await audioCurrent.play();
  } catch {
    audioCurrent.src = await getTTSUrl(text, true, lang);
    audioCurrent.play();
  }
}

const memoizedTTSUrls = {};

async function getTTSUrl(text, forceGoogleTranslate = false, lang = "fr-FR") {
  text = text.replaceAll("*", "");
  
  // if no API key is set, fallback to use the free Google Translate TTS
  if (!options.googleTTSApiKey || forceGoogleTranslate) {
    return `https://translate.google.com/translate_tts?ie=UTF-8&q=${text}&tl=${lang}&client=tw-ob`;
  }

  if (memoizedTTSUrls && memoizedTTSUrls[text]) {
    return memoizedTTSUrls[text];
  }

  try {
    let textInput = decodeURIComponent(text);
    let useSsml = false;
    if (textInput.includes("\n")) {
      useSsml = true;
      textInput = textInput.replaceAll("\n", "<break/>");
      textInput = `<speak>${textInput}</speak>`;
    }
    let voice = {
      languageCode: "fr-FR",
      name: "fr-FR-Studio-" + (Math.random() < 0.5 ? "A" : "D"),
    };
    if (lang === "de-DE") {
      voice = {
        languageCode: "de-DE",
        name: "de-DE-Studio-" + (Math.random() < 0.5 ? "B" : "C"),
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
          audioConfig: { audioEncoding: "MP3" },
          input: useSsml ? { ssml: textInput } : { text: textInput },
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
        memoizedTTSUrls[text] = audioUrl;
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