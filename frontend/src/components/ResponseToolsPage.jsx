import { useCallback, useEffect, useState } from "react";
import Header from "./Header";
import { ROUTES } from "../config/routes";
import { CASE_TYPE_OPTIONS } from "../data/caseTypeOptions";
import { fetchSimilarCases } from "../services/simulatorApi";
import "./ResponseToolsPage.css";
import "./CaseSimulator.css";
import { api } from "../config/api";

const documents = ["보도자료", "고객 안내문", "임직원 공지", "Q&A 문서"];

// COMPANY.INDUSTRY에 실제 저장된 산업명입니다.
const INDUSTRIES = [
  "IT·통신·플랫폼",
  "자동차·부품·타이어",
  "유통·이커머스",
  "조선",
  "반도체",
];

const DOCUMENT_GUIDES = {
  보도자료: "언론과 외부 이해관계자에게 배포할 공식 초안을 작성합니다.",
  "고객 안내문": "고객 영향과 확인 사항을 이해하기 쉽게 안내합니다.",
  "임직원 공지": "내부 구성원이 알아야 할 상황과 행동 기준을 정리합니다.",
  "Q&A 문서": "예상 질문에 대한 일관된 답변 기준을 작성합니다.",
};

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
                  ? RISK_TYPE_LABELS[similarCase.riskType] ||
                    similarCase.riskType
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

  // 실제 DB 산업명으로 시작합니다.
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [selectedIssueIndex, setSelectedIssueIndex] = useState(0);

  // 산업별 이슈 API 응답을 저장합니다.
  const [issues, setIssues] = useState([]);
  const [isIssueLoading, setIsIssueLoading] = useState(false);
  const [issueLoadError, setIssueLoadError] = useState("");

  // 꼭 필요한 요청만 사용자가 선택적으로 작성합니다.
  const [additionalRequest, setAdditionalRequest] = useState("");

  // AI 생성 진행 상태와 결과
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [draft, setDraft] = useState(null);

  // 산업을 선택하면 실제 DB 기반 감지 이슈를 불러옵니다.
  useEffect(() => {
    if (activeMode === "simulator") return undefined;

    let isMounted = true;

    async function loadIndustryIssues() {
      setIsIssueLoading(true);
      setIssueLoadError("");
      setSelectedIssueIndex(0);

      try {
        const response = await api.get("/api/news/industry-issues", {
          params: { industry },
        });

        if (!isMounted) return;

        setIssues(response.data.issues || []);
      } catch (error) {
        if (!isMounted) return;

        setIssues([]);
        setIssueLoadError(
          error.response?.data?.message ||
            "산업별 분석 이슈를 불러오지 못했습니다.",
        );
      } finally {
        if (isMounted) setIsIssueLoading(false);
      }
    }

    loadIndustryIssues();

    return () => {
      isMounted = false;
    };
  }, [activeMode, industry]);

  const handleGenerate = async () => {
    // 현재 선택된 산업 이슈 정보를 가져옵니다.

    if (!selectedIssue) {
      setGenerateError("산업 이슈를 선택해주세요.");
      return;
    }

    setIsGenerating(true);
    setGenerateError("");
    setDraft(null);

    try {
      const response = await api.post("/api/response-drafts", {
        documentType: document,
        issueName: selectedIssue.issueName,
        industry,

        // 실제 기사 수와 위험도를 함께 AI에 전달합니다.
        analysisText: [
          selectedIssue.summary,
          `관련 기사 수: ${selectedIssue.articleCount}건`,
          `위험도: ${selectedIssue.risk}`,
          selectedIssue.riskReason,
          additionalRequest.trim()
            ? `추가 요청: ${additionalRequest.trim()}`
            : "",
        ]
          .filter(Boolean)
          .join("\n"),

        // 나중에 생성 결과 아래 참고 기사로 표시할 실제 기사입니다.
        referenceArticles: selectedIssue.referenceArticles || [],
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

  // API에서 받은 이슈 중 사용자가 선택한 항목입니다.
  const selectedIssue = issues[selectedIssueIndex] || null;

  const riskClass = {
    관심: "interest",
    주의: "caution",
    경계: "warning",
    심각: "critical",
  }[selectedIssue?.risk];

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
              onShowDetails={() =>
                setIsCaseDetailVisible((visible) => !visible)
              }
              errorMessage={caseError}
              displayValue={displayValue}
              displayIncidentDate={formatIncidentDate}
            />
          </>
        ) : (
          <section className="tool-card generator-card">
            <div className="generator-card-header">
              <span>AI 초안 생성</span>
              <p>
                분석된 산업 이슈를 바탕으로 실무용 대응자료 초안을 생성합니다.
              </p>
            </div>

            {/* 01. 산업과 이슈 선택 */}
            <section className="generator-step">
              <div className="step-heading">
                <div className="step-title-row">
                  <b>01</b>
                  <h2>이슈 선택</h2>
                </div>
                <p>대응할 산업과 감지된 이슈를 선택하세요.</p>
              </div>

              <div className="generator-selection-grid">
                <label>
                  대상 산업
                  <select
                    value={industry}
                    onChange={(event) => setIndustry(event.target.value)}
                  >
                    {INDUSTRIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  감지된 이슈
                  <select
                    value={selectedIssueIndex}
                    disabled={isIssueLoading || issues.length === 0}
                    onChange={(event) =>
                      setSelectedIssueIndex(Number(event.target.value))
                    }
                  >
                    {isIssueLoading && (
                      <option>이슈를 불러오는 중입니다.</option>
                    )}

                    {!isIssueLoading && issues.length === 0 && (
                      <option>등록된 분석 이슈가 없습니다.</option>
                    )}

                    {issues.map((item, index) => (
                      <option key={item.issueId} value={index}>
                        {item.issueName}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {issueLoadError && (
                <p className="issue-load-error">{issueLoadError}</p>
              )}
            </section>

            {/* 선택 이슈의 분석 결과를 보여주는 카드 */}
            {selectedIssue && (
              <section className="issue-insight-card">
                <div className="issue-insight-header">
                  <div>
                    <span>이슈 분석</span>
                    <h3>{selectedIssue.issueName}</h3>
                  </div>

                  <strong className={`risk-badge risk-${riskClass}`}>
                    위험도 {selectedIssue.risk}
                  </strong>
                </div>

                <p>{selectedIssue.summary}</p>

                {/* 위험도 라벨만 보여주지 않고 판단 기준도 함께 제공합니다. */}
                <p className="risk-reason">
                  <b>판단 근거</b>
                  {selectedIssue.riskReason}
                </p>

                <div className="insight-metrics">
                  <div>
                    <span>대상 산업</span>
                    <strong>{industry}</strong>
                  </div>
                  <div>
                    <span>관련 기사</span>
                    <strong>
                      {selectedIssue.articleCount.toLocaleString()}건
                    </strong>
                  </div>
                  <div>
                    <span>분석 기간</span>
                    <strong>
                      {selectedIssue.startDate} ~ {selectedIssue.lastDate}
                    </strong>
                  </div>
                </div>

                <div className="keyword-tags">
                  {selectedIssue.keywords.map((keyword) => (
                    <span key={keyword}>#{keyword}</span>
                  ))}
                </div>
              </section>
            )}

            {/* 02. 문서 유형 선택 */}
            <section className="generator-step document-setting-step">
              <div className="step-heading">
                <div className="step-title-row">
                  <b>02</b>
                  <h2>문서 작성 설정</h2>
                </div>
                <p>작성 목적에 맞는 문서 유형을 선택하세요.</p>
              </div>

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

              <p className="document-guide">{DOCUMENT_GUIDES[document]}</p>
            </section>

            {/* 03. 선택 입력 */}
            <section className="generator-step request-step">
              <div className="step-heading">
                <div className="step-title-row">
                  <b>03</b>
                  <h2>추가 요청</h2>
                </div>
                <p>필요한 경우에만 작성하세요.</p>
              </div>

              <label>
                {/* 라벨과 선택 표시를 한 줄에 정렬합니다. */}
                <span className="field-label">
                  추가 요청사항
                  <em>선택</em>
                </span>

                <textarea
                  value={additionalRequest}
                  onChange={(event) => setAdditionalRequest(event.target.value)}
                  placeholder="예: 고객 불안을 줄이는 표현과 재발 방지 계획을 포함해 주세요."
                />
              </label>
            </section>

            <button
              type="button"
              className={`primary-action ${isGenerating ? "is-loading" : ""}`}
              onClick={handleGenerate}
              disabled={isGenerating || isIssueLoading || !selectedIssue}
            >
              {isGenerating ? (
                <>
                  {/* 생성 중임을 보여주는 회전 표시 */}
                  <span className="generate-spinner" aria-hidden="true" />
                  AI 초안 생성 중...
                </>
              ) : (
                "AI 초안 생성하기"
              )}
            </button>

            {generateError && <p className="generate-error">{generateError}</p>}

            {draft && (
              <div className="generated-draft">
                <b>{draft.documentType} 초안이 준비되었습니다.</b>

                <div className="draft-content">
                  {draft.draftResponse.split("\n").map((line, index) => {
                    const text = line.trim();

                    if (!text) return null;

                    if (text.startsWith("## ")) {
                      return <h3 key={index}>{text.replace("## ", "")}</h3>;
                    }

                    if (text.startsWith("- ")) {
                      return (
                        <p className="draft-bullet" key={index}>
                          {text.replace("- ", "")}
                        </p>
                      );
                    }

                    return <p key={index}>{text}</p>;
                  })}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
export default ResponseToolsPage;
