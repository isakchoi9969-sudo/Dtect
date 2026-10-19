const { generateResponseDraft } = require("../services/aiClient.service");
const { pool } = require("../db/pool");

function formatAiError(detail, fallback) {
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => item?.msg || item?.message)
      .filter(Boolean);
    if (messages.length) return messages.join(" ");
  }
  if (detail?.message) return String(detail.message);
  return fallback;
}

// 사용자가 입력한 상황과 공식 대응자료 RAG 결과를 사용자별 이력으로 저장합니다.
async function createResponseDraft(req, res) {
  const {
    company,
    situation,
    documentType,
    currentActions,
    additionalRequest,
  } = req.body;

  if (!company?.trim() || !situation?.trim()) {
    return res.status(400).json({
      success: false,
      message: "기업명과 현재 상황을 입력해주세요.",
    });
  }

  try {
    const result = await generateResponseDraft({
      company: company.trim(),
      situation: situation.trim(),
      document_type: documentType || "보도자료",
      current_actions: currentActions?.trim() || "",
      additional_request: additionalRequest?.trim() || "",
    });
    const draft = result.data;
    const savedRequest = [
      currentActions?.trim() && `[현재 조치]\n${currentActions.trim()}`,
      additionalRequest?.trim() && `[추가 요청]\n${additionalRequest.trim()}`,
    ].filter(Boolean).join("\n\n") || null;

    // 기존 테이블 구조를 유지합니다. INDUSTRY와 REFERENCE_ARTICLES는
    // 대응자료 이력에서 각각 기업명과 참고 공식 사례 저장소로 재활용합니다.
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [
        req.authUserId,
        situation.trim().slice(0, 255),
        company.trim(),
        draft.documentType || documentType || "보도자료",
        situation.trim(),
        savedRequest,
        draft.draftResponse,
        draft.incidentType || null,
        draft.generationStatus || "generated",
        JSON.stringify(draft.referenceCases || []),
      ],
    );

    return res.json(result);
  } catch (error) {
    const upstreamStatus = error.response?.status;
    const detail = formatAiError(
      error.response?.data?.detail,
      error.message || "AI 초안을 생성하지 못했습니다.",
    );

    console.error("AI 대응문 생성 실패:", detail);
    return res.status(upstreamStatus === 422 ? 422 : 500).json({
      success: false,
      message: detail,
    });
  }
}

// 마이페이지에서 로그인 사용자의 최근 생성 이력을 조회합니다.
async function getResponseDraftHistory(req, res) {
  const requestedLimit = Number(req.query.limit);
  const limit = Number.isInteger(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 20)
    : 5;

  try {
    const [rows] = await pool.query(
      `SELECT
        DRAFT_ID AS draftId,
        ISSUE_NAME AS issueName,
        INDUSTRY AS company,
        DOCUMENT_TYPE AS documentType,
        ANALYSIS_TEXT AS situation,
        ADDITIONAL_REQUEST AS additionalRequest,
        RISK_TYPE AS incidentType,
        DRAFT_RESPONSE AS draftResponse,
        GENERATION_STATUS AS generationStatus,
        GENERATED_AT AS generatedAt
      FROM RESPONSE_DRAFT_HISTORY
      WHERE USER_ID = ?
      ORDER BY GENERATED_AT DESC, DRAFT_ID DESC
      LIMIT ?`,
      [req.authUserId, limit],
    );

    return res.json({ success: true, drafts: rows });
  } catch (error) {
    console.error("대응자료 생성 이력 조회 실패:", error.message);
    return res.status(500).json({
      success: false,
      message: "대응자료 생성 이력을 불러오지 못했습니다.",
    });
  }
}

async function deleteResponseDraft(req, res) {
  const draftId = Number(req.params.draftId);
  if (!Number.isInteger(draftId) || draftId < 1) {
    return res.status(400).json({ success: false, message: "삭제할 초안 정보가 올바르지 않습니다." });
  }

  try {
    const [result] = await pool.query(
      `DELETE FROM RESPONSE_DRAFT_HISTORY WHERE DRAFT_ID = ? AND USER_ID = ?`,
      [draftId, req.authUserId],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "삭제할 초안을 찾을 수 없습니다." });
    }
    return res.json({ success: true, message: "저장된 초안을 삭제했습니다." });
  } catch (error) {
    console.error("대응자료 생성 이력 삭제 실패:", error.message);
    return res.status(500).json({ success: false, message: "초안을 삭제하지 못했습니다." });
  }
}

module.exports = { createResponseDraft, getResponseDraftHistory, deleteResponseDraft };
