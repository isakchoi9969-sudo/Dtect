import { useEffect, useState } from "react";

const TEST_CODE = "123456";

export default function CompanyVerificationModal({
  open,
  companies,
  companiesLoading = false,
  initialCompanyId = "",
  initialEmail = "",
  onCancel,
  onVerified,
}) {
  const [companyId, setCompanyId] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("form");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setCompanyId(String(initialCompanyId || ""));
    setEmail(initialEmail);
    setStep("form");
    setCode("");
    setError("");
  }, [open, initialCompanyId, initialEmail]);

  if (!open) return null;

  const selectedCompany = companies.find(
    (company) => String(company.companyId) === String(companyId),
  );

  const sendCode = () => {
    if (!selectedCompany) return setError("소속 기업을 선택해 주세요.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError("올바른 이메일 주소를 입력해 주세요.");
    }
    setError("");
    setStep("code");
  };

  const verifyCode = () => {
    if (code !== TEST_CODE) return setError("인증번호가 일치하지 않습니다.");
    setError("");
    setStep("success");
  };

  return (
    <div className="company-verification-backdrop" role="presentation">
      <section className="company-verification-modal" role="dialog" aria-modal="true" aria-labelledby="company-verification-title">
        {step === "success" ? (
          <>
            <p>COMPANY VERIFICATION</p>
            <h2 id="company-verification-title">✓ 기업 인증이 완료되었습니다.</h2>
            <div className="company-verification-result">
              <strong>{selectedCompany?.companyName}</strong>
              <span>{email}</span>
            </div>
            <div className="company-verification-actions">
              <button type="button" className="is-primary" onClick={() => onVerified({ companyId, email })}>확인</button>
            </div>
          </>
        ) : (
          <>
            <p>COMPANY VERIFICATION</p>
            <h2 id="company-verification-title">기업 인증</h2>
            <span>기업회원 이용을 위해 소속 기업과 사내 이메일을 확인해 주세요.</span>
            <label>
              소속 기업
              <select value={companyId} disabled={companiesLoading} onChange={(event) => setCompanyId(event.target.value)}>
                <option value="">{companiesLoading ? "기업 목록을 불러오는 중..." : "소속 기업을 선택하세요"}</option>
                {companies.map((company) => <option key={company.companyId} value={company.companyId}>{company.companyName}</option>)}
              </select>
            </label>
            <label>
              사내 이메일
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" />
            </label>
            {step === "code" && (
              <>
                <strong className="company-verification-test-code">테스트 인증번호 : {TEST_CODE}</strong>
                <label>
                  인증번호
                  <input inputMode="numeric" maxLength="6" value={code} onChange={(event) => setCode(event.target.value)} placeholder="인증번호 6자리" />
                </label>
              </>
            )}
            {error && <p className="company-verification-error" role="alert">{error}</p>}
            <div className="company-verification-actions">
              <button type="button" onClick={onCancel}>취소</button>
              <button type="button" className="is-primary" onClick={step === "code" ? verifyCode : sendCode}>{step === "code" ? "인증하기" : "인증번호 발송"}</button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
