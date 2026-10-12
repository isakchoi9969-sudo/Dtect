const EVENT_TYPE_RULES = [
  { label: "개인정보 유출", keywords: ["개인정보", "고객정보", "계정정보", "정보 유출", "정보유출"] },
  { label: "랜섬웨어 공격", keywords: ["랜섬웨어"] },
  { label: "해킹", keywords: ["해킹", "침해 사고", "사이버 공격"] },
  { label: "서비스 장애", keywords: ["서비스 장애", "접속 장애", "서버 장애", "먹통", "전산 장애"] },
  { label: "화재", keywords: ["화재", "불"] },
  { label: "폭발 사고", keywords: ["폭발"] },
  { label: "산업재해", keywords: ["산업재해", "중대재해", "근로자 사망", "작업자 사망"] },
  { label: "제품 리콜", keywords: ["리콜", "회수"] },
  { label: "환경오염", keywords: ["환경오염", "폐수", "유해물질", "대기오염"] },
  { label: "파업", keywords: ["파업", "쟁의행위"] },
  { label: "임금 체불", keywords: ["임금 체불", "임금체불", "급여 체불"] },
  { label: "수사", keywords: ["검찰 수사", "경찰 수사", "압수수색", "기소"] },
  { label: "과징금 부과", keywords: ["과징금"] },
  { label: "공정위 조사", keywords: ["공정위", "공정거래위원회"] },
  { label: "경영권 분쟁", keywords: ["경영권 분쟁", "주주 갈등"] },
  { label: "실적 악화", keywords: ["실적 악화", "적자", "손실"] },
  { label: "공급망 차질", keywords: ["공급망 차질", "생산 중단", "가동 중단", "납품 지연"] },
];

const MAJOR_CATEGORY_LABELS = {
  "화재·폭발": "화재·폭발",
  "산업재해·안전": "산업재해",
  "IT·서비스 장애": "서비스 장애",
  "보안·개인정보": "보안 이슈",
  "제품·품질": "제품·품질 이슈",
  환경: "환경 이슈",
  "노동·노사": "노동 이슈",
  "법률·수사": "법률 이슈",
  "공정거래·규제": "규제 이슈",
  "소비자·고객": "소비자 이슈",
  "경영·재무": "경영 이슈",
  "경영권·지배구조": "지배구조 이슈",
  "공급망·생산": "공급망 이슈",
  "사회·평판": "평판 이슈",
  "기술·사업": "기술 이슈",
  "금융·시장": "금융 이슈",
  외부환경: "외부환경 이슈",
};

const CASE_SPECIFICITY = Object.freeze({
  SPECIFIC: "SPECIFIC",
  GENERAL: "GENERAL",
  UNCERTAIN: "UNCERTAIN",
});

const GENERIC_ISSUE_TERMS = [
  "업계", "산업", "전반", "통신업계", "기업들", "전문가", "대응책",
  "보안 강화", "보안 위협", "해킹 공포", "컨트롤타워", "정부", "당국",
];

const CONCRETE_EVENT_TERMS = [
  "유출", "탈취", "침해", "피해", "사고", "발생", "신고", "조사", "수사",
  "기소", "압수수색", "과징금", "리콜", "회수", "화재", "폭발", "사망",
  "파업", "체불", "장애", "중단", "복구", "보상", "공개", "발표",
];

const TITLE_STOP_WORDS = new Set([
  "관련", "대한", "통해", "위한", "이번", "이후", "대해", "이슈", "사태",
  "사건", "사고", "논란", "발생", "기업", "회사", "업계", "산업", "정부",
  "당국", "해킹", "개인정보", "정보", "유출", "서비스", "장애", "보안",
]);

function getYear(value) {
  const matched = String(value || "").match(/^\d{4}/);
  return matched ? matched[0] : "";
}

function getArticleText(articles) {
  return (articles || [])
    .map((article) => [article.cleanTitle, article.title, article.cleanContent, article.content]
      .filter(Boolean)
      .join(" "))
    .join(" ")
    .toLocaleLowerCase("ko-KR");
}

function detectEventType(articles, { majorCategory = null, minorCategory = null } = {}) {
  const articleText = getArticleText(articles);
  const matchedRule = EVENT_TYPE_RULES
    .map((rule) => ({
      ...rule,
      score: rule.keywords.filter((keyword) => articleText.includes(keyword)).length,
    }))
    .sort((left, right) => right.score - left.score)[0];

  if (matchedRule?.score > 0) return matchedRule.label;
  if (minorCategory) return minorCategory;
  return MAJOR_CATEGORY_LABELS[majorCategory] || "관련 이슈";
}

function getArticleTitle(article) {
  return [article?.cleanTitle, article?.title]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("ko-KR");
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function normalizeCompanyTokens(companyName) {
  return String(companyName || "")
    .toLocaleLowerCase("ko-KR")
    .split(/[\s()·,./-]+/)
    .filter((token) => token.length >= 2);
}

function getAnchorKeywords(articles, companyName, eventType) {
  const companyTokens = new Set(normalizeCompanyTokens(companyName));
  const eventTokens = new Set(
    String(eventType || "")
      .toLocaleLowerCase("ko-KR")
      .split(/\s+/)
      .filter(Boolean),
  );
  const articleTokenSets = (articles || []).map((article) => new Set(
    getArticleTitle(article)
      .split(/[^0-9a-z가-힣]+/i)
      .map((token) => token.trim())
      .filter((token) => token.length >= 2)
      .filter((token) => !TITLE_STOP_WORDS.has(token))
      .filter((token) => !companyTokens.has(token) && !eventTokens.has(token)),
  ));
  const counts = new Map();

  for (const tokens of articleTokenSets) {
    for (const token of tokens) counts.set(token, (counts.get(token) || 0) + 1);
  }

  const minimumCount = articleTokenSets.length >= 2 ? 2 : 1;
  return [...counts.entries()]
    .filter(([, count]) => count >= minimumCount)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "ko"))
    .map(([token]) => token)
    .slice(0, 2);
}

/**
 * 외부 모델 호출 없이 기사 군집의 사건성을 판별한다.
 * 제목 기준의 일반 이슈 표현이 다수면 GENERAL로, 구체적 사건 표현과 공통 핵심어가 있으면 SPECIFIC으로 분류한다.
 */
function buildCaseProfile(group, options = {}) {
  const articles = Array.isArray(group.articles) ? group.articles : [];
  const eventType = detectEventType(articles, options);
  const titles = articles.map(getArticleTitle).filter(Boolean);
  const genericTitleCount = titles.filter((title) => includesAny(title, GENERIC_ISSUE_TERMS)).length;
  const concreteTitleCount = titles.filter((title) => includesAny(title, CONCRETE_EVENT_TERMS)).length;
  const anchorKeywords = getAnchorKeywords(articles, group.companyName, eventType);
  const hasGenericMajority = titles.length > 0 && genericTitleCount >= Math.ceil(titles.length / 2);
  const hasConcreteEvidence = concreteTitleCount > 0;
  let eventSpecificity = CASE_SPECIFICITY.UNCERTAIN;

  if (hasGenericMajority && genericTitleCount >= concreteTitleCount) {
    eventSpecificity = CASE_SPECIFICITY.GENERAL;
  } else if (
    articles.length >= 2
    && hasConcreteEvidence
    && (anchorKeywords.length > 0 || concreteTitleCount >= 2)
  ) {
    eventSpecificity = CASE_SPECIFICITY.SPECIFIC;
  } else if (articles.length === 1 && hasConcreteEvidence && !hasGenericMajority) {
    // 단일 기사는 검색 유사도가 매우 높을 때만 최종 선별 단계에서 통과시킨다.
    eventSpecificity = CASE_SPECIFICITY.SPECIFIC;
  } else if (hasGenericMajority) {
    eventSpecificity = CASE_SPECIFICITY.GENERAL;
  }

  return {
    eventType,
    eventSpecificity,
    anchorKeywords,
    genericTitleCount,
    concreteTitleCount,
  };
}

/** LLM 없이 사건의 날짜·기업·기사 키워드로 표시용 사건명을 만든다. */
function buildCaseTitle(group, options = {}) {
  const storedCaseTitle = String(group.caseName || "").trim();
  if (storedCaseTitle) return storedCaseTitle;

  const year = getYear(group.storedStartDate || group.startDate);
  const companyName = String(group.companyName || "").trim();
  const profile = group.eventType ? group : buildCaseProfile(group, options);
  const titleParts = [year, companyName, ...profile.anchorKeywords, profile.eventType].filter(Boolean);

  if (profile.eventSpecificity !== CASE_SPECIFICITY.SPECIFIC) {
    return `${[year, companyName, profile.eventType].filter(Boolean).join(" ")} 이슈`.trim();
  }

  return `${titleParts.join(" ")} ${profile.eventType.endsWith("사태") ? "" : "사태"}`.trim();
}

module.exports = {
  CASE_SPECIFICITY,
  buildCaseTitle,
  buildCaseProfile,
  detectEventType,
  getAnchorKeywords,
  getArticleText,
  getYear,
};
