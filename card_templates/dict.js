/**
 * Dictionary
 */
try {
  fetch(`${getAnkiPrefix()}/_FR5000_dict_${word}.xml`).then(
    async (response) => {
      if (response.ok) {
        const xml = await response.text();
        const dict = document.createElement("div");
        dict.id = "dict";
        dict.classList.add("card-box");
        dict.innerHTML = xml;
        grammarLibrary.insertAdjacentElement("afterend", dict);
      }
    }
  );
} catch (e) {
  console.error(e);
}
