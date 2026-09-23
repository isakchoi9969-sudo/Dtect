// 산업별 실제 뉴스 데이터를 이슈 단위로 집계하는 서비스입니다.

const { pool } = require("../db/pool");

// COMPANY.INDUSTRY에 실제 저장된 산업명 기준입니다.
const ISSUE_RULES = {
  "IT·통신·플랫폼": [
    {
      name: "서비스 장애 및 시스템 오류",
      keywords: ["장애", "먹통", "오류", "서비스 중단"],
    },
    {
      name: "개인정보 및 보안 이슈",
      keywords: ["개인정보", "유출", "해킹", "보안"],
    },
    {
      name: "플랫폼 규제 및 제재",
      keywords: ["공정위", "과징금", "제재", "규제", "조사"],
    },
    {
      name: "고객 민원 및 소비자 피해",
      keywords: ["민원", "피해", "불만", "보상"],
    },
  ],

  "자동차·부품·타이어": [
    { name: "리콜 및 제품 결함", keywords: ["리콜", "결함", "불량"] },
    { name: "차량 안전사고 이슈", keywords: ["사고", "화재", "사망", "부상"] },
    {
      name: "품질 관리 및 소비자 불만",
      keywords: ["품질", "민원", "환불", "피해"],
    },
    {
      name: "노사 및 생산 차질",
      keywords: ["파업", "노조", "노사", "생산 차질"],
    },
  ],

  "유통·이커머스": [
    {
      name: "소비자 피해 및 환불 이슈",
      keywords: ["환불", "피해", "민원", "보상"],
    },
    {
      name: "개인정보 및 보안 이슈",
      keywords: ["개인정보", "유출", "해킹"],
    },
    {
      name: "배송 지연 및 물류 차질",
      keywords: ["배송 지연", "물류", "배송", "택배"],
    },
    {
      name: "공정거래 및 규제 이슈",
      keywords: ["공정위", "과징금", "제재", "조사"],
    },
  ],

  조선: [
    {
      name: "조선소 안전사고 이슈",
      keywords: ["사고", "화재", "사망", "부상", "안전"],
    },
    { name: "수주 및 납기 차질", keywords: ["수주", "납기", "지연", "계약"] },
    {
      name: "협력사 및 노사 갈등",
      keywords: ["협력사", "하도급", "노조", "파업"],
    },
    {
      name: "생산 및 공급망 이슈",
      keywords: ["공급망", "생산 차질", "원자재"],
    },
  ],

  반도체: [
    {
      name: "반도체 공급망 및 생산 이슈",
      keywords: ["공급망", "생산 차질", "원자재"],
    },
    {
      name: "기술 유출 및 보안 이슈",
      keywords: ["기술 유출", "유출", "해킹", "보안"],
    },
    {
      name: "산업재해 및 안전사고",
      keywords: ["사고", "화재", "사망", "부상"],
    },
    { name: "규제 및 경쟁 이슈", keywords: ["제재", "규제", "조사", "소송"] },
  ],
};

// 기사 수 기준 위험도입니다.
// 감성 비율을 연결하기 전까지는 실제 기사 수로만 투명하게 판단합니다.
function calculateRisk(articleCount) {
  if (articleCount >= 30) return "경계";
  if (articleCount >= 10) return "주의";
  return "관심";
}

function createKeywordCondition(keywords) {
  return keywords
    .map(() => "(n.TITLE LIKE ? OR n.CONTENT LIKE ?)")
    .join(" OR ");
}

function createKeywordParams(keywords) {
  return keywords.flatMap((keyword) => [`%${keyword}%`, `%${keyword}%`]);
}

async function getIndustryIssues(industry) {
  const rules = ISSUE_RULES[industry];

  if (!rules) {
    return [];
  }

  const issues = await Promise.all(
    rules.map(async (rule, index) => {
      const keywordCondition = createKeywordCondition(rule.keywords);
      const keywordParams = createKeywordParams(rule.keywords);

      // DB에 들어 있는 가장 최근 기사 날짜를 기준으로 최근 30일만 분석합니다.
      // 서버 날짜와 DB 데이터 날짜가 달라도 결과가 어긋나지 않습니다.
      const baseSql = `
        FROM NEWS n
        INNER JOIN NEWS_COMPANY nc ON n.NEWS_ID = nc.NEWS_ID
        INNER JOIN COMPANY c ON nc.COMPANY_ID = c.COMPANY_ID
        WHERE c.INDUSTRY = ?
          AND n.PUBLISHED_AT >= (
            SELECT DATE_SUB(MAX(PUBLISHED_AT), INTERVAL 30 DAY)
            FROM NEWS
          )
          AND (${keywordCondition})
      `;

      // 실제 관련 기사 수와 분석 기간을 집계합니다.
      const [countRows] = await pool.execute(
        `
          SELECT
            COUNT(DISTINCT n.NEWS_ID) AS articleCount,
            DATE_FORMAT(MIN(n.PUBLISHED_AT), '%Y-%m-%d') AS startDate,
            DATE_FORMAT(MAX(n.PUBLISHED_AT), '%Y-%m-%d') AS lastDate
          ${baseSql}
        `,
        [industry, ...keywordParams],
      );

      const articleCount = Number(countRows[0].articleCount || 0);

      // 생성 결과 아래에 표시할 실제 참고 기사 최대 3건입니다.
      const [articleRows] = await pool.execute(
        `
          SELECT DISTINCT
            n.NEWS_ID AS newsId,
            n.TITLE AS title,
            n.PRESS AS source,
            DATE_FORMAT(n.PUBLISHED_AT, '%Y-%m-%d') AS publishedAt,
            n.ORIGINAL_URL AS url
          ${baseSql}
          ORDER BY publishedAt DESC
          LIMIT 3
        `,
        [industry, ...keywordParams],
      );

      return {
        issueId: `${industry}-${index + 1}`,
        issueName: rule.name,
        articleCount,
        risk: calculateRisk(articleCount),

        // 화면에 위험도 판단 이유를 한 줄로 표시합니다.
        riskReason: `최근 30일 관련 기사 ${articleCount.toLocaleString()}건을 기준으로 분류되었습니다.`,

        startDate: countRows[0].startDate,
        lastDate: countRows[0].lastDate,
        keywords: rule.keywords.slice(0, 3),

        summary:
          articleCount > 0
            ? `최근 30일 ${rule.name} 관련 보도가 ${articleCount.toLocaleString()}건 확인되었습니다.`
            : "최근 30일 기준으로 확인된 관련 기사가 없습니다.",

        referenceArticles: articleRows.map((article) => ({
          title: article.title,
          source: article.source || "출처 미상",
          publishedAt: article.publishedAt,
          url: article.url || "",
        })),
      };
    }),
  );

  // 관련 기사가 있는 이슈만 많이 나온 순서로 반환합니다.
  return issues
    .filter((issue) => issue.articleCount > 0)
    .sort((a, b) => b.articleCount - a.articleCount);
}

module.exports = { getIndustryIssues };
