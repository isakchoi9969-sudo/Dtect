const ALIAS_OVERRIDES = Object.freeze({
  KT: ["KT", "케이티"],
  SK텔레콤: ["SK텔레콤", "SKT", "에스케이텔레콤"],
  LG유플러스: ["LG유플러스", "LGU+", "LG U+", "엘지유플러스"],
  현대자동차: ["현대자동차", "현대차", "Hyundai Motor"],
  기아: ["기아", "KIA", "Kia"],
  쿠팡: ["쿠팡", "Coupang"],
  카카오: ["카카오", "Kakao"],
  NAVER: ["NAVER", "네이버"],
  KG모빌리티: ["KG모빌리티", "KGM"],
  르노코리아: ["르노코리아"],
});

const MULTI_COMPANY_PATTERNS = [
  /이통\s*3사/,
  /통신\s*3사/,
  /완성차\s*\d+\s*사/,
  /자동차\s*\d+\s*사/,
  /공동/,
  /각사/,
  /일제히/,
];

function buildCompanyAliases(companies) {
  const aliasesByCompany = new Map();

  for (const company of companies) {
    const companyName = String(company.companyName || "").trim();
    if (!companyName) continue;

    aliasesByCompany.set(
      companyName,
      ALIAS_OVERRIDES[companyName] || [companyName],
    );
  }

  return aliasesByCompany;
}

function findCompanyPosition(text, aliases) {
  const source = String(text || "");
  const positions = [];

  for (const alias of aliases) {
    const pattern = alias === "KT"
      ? /(?<![A-Za-z0-9])KT(?![A-Za-z0-9-])/i
      : new RegExp(alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const match = source.match(pattern);

    if (match && match.index !== undefined) {
      positions.push(match.index);
    }
  }

  return positions.length > 0 ? Math.min(...positions) : null;
}

function findCompanyHits(text, aliasesByCompany) {
  const hits = [];

  for (const [companyName, aliases] of aliasesByCompany) {
    const position = findCompanyPosition(text, aliases);
    if (position !== null) {
      hits.push({ companyName, position });
    }
  }

  return hits.sort((a, b) => a.position - b.position);
}

/**
 * 제목 우선, 제목에 없으면 정제 본문 앞 400자로 현재 기사의 핵심 기업을 판별한다.
 * 복수 기업 맥락은 제목에서만 허용한다.
 */
function detectCoreCompanies(article, aliasesByCompany) {
  const title = String(article.cleanTitle || "");
  const titleHits = findCompanyHits(title, aliasesByCompany);

  if (titleHits.length > 0) {
    const isMultiCompany = MULTI_COMPANY_PATTERNS.some((pattern) => pattern.test(title));
    return isMultiCompany
      ? titleHits.map((hit) => hit.companyName)
      : [titleHits[0].companyName];
  }

  const contentLead = String(article.cleanContent || "").slice(0, 400);
  const contentHits = findCompanyHits(contentLead, aliasesByCompany);
  return contentHits.length > 0 ? [contentHits[0].companyName] : [];
}

module.exports = {
  ALIAS_OVERRIDES,
  MULTI_COMPANY_PATTERNS,
  buildCompanyAliases,
  detectCoreCompanies,
  findCompanyPosition,
};
