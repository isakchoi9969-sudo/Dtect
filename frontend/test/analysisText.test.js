import test from "node:test";
import assert from "node:assert/strict";
import { stripEvidenceMarkers } from "../src/utils/analysisText.js";

test("internal evidence markers are hidden without losing paragraphs", () => {
  assert.equal(stripEvidenceMarkers("확인됩니다 (A1, A6).\n\n살펴봅니다(근거: a2~a7)."), "확인됩니다.\n\n살펴봅니다.");
});
test("product names and ordinary parentheses are retained", () => {
  assert.equal(stripEvidenceMarkers("A1 제품 (A1 제품) [IPO]"), "A1 제품 (A1 제품) [IPO]");
});
