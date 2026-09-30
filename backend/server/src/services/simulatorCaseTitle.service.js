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

/** LLM 없이 사건의 날짜·기업·기사 키워드로 표시용 사건명을 만든다. */
function buildCaseTitle(group, options = {}) {
  const storedCaseTitle = String(group.caseName || "").trim();
  if (storedCaseTitle) return storedCaseTitle;

  const year = getYear(group.storedStartDate || group.startDate);
  const companyName = String(group.companyName || "").trim();
  const eventType = detectEventType(group.articles, options);
  const titleParts = [year, companyName, eventType].filter(Boolean);

  return `${titleParts.join(" ")} ${eventType.endsWith("사태") ? "" : "사태"}`.trim();
}

module.exports = {
  buildCaseTitle,
  detectEventType,
  getArticleText,
  getYear,
};
