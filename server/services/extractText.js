// services/extractText.js
// pdfjs-dist (Mozilla's official pdf.js) ships as ESM, so we load it with a
// dynamic import() — which works fine inside CommonJS and returns a promise.
let pdfjsPromise;
function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist/legacy/build/pdf.mjs");
  }
  return pdfjsPromise; // cached so it only loads once
}

async function extractPdfText(buffer) {
  const pdfjs = await getPdfjs();
  const data = new Uint8Array(buffer);
  const doc = await pdfjs.getDocument({ data, verbosity: 0 }).promise;

  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it) => it.str).join(" ") + "\n";
  }

  text = text.trim();
  if (!text) {
    // A scanned/photo PDF has no text layer to extract.
    throw new Error("No text found in PDF (is it a scanned image?)");
  }
  return text;
}

module.exports = { extractPdfText };