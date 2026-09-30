const nodemailer = require("nodemailer");

// Gmail 계정으로 메일을 발송하는 설정입니다.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// 메일 본문에 들어갈 텍스트를 안전하게 처리합니다.
function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character],
  );
}

/**
 * 위험도 급상승 알림 메일을 발송합니다.
 */
async function sendRiskSurgeAlertEmail({
  to,
  userName,
  companyName,
  riskLevel,
  riskScore,
  detectedAt,
}) {
  // 이메일 주소 또는 Gmail 설정이 없으면 발송하지 않습니다.
  if (!to || !process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("[알림 메일] Gmail 설정 또는 수신자 이메일이 없습니다.");
    return;
  }

  const safeUserName = escapeHtml(userName || "회원");
  const safeCompanyName = escapeHtml(companyName);
  const safeRiskLevel = escapeHtml(riskLevel);

  await transporter.sendMail({
    from: `"D:TECT Alerts" <${process.env.GMAIL_USER}>`,
    to,
    subject: `[D:TECT] ${companyName} 위험도 급상승 알림`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #172033; line-height: 1.6;">
        <h2 style="margin-bottom: 16px;">위험도 급상승 알림</h2>
        <p>${safeUserName}님,</p>
        <p>
          관심기업 <strong>${safeCompanyName}</strong>의 종합 리스크가
          <strong>${safeRiskLevel}</strong> 단계로 급상승했습니다.
        </p>

        <div style="margin: 20px 0; padding: 16px; border-radius: 10px; background: #f4f8fc;">
          <p style="margin: 0 0 6px;">
            종합 리스크 점수: <strong>${Number(riskScore ?? 0).toFixed(0)}점</strong>
          </p>
          <p style="margin: 0;">
            분석 시각: ${escapeHtml(detectedAt)}
          </p>
        </div>

        <p>D:TECT 웹사이트의 위험도 급상승 알림에서 상세 내용을 확인해주세요.</p>
      </div>
    `,
  });
}

module.exports = {
  sendRiskSurgeAlertEmail,
};
