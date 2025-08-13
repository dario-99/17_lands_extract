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
    // Find each card container that has a background image
    document.querySelectorAll("div.sc-eeGUxP").forEach(outerDiv => {
        let style = outerDiv.getAttribute("style") || "";
        let imageMatch = style.match(/url\(["']?(.*?)["']?\)/);
        let imageUrl = imageMatch ? imageMatch[1] : null;

        let innerDiv = outerDiv.querySelector("div.sc-lpcdUm");
        if (!innerDiv) return;

        let aTag = innerDiv.querySelector("a");
        let lastDiv = innerDiv.querySelector("div:last-child");
        if (!aTag || !lastDiv) return;

        let url = new URL(aTag.href, window.location.origin);
        let urlParams = url.searchParams;

        cards.push({
            card_id: urlParams.get("card_id"),
            expansion: urlParams.get("expansion"),
            format: urlParams.get("format"),
            card_name: aTag.textContent.trim(),
            gihwr: lastDiv.textContent.trim(),
            image_url: imageUrl.replace("art_crop", "large")
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