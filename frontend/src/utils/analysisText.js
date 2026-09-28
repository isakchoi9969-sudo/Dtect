// Internal evidence IDs remain in structured data, never in customer prose.
export function stripEvidenceMarkers(text = "") {
  return text.replace(/[([（]\s*(?:(?:확인\s*근거|근거(?:\s*기사)?|기사|참고)\s*[:：]?\s*)?A\d+(?:\s*(?:[,·、/&~～–-]|및|와|과)\s*A?\d+)*\s*[)\]）]/gi, "")
    .replace(/[ \t]+([.,!?。？！])/g, "$1")
    .replace(/[ \t]{2,}/g, " ").trim();
}
