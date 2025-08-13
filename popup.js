document.getElementById("extractBtn").addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: extractCardData
  }, (results) => {
    if (results && results[0] && results[0].result) {
      document.getElementById("output").textContent =
        JSON.stringify(results[0].result, null, 2);
    }
  });
});

function extractCardData() {
  let cards = [];
  document.querySelectorAll("div.sc-lpcdUm").forEach(div => {
    let aTag = div.querySelector("a");
    let lastDiv = div.querySelector("div:last-child");

    if (!aTag || !lastDiv) return;

    let urlParams = new URLSearchParams(new URL(aTag.getAttribute("href"), window.location.origin).search);
    cards.push({
      card_id: urlParams.get("card_id"),
      expansion: urlParams.get("expansion"),
      format: urlParams.get("format"),
      card_name: aTag.textContent.trim(),
      percentage: lastDiv.textContent.trim()
    });
  });
  console.log(cards);
  return cards;
}
