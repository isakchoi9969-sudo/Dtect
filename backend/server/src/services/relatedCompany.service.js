const { pool } = require("../db/pool");
const { countCompanyMentions } = require("./naverNews.service");

const LOOKBACK_DAYS = 90;
const MIN_ARTICLES = 3;
const MIN_PRESS_COUNT = 2;
const MAX_RESULTS = 5;
const MIN_EXPANDED_ARTICLES = 2;
const MIN_TARGET_RESULTS = 3;
const ABSOLUTE_MIN_RESULTS = 2;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function normalizeText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLocaleLowerCase("ko-KR")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function includesCompanyTerm(text, companyName) {
  return countCompanyMentions(text, companyName) > 0;
}

function getRecencyWeight(publishedAt, now = new Date()) {
  const publishedDate = new Date(publishedAt);
  if (Number.isNaN(publishedDate.getTime())) return 0.4;

  const ageDays = Math.max(0, (now.getTime() - publishedDate.getTime()) / DAY_IN_MS);
  if (ageDays <= 7) return 1;
  if (ageDays <= 30) return 0.8;
  if (ageDays <= 60) return 0.6;
  return 0.4;
}

function getMentionScore(title, currentCompanyName, relatedCompanyName) {
  const currentInTitle = includesCompanyTerm(title, currentCompanyName);
  const relatedInTitle = includesCompanyTerm(title, relatedCompanyName);

  if (currentInTitle && relatedInTitle) return 3;
  if (currentInTitle || relatedInTitle) return 2;
  return 1;
}

const INDUSTRY_TOKEN_FAMILIES = Object.freeze({
  "2차전지": ["배터리"],
  이차전지: ["배터리"],
  배터리: ["배터리"],
  디스플레이: ["전자"],
  전자부품: ["전자"],
  가전: ["전자"],
  반도체: ["전자"],
  자동차부품: ["자동차"],
  식음료: ["식품", "소비재"],
  식품: ["소비재"],
  외식: ["식품", "소비재"],
  담배: ["소비재"],
  생활용품: ["소비재"],
  플랜트: ["건설"],
  건설기계: ["건설", "기계"],
  로봇: ["기계"],
  항공운송: ["항공"],
  항공우주: ["항공", "방산"],
  보험: ["금융"],
  바이오: ["헬스케어"],
  제약: ["헬스케어"],
  게임: ["콘텐츠"],
  엔터테인먼트: ["콘텐츠"],
  인터넷: ["디지털"],
  플랫폼: ["디지털"],
  전자상거래: ["디지털", "유통"],
  비철금속: ["소재"],
  제련: ["소재"],
  철강: ["소재"],
  전력: ["에너지"],
  정유: ["에너지"],
  타이어: ["자동차"],
});

const COMPANY_INDUSTRY_FALLBACKS = Object.freeze({
  HMM: "해운·물류",
  "LS ELECTRIC": "전력·에너지",
  미래에셋증권: "금융",
  우리금융: "금융",
  하나금융: "금융",
  현대제철: "철강·소재",
});

function getIndustryTokens(industry, companyName = "") {
  return new Set(
    String(industry || COMPANY_INDUSTRY_FALLBACKS[companyName] || "")
      .split(/[·,/&\s]+/)
      .map((token) => token.trim())
      .filter(Boolean)
      .flatMap((token) => [
        token,
        ...(INDUSTRY_TOKEN_FAMILIES[token] || []),
      ]),
  );
}

function rankNewsRelations(rows, currentCompanyName, now = new Date()) {
  const relations = new Map();

  for (const row of rows) {
    const companyId = Number(row.companyId);
    if (!Number.isInteger(companyId)) continue;

    if (!relations.has(companyId)) {
      relations.set(companyId, {
        companyId,
        companyName: row.companyName,
        stockCode: row.stockCode || null,
        industry: row.industry || null,
        articles: new Map(),
      });
    }

    const articleKey = normalizeText(row.title) || `news-${row.newsId}`;
    const mentionScore = getMentionScore(
      row.title,
      currentCompanyName,
      row.companyName,
    );
    const weightedScore = mentionScore * getRecencyWeight(row.publishedAt, now);
    const article = {
      press: String(row.press || "").trim(),
      publishedAt: row.publishedAt,
      weightedScore,
    };
    const currentArticle = relations.get(companyId).articles.get(articleKey);

    if (!currentArticle || article.weightedScore > currentArticle.weightedScore) {
      relations.get(companyId).articles.set(articleKey, article);
    }
  }

  const rankedRelations = [...relations.values()]
    .map((relation) => {
      const articles = [...relation.articles.values()];
      const pressCount = new Set(
        articles.map((article) => article.press).filter(Boolean),
      ).size;

      const criteriaLevel =
        articles.length >= MIN_ARTICLES && pressCount >= MIN_PRESS_COUNT
          ? "strict"
          : articles.length >= MIN_ARTICLES
            ? "expanded"
            : articles.length >= MIN_EXPANDED_ARTICLES
              ? "minimum"
              : "discovery";

      return {
        companyId: relation.companyId,
        companyName: relation.companyName,
        stockCode: relation.stockCode,
        industry: relation.industry,
        relationType: "news",
        articleCount: articles.length,
        pressCount,
        criteriaLevel,
        score: Number(
          articles
            .reduce((total, article) => total + article.weightedScore, 0)
            .toFixed(2),
        ),
      };
    })
    .filter(
      (relation) =>
        relation.articleCount >= 1 &&
        relation.pressCount >= 1,
    )
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.articleCount - a.articleCount ||
        b.pressCount - a.pressCount ||
        a.companyName.localeCompare(b.companyName, "ko"),
    );

  const selectedRelations = [];
  const selectedCompanyIds = new Set();
  const addRelations = (candidates, limit) => {
    for (const candidate of candidates) {
      if (selectedRelations.length >= limit) break;
      if (selectedCompanyIds.has(candidate.companyId)) continue;

      selectedRelations.push(candidate);
      selectedCompanyIds.add(candidate.companyId);
    }
  };

  addRelations(
    rankedRelations.filter((relation) => relation.criteriaLevel === "strict"),
    MAX_RESULTS,
  );
  addRelations(
    rankedRelations.filter((relation) => relation.criteriaLevel === "expanded"),
    MAX_RESULTS,
  );

  if (selectedRelations.length < MIN_TARGET_RESULTS) {
    addRelations(
      rankedRelations.filter((relation) => relation.criteriaLevel === "minimum"),
      MIN_TARGET_RESULTS,
    );
  }

  if (selectedRelations.length < ABSOLUTE_MIN_RESULTS) {
    addRelations(
      rankedRelations.filter((relation) => relation.criteriaLevel === "discovery"),
      ABSOLUTE_MIN_RESULTS,
    );
  }

  return selectedRelations;
}

async function getCompany(companyId) {
  const [rows] = await pool.query(
    `
      SELECT
        COMPANY_ID AS companyId,
        COMPANY_NAME AS companyName,
        INDUSTRY AS industry
      FROM COMPANY
      WHERE COMPANY_ID = ?
      LIMIT 1
    `,
    [companyId],
  );

  return rows[0] || null;
}

async function getNewsRelationRows(companyId) {
  const [rows] = await pool.query(
    `
      SELECT DISTINCT
        news.NEWS_ID AS newsId,
        news.TITLE AS title,
        news.PRESS AS press,
        news.PUBLISHED_AT AS publishedAt,
        relatedCompany.COMPANY_ID AS companyId,
        relatedCompany.COMPANY_NAME AS companyName,
        relatedCompany.STOCK_CODE AS stockCode,
        relatedCompany.INDUSTRY AS industry
      FROM NEWS news
      JOIN NEWS_COMPANY currentLink
        ON currentLink.NEWS_ID = news.NEWS_ID
        AND currentLink.COMPANY_ID = ?
      JOIN NEWS_COMPANY relatedLink
        ON relatedLink.NEWS_ID = news.NEWS_ID
        AND relatedLink.COMPANY_ID <> currentLink.COMPANY_ID
      JOIN COMPANY relatedCompany
        ON relatedCompany.COMPANY_ID = relatedLink.COMPANY_ID
      WHERE news.PUBLISHED_AT >= DATE_SUB(NOW(), INTERVAL ${LOOKBACK_DAYS} DAY)
    `,
    [companyId],
  );

  return rows;
}

async function getAllCompanies() {
  const [rows] = await pool.query(`
    SELECT
      COMPANY_ID AS companyId,
      COMPANY_NAME AS companyName,
      STOCK_CODE AS stockCode,
      INDUSTRY AS industry
    FROM COMPANY
  `);

  return rows;
}

function buildLiveNewsRelationRows(articles, currentCompany, companies, now = new Date()) {
  const cutoff = now.getTime() - LOOKBACK_DAYS * DAY_IN_MS;

  return (articles || []).flatMap((article, articleIndex) => {
    const publishedAt = new Date(article.pub_date || article.publishedAt);
    if (Number.isNaN(publishedAt.getTime()) || publishedAt.getTime() < cutoff) {
      return [];
    }

    const title = String(article.title || "");
    const description = String(article.description || article.summary || "");
    const searchableText = `${title} ${description}`;

    return companies.flatMap((company) => {
      if (Number(company.companyId) === Number(currentCompany.companyId)) return [];
      if (!includesCompanyTerm(searchableText, company.companyName)) return [];

      return [{
        newsId: `live-${articleIndex}`,
        title,
        press: article.source?.name || article.press || "",
        publishedAt,
        companyId: Number(company.companyId),
        companyName: company.companyName,
        stockCode: company.stockCode || null,
        industry: company.industry || null,
      }];
    });
  });
}

async function getIndustryRelations(companyId, industry, companyName) {
  const currentIndustryTokens = getIndustryTokens(industry, companyName);
  if (currentIndustryTokens.size === 0) return [];

  const [rows] = await pool.query(
    `
      SELECT
        company.COMPANY_ID AS companyId,
        company.COMPANY_NAME AS companyName,
        company.STOCK_CODE AS stockCode,
        company.INDUSTRY AS industry,
        COUNT(DISTINCT recentNews.NEWS_ID) AS recentArticleCount,
        MAX(recentNews.PUBLISHED_AT) AS latestPublishedAt
      FROM COMPANY company
      LEFT JOIN NEWS_COMPANY newsLink
        ON newsLink.COMPANY_ID = company.COMPANY_ID
      LEFT JOIN NEWS recentNews
        ON recentNews.NEWS_ID = newsLink.NEWS_ID
        AND recentNews.PUBLISHED_AT >= DATE_SUB(NOW(), INTERVAL ${LOOKBACK_DAYS} DAY)
      WHERE company.COMPANY_ID <> ?
      GROUP BY
        company.COMPANY_ID,
        company.COMPANY_NAME,
        company.STOCK_CODE,
        company.INDUSTRY
      ORDER BY
        recentArticleCount DESC,
        latestPublishedAt DESC,
        company.COMPANY_NAME ASC
    `,
    [companyId],
  );

  return rows
    .map((row) => {
      const matchingTokens = [
        ...getIndustryTokens(row.industry, row.companyName),
      ].filter((token) => currentIndustryTokens.has(token));

      return {
        companyId: Number(row.companyId),
        companyName: row.companyName,
        stockCode: row.stockCode || null,
        industry: row.industry || null,
        relationType: "industry",
        industryMatchCount: matchingTokens.length,
        recentArticleCount: Number(row.recentArticleCount) || 0,
        latestPublishedAt: row.latestPublishedAt,
      };
    })
    .filter((company) => company.industryMatchCount > 0)
    .sort(
      (a, b) =>
        b.industryMatchCount - a.industryMatchCount ||
        b.recentArticleCount - a.recentArticleCount ||
        new Date(b.latestPublishedAt || 0) - new Date(a.latestPublishedAt || 0) ||
        a.companyName.localeCompare(b.companyName, "ko"),
    )
    .slice(0, MAX_RESULTS)
    .map(({ industryMatchCount, latestPublishedAt, recentArticleCount, ...company }) =>
      company,
    );
}

async function getRelatedCompanies(companyId, liveArticles = []) {
  const company = await getCompany(companyId);
  if (!company) return null;

  const [storedNewsRows, companies] = await Promise.all([
    getNewsRelationRows(companyId),
    getAllCompanies(),
  ]);
  const liveNewsRows = buildLiveNewsRelationRows(
    liveArticles,
    company,
    companies,
  );
  const newsRows = [...storedNewsRows, ...liveNewsRows];
  const newsRelations = rankNewsRelations(newsRows, company.companyName);

  if (newsRelations.length >= ABSOLUTE_MIN_RESULTS) {
    return {
      mode: "news",
      companies: newsRelations,
    };
  }

  if (newsRelations.length > 0) {
    const newsCompanyIds = new Set(
      newsRelations.map((relation) => relation.companyId),
    );
    const industryRelations = await getIndustryRelations(
      companyId,
      company.industry,
      company.companyName,
    );
    const supplementalIndustryRelations = industryRelations
      .filter((relation) => !newsCompanyIds.has(relation.companyId))
      .slice(0, ABSOLUTE_MIN_RESULTS - newsRelations.length);

    return {
      mode: "hybrid",
      companies: [...newsRelations, ...supplementalIndustryRelations],
    };
  }

  return {
    mode: "industry",
    companies: await getIndustryRelations(
      companyId,
      company.industry,
      company.companyName,
    ),
  };
}

module.exports = {
  ABSOLUTE_MIN_RESULTS,
  LOOKBACK_DAYS,
  MAX_RESULTS,
  MIN_EXPANDED_ARTICLES,
  MIN_ARTICLES,
  MIN_PRESS_COUNT,
  MIN_TARGET_RESULTS,
  buildLiveNewsRelationRows,
  getMentionScore,
  getRecencyWeight,
  getRelatedCompanies,
  getIndustryTokens,
  includesCompanyTerm,
  normalizeText,
  rankNewsRelations,
};
