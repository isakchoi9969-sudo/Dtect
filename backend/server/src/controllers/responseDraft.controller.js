// 프론트 요청을 받아 FastAPI AI 서버로 전달하는 컨트롤러입니다.

const { generateResponseDraft } = require("../services/aiClient.service");

async function createResponseDraft(req, res) {
  const { documentType, issueName, analysisText, company, industry } = req.body;

  // 프론트 입력값 검증
  if (!issueName || !analysisText) {
    return res.status(400).json({
      success: false,
      message: "이슈명과 핵심 상황을 입력해주세요.",
    });
  }

  try {
    const result = await generateResponseDraft({
      document_type: documentType || "보도자료",
      issue_name: issueName,
      analysis_text: analysisText,
      company: company || "",
      industry: industry || "",
    });

    // 생성 성공 여부는 사용자 화면이 아닌 Node 터미널에서만 확인합니다.
    console.log(
      `[대응자료 생성] 상태: ${result.data?.generationStatus || "unknown"}`,
    );

    return res.json(result);
  } catch (error) {
    // FastAPI가 전달한 실제 오류를 화면에서도 확인할 수 있게 합니다.
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

module.exports = { createResponseDraft };
