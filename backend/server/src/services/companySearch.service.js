// 검색 두 문자열을 비교해서 얼마나 비슷한지 0~1 사이의 값을 만듬
function levenshteinDistance(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, () =>
    Array(a.length + 1).fill(0),
  );

  for (let i = 0; i <= b.length; i++) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1,
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function similarity(a, b) {
  if (!a || !b) return 0;

  const distance = levenshteinDistance(a, b);
  const maxLength = Math.max(a.length, b.length);

  return maxLength === 0 ? 1 : 1 - distance / maxLength;
}

function normalizeSearchKeyword(keyword) {
  return String(keyword || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/(.)\1+/g, "$1");
}

function calculateSearchScore(keyword, companyName) {
  const normalizedKeyword = normalizeSearchKeyword(keyword);
  const normalizedCompanyName = normalizeSearchKeyword(companyName);

  if (!normalizedKeyword || !normalizedCompanyName) {
    return 0;
  }

  // 1. 완전히 같은 경우
  if (normalizedKeyword === normalizedCompanyName) {
    return 1;
  }

  // 2. 회사명에 검색어가 포함된 경우
  if (normalizedCompanyName.includes(normalizedKeyword)) {
    return 0.9;
  }

  // 3. 기존 Levenshtein 유사도
  return similarity(normalizedKeyword, normalizedCompanyName);
}

module.exports = {
  levenshteinDistance,
  similarity,
  normalizeSearchKeyword,
  calculateSearchScore,
};
