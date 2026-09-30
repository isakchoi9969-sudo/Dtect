function toDateOnly(value) {
  const matchedDate = String(value || "").match(/^\d{4}-\d{2}-\d{2}/);
  if (matchedDate) return matchedDate[0];

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

/** 뉴스 원문 또는 네이버 뉴스 링크만 화면에 전달한다. */
function toArticleUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function toSummarySourceArticles(group) {
  const articles = Array.isArray(group.articles) ? group.articles : [];
  return articles
    .slice()
    .sort((left, right) => {
      if (left.newsId === group.representativeNewsId) return -1;
      if (right.newsId === group.representativeNewsId) return 1;
      return String(right.cleanContent || right.content || "").length
        - String(left.cleanContent || left.content || "").length;
    })
    .slice(0, 4)
    .map((article) => ({
      id: `N${article.newsId}`,
      title: String(article.title || "").slice(0, 500),
      summary: String(article.cleanContent || article.content || "").slice(0, 1600),
      publishedAt: article.publishedAt || "",
      press: article.press || "",
    }))
    .filter((article) => article.title);
}

/** 현재 시뮬레이터 UI의 similarCases 데이터 구조로 최종 사례를 변환한다. */
function toSimilarCaseResponse(group) {
  return {
    caseId: Number.isInteger(group.caseId) ? group.caseId : null,
    issueId: Number.isInteger(group.issueId) ? group.issueId : null,
    source: Number.isInteger(group.caseId) ? "stored" : "dynamic",
    matchMethod: group.matchMethod || "semantic",
    // 동적 사례는 규칙 기반 사건명, 저장 사례는 관리된 CASE_NAME을 사용한다.
    caseTitle: group.caseTitle || group.caseName || group.issueName || group.representativeTitle,
    issueName: group.issueName || group.caseName,
    companyName: group.companyName,
    industry: group.industry,
    riskType: group.riskType || group.storedRiskType || null,
    startDate: toDateOnly(group.storedStartDate || group.startDate),
    lastDate: toDateOnly(group.storedLastDate || group.lastDate),
    durationDays: group.storedStartDate && group.storedLastDate
      ? getDurationDays(group.storedStartDate, group.storedLastDate)
      : group.durationDays,
    articleCount: group.storedArticleCount ?? group.articleCount,
    semanticSimilarity: group.matchMethod === "category"
      ? null
      : group.semanticSimilarity,
    finalScore: group.matchMethod === "category" ? null : group.finalScore,
    representativeNewsId: group.representativeNewsId,
    representativeTitle: group.representativeTitle,
    representativeUrl: toArticleUrl(group.representativeUrl),
    // 화면에는 보이지 않으며, 사용자가 AI 요약을 요청할 때만 전송한다.
    sourceArticles: toSummarySourceArticles(group),
    description: group.description,
  };
}

function getDurationDays(startDate, lastDate) {
  const start = new Date(startDate);
  const last = new Date(lastDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(last.getTime())) return null;

  return Math.floor((last - start) / (24 * 60 * 60 * 1000)) + 1;
}

function buildSimulatorResponse(groups) {
  return {
    similarCases: groups.map(toSimilarCaseResponse),
  };
}

module.exports = {
  buildSimulatorResponse,
  toArticleUrl,
  toSummarySourceArticles,
  toDateOnly,
  toSimilarCaseResponse,
};
