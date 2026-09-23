import { useState } from "react";
import Header from "./Header";
import { useCallback } from "react";
import { ROUTES } from "../config/routes";
import { CASE_TYPE_OPTIONS } from "../data/caseTypeOptions";
import { fetchSimilarCases } from "../services/simulatorApi";
import "./ResponseToolsPage.css";
import "./CaseSimulator.css";
import { api } from "../config/api";
const documents = ["보도자료", "고객 안내문", "임직원 공지", "Q&A 문서"];
const RISK_TYPE_LABELS = {
  ACCIDENT: "사건·사고",
  REGULATION: "규제",
  LABOR: "노사",
  PERFORMANCE: "실적",
  MANAGEMENT: "경영",
  REPUTATION: "평판",
};

function formatDate(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}. ${match[2]}. ${match[3]}.` : "정보 준비 중";
}

function formatIncidentDate(startDate) {
  return startDate ? formatDate(startDate) : "정보 준비 중";
}

function CurrentIssueContext({
  currentIssue,
  caseType,
  onChange,
  onCaseTypeChange,
  onSearch,
  isSearching,
}) {
  const canSearch =
    currentIssue.name.trim() || caseType.major || caseType.minor;
  const selectedMajor = CASE_TYPE_OPTIONS.find(
    (item) => item.major === caseType.major,
  );
  const minorOptions = selectedMajor ? selectedMajor.minors : [];

  return (
    <section className="current-issue-context">
      <span>CURRENT ISSUE</span>
      <h2>현재 분석 이슈</h2>
      <label>
        이슈명
        <input
          type="text"
          value={currentIssue.name}
          onChange={(event) =>
            onChange({ ...currentIssue, name: event.target.value })
          }
          placeholder="예: 개인정보 유출"
        />
      </label>
      <div className="case-type-selectors" aria-label="사례 유형 선택">
        <span>사례 유형</span>
        <div>
          <label>
            대분류
            <select
              value={caseType.major}
              onChange={(event) =>
                onCaseTypeChange({ major: event.target.value, minor: "" })
              }
            >
              <option value="">대분류를 선택하세요</option>
              {CASE_TYPE_OPTIONS.map((item) => (
                <option key={item.major} value={item.major}>
                  {item.major}
                </option>
              ))}
            </select>
          </label>
          <label>
            소분류
            <select
              value={caseType.minor}
              disabled={!caseType.major}
              onChange={(event) =>
                onCaseTypeChange({ ...caseType, minor: event.target.value })
              }
            >
              <option value="">
                {caseType.major
                  ? "소분류를 선택하세요"
                  : "대분류를 먼저 선택하세요"}
              </option>
              {minorOptions.map((minor) => (
                <option key={minor} value={minor}>
                  {minor}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <button
        type="button"
        className="primary-action"
        onClick={onSearch}
        disabled={!canSearch || isSearching}
      >
        {isSearching ? "유사 사례를 찾는 중…" : "유사 사례 검색"}
      </button>
      <p>
        입력한 이슈명 또는 선택한 사례 유형을 기준으로 저장된 과거 유사사례를
        검색합니다.
      </p>
    </section>
  );
}

function SimulatorContent({
  status,
  cases,
  selectedCase,
  onSelect,
  showDetails,
  onShowDetails,
  errorMessage,
  displayValue,
  displayIncidentDate,
}) {
  if (status === "idle") {
    return (
      <section className="case-status">
        현재 이슈를 입력한 뒤 유사 사례를 검색해 주세요.
      </section>
    );
  }

  if (status === "loading") {
    return (
      <section className="case-status" role="status">
        유사 사례를 찾는 중입니다…
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="case-status case-status-error" role="alert">
        {errorMessage || "유사 사례를 불러오지 못했습니다."}
      </section>
    );
  }

  if (cases.length === 0) {
    return (
      <section className="case-status">
        조건에 맞는 과거 사례가 없습니다.
      </section>
    );
  }

  const renderCaseDetails = (similarCase) => (
    <div className="tool-card simulation-result">
      <span>SIMILAR CASE</span>
      <h2>{similarCase.issueName}</h2>
      <p>{similarCase.description}</p>
      <button
        type="button"
        className="case-detail-trigger"
        onClick={onShowDetails}
        aria-expanded={showDetails}
      >
        {showDetails ? "상세 내용 닫기" : "상세 내용 보기"}
      </button>
      {showDetails && (
        <>
          <div className="case-detail-grid">
            <div>
              <span>기업</span>
              <strong>{displayValue(similarCase.companyName)}</strong>
            </div>
            <div>
              <span>업종</span>
              <strong>{displayValue(similarCase.industry)}</strong>
            </div>
            <div>
              <span>리스크 유형</span>
              <strong>
                {similarCase.riskType
                  ? RISK_TYPE_LABELS[similarCase.riskType] || similarCase.riskType
                  : "정보 준비 중"}
              </strong>
            </div>
            <div>
              <span>사건 발생일</span>
              <strong>{displayIncidentDate(similarCase.startDate)}</strong>
            </div>
            <div>
              <span>지속기간</span>
              <strong>
                {similarCase.durationDays == null
                  ? "정보 준비 중"
                  : `약 ${similarCase.durationDays}일`}
              </strong>
            </div>
            <div>
              <span>관련 기사</span>
              <strong>
                {similarCase.articleCount == null
                  ? "정보 준비 중"
                  : `${similarCase.articleCount}건`}
              </strong>
            </div>
          </div>
          <div className="representative-news">
            <span>대표기사</span>
            <strong>{displayValue(similarCase.representativeTitle)}</strong>
          </div>
        </>
      )}
    </div>
  );

  const selectedSimilarCase = cases[selectedCase] || cases[0];

  return (
    <section className="tool-grid">
      <div className="tool-card case-library-card">
        <span>CASE LIBRARY</span>
        <h2>유사 사례를 선택하세요</h2>
        <div className="case-options">
          {cases.map((item, index) => (
            <div className="case-option" key={`${item.issueName}-${index}`}>
              <button
                type="button"
                className={selectedCase === index ? "selected" : ""}
                onClick={() => onSelect(index)}
                aria-pressed={selectedCase === index}
              >
                <span>{item.issueName}</span>
                <i aria-hidden="true">›</i>
              </button>
            </div>
          ))}
        </div>
      </div>
      {renderCaseDetails(selectedSimilarCase)}
    </section>
  );
}
function ResponseToolsPage({ mode }) {
  const [activeMode, setActiveMode] = useState(mode);
  const [selectedCase, setSelectedCase] = useState(0);
  const [isCaseDetailVisible, setIsCaseDetailVisible] = useState(false);
  const [currentIssue, setCurrentIssue] = useState({ name: "" });
  const [caseType, setCaseType] = useState({ major: "", minor: "" });
  const [similarCases, setSimilarCases] = useState([]);
  const [caseLoadStatus, setCaseLoadStatus] = useState("idle");
  const [caseError, setCaseError] = useState("");
  const [document, setDocument] = useState(documents[0]);
  // 현재 입력 중인 핵심 상황
  const [analysisText, setAnalysisText] = useState(
    "공급망 이슈와 관련한 고객 문의가 증가하고 있습니다.",
  );

  // AI 생성 진행 상태와 결과
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [draft, setDraft] = useState(null);

  const handleGenerate = async () => {
    if (!analysisText.trim()) {
      setGenerateError("핵심 상황을 입력해주세요.");
      return;
    }

    setIsGenerating(true);
    setGenerateError("");
    setDraft(null);

    try {
      const response = await api.post("/api/response-drafts", {
        documentType: document,

        // 현재 디자인에는 이슈명 입력칸이 없으므로,
        // 핵심 상황 앞 50자를 테스트용 이슈명으로 보냅니다.
        issueName: analysisText.trim().slice(0, 50),

        analysisText,
      });

      setDraft(response.data.data);
    } catch (error) {
      setGenerateError(
        error.response?.data?.message || "AI 초안을 생성하지 못했습니다.",
      );
    } finally {
      setIsGenerating(false);
    }
  };
  const simulator = activeMode === "simulator";
  const displayValue = (value) => value || "정보 준비 중";

  const loadSimilarCases = useCallback(async () => {
    const title = currentIssue.name.trim();
    if (!title && !caseType.major && !caseType.minor) return;

    setCaseLoadStatus("loading");
    setCaseError("");

    try {
      const response = await fetchSimilarCases({
        title,
        majorCategory: caseType.major || null,
        minorCategory: caseType.minor || null,
      });
      if (!response.success) {
        throw new Error(response.message || "유사 사례를 불러오지 못했습니다.");
      }

      setSimilarCases(
        Array.isArray(response.similarCases) ? response.similarCases : [],
      );
      setSelectedCase(0);
      setIsCaseDetailVisible(false);
      setCaseLoadStatus("success");
    } catch (error) {
      setSimilarCases([]);
      setCaseError(error.message || "유사 사례를 불러오지 못했습니다.");
      setCaseLoadStatus("error");
    }
  }, [caseType, currentIssue]);

  const changeMode = (next) => {
    setActiveMode(next);
    window.history.pushState(
      {},
      "",
      next === "simulator" ? ROUTES.CASE_SIMULATOR : ROUTES.RESPONSE_GENERATOR,
    );
  };

  return (
    <div className="response-page">
      <Header />
      <main className="response-main">
        <p className="response-kicker">AI RESPONSE CENTER</p>
        <h1>{simulator ? "과거 사례 시뮬레이터" : "대응자료 생성"}</h1>
        <p className="response-description">
          과거 대응 사례를 참고하고, 현재 이슈에 맞는 자료 초안을 빠르게
          준비하세요.
        </p>
        <div className="response-tabs">
          <button
            type="button"
            className={simulator ? "active" : ""}
            onClick={() => changeMode("simulator")}
          >
            과거 사례 시뮬레이터
          </button>
          <button
            type="button"
            className={!simulator ? "active" : ""}
            onClick={() => changeMode("generator")}
          >
            대응자료 생성
          </button>
        </div>
        {simulator ? (
          <>
            <CurrentIssueContext
              currentIssue={currentIssue}
              caseType={caseType}
              onChange={setCurrentIssue}
              onCaseTypeChange={setCaseType}
              onSearch={loadSimilarCases}
              isSearching={caseLoadStatus === "loading"}
            />
            <SimulatorContent
              status={caseLoadStatus}
              cases={similarCases}
              selectedCase={selectedCase}
              onSelect={(index) => {
                setSelectedCase(index);
                setIsCaseDetailVisible(false);
              }}
              showDetails={isCaseDetailVisible}
              onShowDetails={() => setIsCaseDetailVisible((visible) => !visible)}
              errorMessage={caseError}
              displayValue={displayValue}
              displayIncidentDate={formatIncidentDate}
            />
          </>
        ) : (
          <section className="tool-card generator-card">
            <span>AI DOCUMENT DRAFT</span>
            <h2>대응 자료 초안을 생성하세요</h2>
            <label>
              문서 유형
              <select
                value={document}
                onChange={(event) => setDocument(event.target.value)}
              >
                {documents.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              핵심 상황
              <textarea
                value={analysisText}
                onChange={(event) => setAnalysisText(event.target.value)}
              />
            </label>

            <button
              type="button"
              className="primary-action"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? "AI 초안 생성 중..." : "AI 초안 생성하기"}
            </button>

            {generateError && <p className="generate-error">{generateError}</p>}

            {draft && (
              <div className="generated-draft">
                <b>{draft.documentType} 초안이 준비되었습니다.</b>
                <div className="draft-content">
                  {draft.draftResponse.split("\n").map((line, index) => {
                    const text = line.trim();

                    // 빈 줄은 간격으로만 사용
                    if (!text) return null;

                    // AI가 작성한 ## 제목은 소제목으로 표시
                    if (text.startsWith("## ")) {
                      return <h3 key={index}>{text.replace("## ", "")}</h3>;
                    }

                    // - 로 시작하는 내용은 핵심 항목처럼 표시
                    if (text.startsWith("- ")) {
                      return (
                        <p className="draft-bullet" key={index}>
                          {text.replace("- ", "")}
                        </p>
                      );
                    }

                    return <p key={index}>{text}</p>;
                  })}
                </div>{" "}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
export default ResponseToolsPage;
