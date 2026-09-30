const { generateResponseDraft } = require("../services/aiClient.service");
const { pool } = require("../db/pool");

// AI 초안을 생성하고, 로그인 사용자별 이력으로 저장합니다.
async function createResponseDraft(req, res) {
  const {
    documentType,
    issueName,
    analysisText,
    company,
    industry,
    additionalRequest,
    referenceArticles,
  } = req.body;

  if (!issueName || !analysisText) {
    return res.status(400).json({
      success: false,
      message: "이슈명과 핵심 상황을 입력해주세요.",
    });
  }

  try {
    // FastAPI AI 서버에 초안 생성 요청
    const result = await generateResponseDraft({
      document_type: documentType || "보도자료",
      issue_name: issueName,
      analysis_text: analysisText,
      company: company || "",
      industry: industry || "",
      reference_articles: Array.isArray(referenceArticles)
        ? referenceArticles.slice(0, 3)
        : [],
    });

    const draft = result.data;

    // 생성 성공한 초안을 로그인 사용자 ID와 함께 DB에 저장
    await pool.query(
      `INSERT INTO RESPONSE_DRAFT_HISTORY (
        USER_ID,
        ISSUE_NAME,
        INDUSTRY,
        DOCUMENT_TYPE,
        ANALYSIS_TEXT,
        ADDITIONAL_REQUEST,
        DRAFT_RESPONSE,
        RISK_TYPE,
        GENERATION_STATUS,
        REFERENCE_ARTICLES
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.authUserId,
        issueName,
        industry || "",
        draft.documentType || documentType || "보도자료",
        analysisText,
        additionalRequest?.trim() || null,
        draft.draftResponse,
        draft.riskType || null,
        draft.generationStatus || "generated",
        JSON.stringify(draft.referenceArticles || []),
      ],
    );

    return res.json(result);
  } catch (error) {
    const detail =
      error.response?.data?.detail ||
      error.message ||
      "AI 초안을 생성하지 못했습니다.";

    console.error("AI 대응문 생성 실패:", detail);

    return res.status(500).json({
      success: false,
      message: detail,
    });
  }
}

// 마이페이지에서 로그인 사용자의 최근 생성 이력을 조회합니다.
async function getResponseDraftHistory(req, res) {
  const requestedLimit = Number(req.query.limit);

  // 한 번에 너무 많은 이력이 노출되지 않도록 최대 20건으로 제한
  const limit = Number.isInteger(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 20)
    : 5;

  try {
    const [rows] = await pool.query(
      `SELECT
        DRAFT_ID AS draftId,
        ISSUE_NAME AS issueName,
        INDUSTRY AS industry,
        DOCUMENT_TYPE AS documentType,
        DRAFT_RESPONSE AS draftResponse,
        GENERATION_STATUS AS generationStatus,
        GENERATED_AT AS generatedAt
      FROM RESPONSE_DRAFT_HISTORY
      WHERE USER_ID = ?
      ORDER BY GENERATED_AT DESC, DRAFT_ID DESC
      LIMIT ?`,
      [req.authUserId, limit],
    );

    return res.json({
      success: true,
      drafts: rows,
    });
  } catch (error) {
    console.error("대응자료 생성 이력 조회 실패:", error.message);

    return res.status(500).json({
      success: false,
      message: "대응자료 생성 이력을 불러오지 못했습니다.",
    });
  }
}

// 로그인한 사용자가 생성한 초안만 삭제합니다.
async function deleteResponseDraft(req, res) {
  const draftId = Number(req.params.draftId);

  if (!Number.isInteger(draftId) || draftId < 1) {
    return res.status(400).json({
      success: false,
      message: "삭제할 초안 정보가 올바르지 않습니다.",
    });
  }

  try {
    // USER_ID 조건을 함께 사용해 다른 사용자의 이력은 삭제할 수 없습니다.
    const [result] = await pool.query(
      `DELETE FROM RESPONSE_DRAFT_HISTORY
       WHERE DRAFT_ID = ? AND USER_ID = ?`,
      [draftId, req.authUserId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "삭제할 초안을 찾을 수 없습니다.",
      });
    }

    return res.json({
      success: true,
      message: "저장된 초안을 삭제했습니다.",
    });
  } catch (error) {
    console.error("대응자료 생성 이력 삭제 실패:", error.message);

    return res.status(500).json({
      success: false,
      message: "초안을 삭제하지 못했습니다.",
    });
  }
}

module.exports = {
  createResponseDraft,
  getResponseDraftHistory,
  deleteResponseDraft,
};
