let extractedData = {};

document.getElementById("extractBtn").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractCardData
    }, (results) => {
        if (results && results[0] && results[0].result) {
            extractedData = results[0].result;
            document.getElementById("output").textContent =
                JSON.stringify(results[0].result, null, 2);
            document.getElementById("downloadBtn").disabled = extractedData.length === 0;
        }
    });
});

document.getElementById("downloadBtn").addEventListener("click", () => {
    if (extractedData.cards.length > 0) {
        let blob = new Blob([JSON.stringify(extractedData, null, 2)], { type: "application/json" });
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = "card_data.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
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
            gihwr: lastDiv.textContent.trim()
        });
    });
    extractedData = {
        cards: cards,
        totalCards: cards.length,
        extractedAt: new Date().toISOString(),
    }
    console.log("Extracted Data:", extractedData);
    return extractedData;
}
