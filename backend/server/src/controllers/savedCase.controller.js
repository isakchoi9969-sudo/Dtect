const { pool } = require("../db/pool");
const { generateCaseSummary } = require("../services/aiClient.service");

function positiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function nullableText(value, maxLength) {
  const text = String(value || "").trim();
  return text ? text.slice(0, maxLength) : null;
}

function nullableDate(value) {
  const text = String(value || "").match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  return text || null;
}

function getCaseKey({ caseId, representativeNewsId }) {
  if (caseId) return `case-${caseId}`;
  if (representativeNewsId) return `news-${representativeNewsId}`;
  return null;
}

function parseSummary(value) {
  if (!value) return null;
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function toSavedCase(row) {
  return {
    savedCaseId: row.savedCaseId,
    caseKey: row.caseKey,
    caseId: row.caseId,
    caseTitle: row.caseTitle,
    companyName: row.companyName,
    industry: row.industry,
    riskType: row.riskType,
    startDate: row.startDate,
    durationDays: row.durationDays,
    articleCount: row.articleCount,
    representativeNewsId: row.representativeNewsId,
    representativeTitle: row.representativeTitle,
    representativeUrl: row.representativeUrl,
    aiSummary: parseSummary(row.aiSummary),
    savedAt: row.savedAt,
  };
}

function normalizeArticles(articles) {
  return (Array.isArray(articles) ? articles : [])
    .slice(0, 4)
    .map((article, index) => ({
      id: nullableText(article?.id, 32) || `A${index + 1}`,
      title: nullableText(article?.title, 500),
      summary: nullableText(article?.summary, 1600) || "",
      published_at: nullableText(article?.publishedAt, 50) || "",
      press: nullableText(article?.press, 100) || "",
    }))
    .filter((article) => article.title);
}

async function createSavedCase(req, res) {
  const caseId = positiveInteger(req.body.caseId);
  const representativeNewsId = positiveInteger(req.body.representativeNewsId);
  const caseKey = getCaseKey({ caseId, representativeNewsId });
  const caseTitle = nullableText(req.body.caseTitle, 200);

  if (!caseKey || !caseTitle) {
    return res.status(400).json({
      success: false,
      message: "저장할 과거 사례 정보가 올바르지 않습니다.",
    });
  }

  let aiSummary = parseSummary(req.body.aiSummary);
  try {
    // 화면에서 이미 생성한 요약은 그대로 저장해 LLM을 다시 호출하지 않습니다.
    if (!aiSummary) {
      const articles = normalizeArticles(req.body.articles);
      if (articles.length === 0) {
        return res.status(400).json({
          success: false,
          message: "AI 요약을 만들 기사 근거가 없습니다.",
        });
      }

      const result = await generateCaseSummary({
        case_title: caseTitle,
        company_name: nullableText(req.body.companyName, 100) || "",
        articles,
      });
      aiSummary = result.data;
    }

    if (!aiSummary || typeof aiSummary !== "object") {
      throw new Error("AI 사건 요약을 생성하지 못했습니다.");
    }

    const [result] = await pool.query(
      `INSERT INTO USER_SAVED_CASE (
        USER_ID, CASE_KEY, CASE_ID, CASE_TITLE, COMPANY_NAME, INDUSTRY,
        RISK_TYPE, START_DATE, DURATION_DAYS, ARTICLE_COUNT,
        REPRESENTATIVE_NEWS_ID, REPRESENTATIVE_TITLE, REPRESENTATIVE_URL,
        AI_SUMMARY_JSON
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.authUserId,
        caseKey,
        caseId,
        caseTitle,
        nullableText(req.body.companyName, 100),
        nullableText(req.body.industry, 100),
        nullableText(req.body.riskType, 50),
        nullableDate(req.body.startDate),
        positiveInteger(req.body.durationDays),
        positiveInteger(req.body.articleCount),
        representativeNewsId,
        nullableText(req.body.representativeTitle, 500),
        nullableText(req.body.representativeUrl, 2048),
        JSON.stringify(aiSummary),
      ],
    );

    const [rows] = await pool.query(
      `SELECT SAVED_CASE_ID AS savedCaseId, CASE_KEY AS caseKey, CASE_ID AS caseId,
        CASE_TITLE AS caseTitle, COMPANY_NAME AS companyName, INDUSTRY AS industry,
        RISK_TYPE AS riskType, START_DATE AS startDate, DURATION_DAYS AS durationDays,
        ARTICLE_COUNT AS articleCount, REPRESENTATIVE_NEWS_ID AS representativeNewsId,
        REPRESENTATIVE_TITLE AS representativeTitle, REPRESENTATIVE_URL AS representativeUrl,
        AI_SUMMARY_JSON AS aiSummary, SAVED_AT AS savedAt
       FROM USER_SAVED_CASE WHERE SAVED_CASE_ID = ?`,
      [result.insertId],
    );

    return res.status(201).json({ success: true, savedCase: toSavedCase(rows[0]) });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, message: "이미 저장한 과거 사례입니다." });
    }

    console.error("과거 사례 저장 실패:", error.message);
    return res.status(500).json({ success: false, message: error.message || "과거 사례를 저장하지 못했습니다." });
  }
}

async function getSavedCases(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT SAVED_CASE_ID AS savedCaseId, CASE_KEY AS caseKey, CASE_ID AS caseId,
        CASE_TITLE AS caseTitle, COMPANY_NAME AS companyName, INDUSTRY AS industry,
        RISK_TYPE AS riskType, START_DATE AS startDate, DURATION_DAYS AS durationDays,
        ARTICLE_COUNT AS articleCount, REPRESENTATIVE_NEWS_ID AS representativeNewsId,
        REPRESENTATIVE_TITLE AS representativeTitle, REPRESENTATIVE_URL AS representativeUrl,
        AI_SUMMARY_JSON AS aiSummary, SAVED_AT AS savedAt
       FROM USER_SAVED_CASE WHERE USER_ID = ? ORDER BY SAVED_AT DESC, SAVED_CASE_ID DESC`,
      [req.authUserId],
    );
    return res.json({ success: true, savedCases: rows.map(toSavedCase) });
  } catch (error) {
    console.error("저장 과거 사례 조회 실패:", error.message);
    return res.status(500).json({ success: false, message: "저장한 과거 사례를 불러오지 못했습니다." });
  }
}

async function getSavedCaseStatus(req, res) {
  const caseKeys = [...new Set((Array.isArray(req.body.caseKeys) ? req.body.caseKeys : [])
    .map((value) => String(value || "").trim()).filter((value) => value && value.length <= 255))].slice(0, 50);

  if (caseKeys.length === 0) return res.json({ success: true, caseKeys: [] });

  try {
    const [rows] = await pool.query(
      "SELECT CASE_KEY AS caseKey FROM USER_SAVED_CASE WHERE USER_ID = ? AND CASE_KEY IN (?)",
      [req.authUserId, caseKeys],
    );
    return res.json({ success: true, caseKeys: rows.map((row) => row.caseKey) });
  } catch (error) {
    console.error("저장 과거 사례 상태 조회 실패:", error.message);
    return res.status(500).json({ success: false, message: "저장 상태를 확인하지 못했습니다." });
  }
}

async function deleteSavedCase(req, res) {
  const savedCaseId = positiveInteger(req.params.savedCaseId);
  if (!savedCaseId) return res.status(400).json({ success: false, message: "삭제할 사례 정보가 올바르지 않습니다." });

  try {
    const [result] = await pool.query(
      "DELETE FROM USER_SAVED_CASE WHERE SAVED_CASE_ID = ? AND USER_ID = ?",
      [savedCaseId, req.authUserId],
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "삭제할 저장 사례를 찾을 수 없습니다." });
    return res.json({ success: true, message: "저장한 과거 사례를 삭제했습니다." });
  } catch (error) {
    console.error("저장 과거 사례 삭제 실패:", error.message);
    return res.status(500).json({ success: false, message: "저장한 과거 사례를 삭제하지 못했습니다." });
  }
}

async function deleteSavedCaseByKey(req, res) {
  const caseKey = String(req.params.caseKey || "").trim();
  if (!caseKey || caseKey.length > 255) return res.status(400).json({ success: false, message: "삭제할 사례 정보가 올바르지 않습니다." });

  try {
    const [result] = await pool.query(
      "DELETE FROM USER_SAVED_CASE WHERE USER_ID = ? AND CASE_KEY = ?",
      [req.authUserId, caseKey],
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "삭제할 저장 사례를 찾을 수 없습니다." });
    return res.json({ success: true, message: "저장한 과거 사례를 삭제했습니다." });
  } catch (error) {
    console.error("저장 과거 사례 삭제 실패:", error.message);
    return res.status(500).json({ success: false, message: "저장한 과거 사례를 삭제하지 못했습니다." });
  }
}

module.exports = { createSavedCase, getSavedCases, getSavedCaseStatus, deleteSavedCase, deleteSavedCaseByKey };
