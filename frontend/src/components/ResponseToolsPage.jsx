import { useCallback, useState } from "react";
import Header from "./Header";
import { CASE_TYPE_OPTIONS } from "../data/caseTypeOptions";
import { fetchCaseSummary, fetchSimilarCases } from "../services/simulatorApi";
import {
  deleteSavedCaseByKey,
  fetchSavedCaseStatus,
  saveHistoricalCase,
} from "../services/savedCaseApi";
import "./ResponseToolsPage.css";
import "./CaseSimulator.css";
import { api } from "../config/api";

const documents = ["보도자료", "사과문", "고객 안내문", "임직원 공지", "Q&A 문서"];

const DOCUMENT_GUIDES = {
  보도자료: "언론과 외부 이해관계자에게 배포할 공식 초안을 작성합니다.",
  사과문: "유감과 사과, 현재 사실과 조치를 담은 공식문을 작성합니다.",
  "고객 안내문": "고객 영향과 확인 사항을 이해하기 쉽게 안내합니다.",
  "임직원 공지": "내부 구성원이 알아야 할 상황과 행동 기준을 정리합니다.",
  "Q&A 문서": "예상 질문 10개와 일관된 답변 기준을 작성합니다.",
};

const RISK_TYPE_LABELS = {
  ACCIDENT: "사건·사고",
  REGULATION: "규제",
  LABOR: "노사",
  PERFORMANCE: "실적",
  MANAGEMENT: "경영",
  REPUTATION: "평판",
};

function getErrorMessage(value, fallback) {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value)) {
    const messages = value
      .map((item) => item?.msg || item?.message)
      .filter(Boolean);
    if (messages.length) return messages.join(" ");
  }
  if (value?.message) return String(value.message);
  return fallback;
}

function GeneratedDraftContent({ documentType, content }) {
  const lines = String(content || "").split("\n");

  if (documentType === "보도자료" || documentType === "사과문") {
    return (
      <div className="draft-content press-release-content">
        {lines.map((line, index) => {
          const text = line.trim();
          if (!text) return null;
          if (text.startsWith("# ")) {
            return <h2 key={index}>{text.replace("# ", "")}</h2>;
          }
          return <p key={index}>{text}</p>;
        })}
      </div>
    );
  }

  return (
    <div className="draft-content">
      {lines.map((line, index) => {
        const text = line.trim();
        if (!text) return null;
        if (text.startsWith("## ")) return <h3 key={index}>{text.replace("## ", "")}</h3>;
        if (text.startsWith("- ")) return <p className="draft-bullet" key={index}>{text.replace("- ", "")}</p>;
        return <p key={index}>{text}</p>;
      })}
    </div>
  );
}

function formatDate(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}. ${match[2]}. ${match[3]}.` : "정보 준비 중";
}

function formatIncidentDate(startDate) {
  return startDate ? formatDate(startDate) : "정보 준비 중";
}

function getCaseSummaryKey(similarCase) {
  return similarCase.caseId
    ? `case-${similarCase.caseId}`
    : `news-${similarCase.representativeNewsId || similarCase.caseTitle}`;
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
  savedCaseKeys,
  onSaveCase,
  onRequestUnsave,
  pendingUnsaveCase,
  onCancelUnsave,
  onConfirmUnsave,
  saveLoadingKey,
  saveError,
  caseSummaries,
  summaryLoadingKey,
  summaryErrors,
  onRequestSummary,
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

  const renderCaseDetails = (similarCase) => {
    const savedCaseKey = getCaseSummaryKey(similarCase);
    const isSaved = savedCaseKeys.has(savedCaseKey);

    return (
      <div className="tool-card simulation-result">
        <div className="similar-case-label">
          <span>SIMILAR CASE</span>
          <button
            type="button"
            className={isSaved ? "case-save-toggle saved" : "case-save-toggle"}
            onClick={() =>
              isSaved ? onRequestUnsave(similarCase) : onSaveCase(similarCase)
            }
            disabled={saveLoadingKey === savedCaseKey}
            aria-label={isSaved ? "내 사례 저장 취소" : "내 사례에 저장"}
            aria-pressed={isSaved}
            title={isSaved ? "내 사례 저장 취소" : "내 사례에 저장"}
          >
            <span aria-hidden="true">{isSaved ? "♥" : "♡"}</span>
          </button>
        </div>
        <h2>{similarCase.caseTitle || similarCase.issueName}</h2>
        {saveError && <p className="ai-case-summary-error">{saveError}</p>}
        <section className="ai-case-summary" aria-live="polite">
          <span>AI CASE SUMMARY</span>
          {(() => {
            const summaryKey = getCaseSummaryKey(similarCase);
            const summary = caseSummaries[summaryKey];
            const error = summaryErrors[summaryKey];
            const isLoading = summaryLoadingKey === summaryKey;

            if (summary) {
              const sections = [
                ["사건 개요", [summary.overview]],
                ["발생 원인", summary.confirmed_causes],
                ["당시 대응", summary.actions_taken],
                ["향후 대응", summary.recommended_actions],
                ["확인 필요", summary.uncertainties],
              ].filter(([, items]) => items?.filter(Boolean).length > 0);

              return (
                <div className="ai-case-summary-content">
                  {sections.map(([heading, items]) => (
                    <div key={heading}>
                      <strong>{heading}</strong>
                      <ul>
                        {items.filter(Boolean).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              );
            }

            return (
              <>
                <p>
                  사건 개요, 발생 원인, 당시 대응과 향후 대응을 기사 근거로
                  정리합니다.
                </p>
                {error && <p className="ai-case-summary-error">{error}</p>}
                <button
                  type="button"
                  className="case-summary-trigger"
                  onClick={() => onRequestSummary(similarCase)}
                  disabled={
                    isLoading || similarCase.sourceArticles?.length === 0
                  }
                >
                  {isLoading ? "AI 사건 요약 생성 중…" : "AI 사건 요약 보기"}
                </button>
              </>
            );
          })()}
        </section>
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
              {similarCase.representativeUrl ? (
                <a
                  href={similarCase.representativeUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {displayValue(similarCase.representativeTitle)}
                </a>
              ) : (
                <strong>{displayValue(similarCase.representativeTitle)}</strong>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const selectedSimilarCase = cases[selectedCase] || cases[0];

  return (
    <>
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
                  <span>{item.caseTitle || item.issueName}</span>
                  <i aria-hidden="true">›</i>
                </button>
              </div>
            ))}
          </div>
        </div>
        {renderCaseDetails(selectedSimilarCase)}
      </section>
      {pendingUnsaveCase && (
        <div className="case-unsave-modal-backdrop" role="presentation">
          <section
            className="case-unsave-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-unsave-title"
          >
            <h3 id="case-unsave-title">저장한 과거 사례를 취소할까요?</h3>
            <p>
              <strong>
                {pendingUnsaveCase.caseTitle || pendingUnsaveCase.issueName}
              </strong>
              가 마이페이지의 저장 목록에서 삭제됩니다.
            </p>
            <div className="case-unsave-modal-actions">
              <button type="button" onClick={onCancelUnsave}>
                취소
              </button>
              <button
                type="button"
                onClick={onConfirmUnsave}
                disabled={
                  saveLoadingKey === getCaseSummaryKey(pendingUnsaveCase)
                }
              >
                {saveLoadingKey === getCaseSummaryKey(pendingUnsaveCase)
                  ? "처리 중…"
                  : "저장 취소"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
function ResponseToolsPage({ mode }) {
  const [selectedCase, setSelectedCase] = useState(0);
  const [isCaseDetailVisible, setIsCaseDetailVisible] = useState(false);
  const [currentIssue, setCurrentIssue] = useState({ name: "" });
  const [caseType, setCaseType] = useState({ major: "", minor: "" });
  const [similarCases, setSimilarCases] = useState([]);
  const [caseLoadStatus, setCaseLoadStatus] = useState("idle");
  const [caseError, setCaseError] = useState("");
  const [savedCaseKeys, setSavedCaseKeys] = useState(() => new Set());
  const [pendingUnsaveCase, setPendingUnsaveCase] = useState(null);
  const [saveLoadingKey, setSaveLoadingKey] = useState("");
  const [saveError, setSaveError] = useState("");
  const [caseSummaries, setCaseSummaries] = useState({});
  const [summaryLoadingKey, setSummaryLoadingKey] = useState("");
  const [summaryErrors, setSummaryErrors] = useState({});
  const [document, setDocument] = useState(documents[0]);

  // 사용자가 알고 있는 현재 사실만 입력받습니다.
  const [company, setCompany] = useState("");
  const [situation, setSituation] = useState("");
  const [currentActions, setCurrentActions] = useState("");
  const [additionalRequest, setAdditionalRequest] = useState("");

  // AI 생성 진행 상태와 결과
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [draft, setDraft] = useState(null);

  // 초안 복사 후 사용자에게 보여줄 안내 문구
  const [copyNotice, setCopyNotice] = useState("");

  const [isReferenceCasesOpen, setIsReferenceCasesOpen] = useState(false);

  const handleGenerate = async () => {
    if (!company.trim() || !situation.trim()) {
      setGenerateError("기업명과 현재 상황을 입력해주세요.");
      return;
    }

    setIsGenerating(true);
    setGenerateError("");
    setCopyNotice("");
    setDraft(null);
    setIsReferenceCasesOpen(false);

    try {
      const response = await api.post("/api/response-drafts", {
        company: company.trim(),
        situation: situation.trim(),
        documentType: document,
        currentActions: currentActions.trim(),
        additionalRequest: additionalRequest.trim(),
      });

      setDraft(response.data.data);
    } catch (error) {
      setGenerateError(getErrorMessage(
        error.response?.data?.message,
        "AI 초안을 생성하지 못했습니다.",
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  // 현재 생성된 초안을 클립보드에 복사합니다.
  const handleCopyDraft = async () => {
    if (!draft?.draftResponse) return;

    try {
      await navigator.clipboard.writeText(draft.draftResponse);
      setCopyNotice("초안을 클립보드에 복사했습니다.");
    } catch {
      setCopyNotice(
        "복사하지 못했습니다. 초안 내용을 직접 선택해 복사해 주세요.",
      );
    }
  };

  const simulator = mode === "simulator";
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

      const cases = Array.isArray(response.similarCases)
        ? response.similarCases
        : [];
      setSimilarCases(cases);
      setSelectedCase(0);
      setIsCaseDetailVisible(false);
      setCaseSummaries({});
      setSummaryErrors({});
      setSavedCaseKeys(new Set());
      setPendingUnsaveCase(null);
      setSaveError("");
      setCaseLoadStatus("success");

      // 검색 결과가 이미 저장된 사례인지 DB에서 확인해 하트를 정확히 표시합니다.
      fetchSavedCaseStatus(cases.map(getCaseSummaryKey))
        .then((savedResponse) => {
          if (savedResponse.success) {
            setSavedCaseKeys(new Set(savedResponse.caseKeys || []));
          }
        })
        .catch(() => setSavedCaseKeys(new Set()));
    } catch (error) {
      setSimilarCases([]);
      setCaseError(
        error.response?.data?.message ||
          error.message ||
          "유사 사례를 불러오지 못했습니다.",
      );
      setCaseLoadStatus("error");
    }
  }, [caseType, currentIssue]);

  const requestCaseSummary = useCallback(
    async (similarCase) => {
      const summaryKey = getCaseSummaryKey(similarCase);
      if (caseSummaries[summaryKey]) return caseSummaries[summaryKey];
      if (summaryLoadingKey === summaryKey) return null;

      if (!similarCase.sourceArticles?.length) {
        setSummaryErrors((previous) => ({
          ...previous,
          [summaryKey]: "요약에 사용할 기사 정보가 없습니다.",
        }));
        return null;
      }

      setSummaryLoadingKey(summaryKey);
      setSummaryErrors((previous) => ({ ...previous, [summaryKey]: "" }));
      try {
        const response = await fetchCaseSummary({
          caseTitle: similarCase.caseTitle || similarCase.issueName,
          companyName: similarCase.companyName,
          articles: similarCase.sourceArticles,
        });
        if (!response.success || !response.summary) {
          throw new Error(
            response.message || "AI 사건 요약을 생성하지 못했습니다.",
          );
        }
        setCaseSummaries((previous) => ({
          ...previous,
          [summaryKey]: response.summary,
        }));
        return response.summary;
      } catch (error) {
        setSummaryErrors((previous) => ({
          ...previous,
          [summaryKey]:
            error.response?.data?.message ||
            error.message ||
            "AI 사건 요약을 생성하지 못했습니다.",
        }));
        return null;
      } finally {
        setSummaryLoadingKey((current) =>
          current === summaryKey ? "" : current,
        );
      }
    },
    [caseSummaries, summaryLoadingKey],
  );

  const saveCase = useCallback(
    async (similarCase) => {
      const caseKey = getCaseSummaryKey(similarCase);
      setSaveLoadingKey(caseKey);
      setSaveError("");
      try {
        // 기존에 화면에서 생성한 요약을 재사용하고, 없을 때만 LLM을 호출합니다.
        const aiSummary =
          caseSummaries[caseKey] || (await requestCaseSummary(similarCase));
        if (!aiSummary)
          throw new Error("AI 사건 요약을 만든 뒤 저장할 수 있습니다.");

        const response = await saveHistoricalCase({
          caseId: similarCase.caseId,
          caseTitle: similarCase.caseTitle || similarCase.issueName,
          companyName: similarCase.companyName,
          industry: similarCase.industry,
          riskType: similarCase.riskType,
          startDate: similarCase.startDate,
          durationDays: similarCase.durationDays,
          articleCount: similarCase.articleCount,
          representativeNewsId: similarCase.representativeNewsId,
          representativeTitle: similarCase.representativeTitle,
          representativeUrl: similarCase.representativeUrl,
          aiSummary,
          articles: similarCase.sourceArticles,
        });
        if (!response.success)
          throw new Error(
            response.message || "과거 사례를 저장하지 못했습니다.",
          );
        setSavedCaseKeys((previous) => new Set([...previous, caseKey]));
      } catch (error) {
        setSaveError(
          error.response?.data?.message ||
            error.message ||
            "과거 사례를 저장하지 못했습니다.",
        );
      } finally {
        setSaveLoadingKey("");
      }
    },
    [caseSummaries, requestCaseSummary],
  );

  const confirmUnsaveCase = useCallback(async () => {
    if (!pendingUnsaveCase) return;

    const caseKey = getCaseSummaryKey(pendingUnsaveCase);
    setSaveLoadingKey(caseKey);
    setSaveError("");
    try {
      await deleteSavedCaseByKey(caseKey);
      setSavedCaseKeys((previous) => {
        const next = new Set(previous);
        next.delete(caseKey);
        return next;
      });
      setPendingUnsaveCase(null);
    } catch (error) {
      setSaveError(
        error.response?.data?.message ||
          "저장한 과거 사례를 삭제하지 못했습니다.",
      );
    } finally {
      setSaveLoadingKey("");
    }
  }, [pendingUnsaveCase]);

  return (
    <div className="response-page">
      <Header />
      <main className="response-main">
        <p className="response-kicker">AI RESPONSE CENTER</p>
        <h1>{simulator ? "과거 사례 시뮬레이터" : "대응자료 생성"}</h1>
        <p className="response-description">
          {simulator
            ? "과거 사건 사례를 조회하고 대응 흐름을 분석하세요."
            : "현재 상황을 바탕으로 공식 대응자료 초안을 작성하세요."}
        </p>
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
              savedCaseKeys={savedCaseKeys}
              onSaveCase={saveCase}
              onRequestUnsave={setPendingUnsaveCase}
              pendingUnsaveCase={pendingUnsaveCase}
              onCancelUnsave={() => setPendingUnsaveCase(null)}
              onConfirmUnsave={confirmUnsaveCase}
              saveLoadingKey={saveLoadingKey}
              saveError={saveError}
              caseSummaries={caseSummaries}
              summaryLoadingKey={summaryLoadingKey}
              summaryErrors={summaryErrors}
              onRequestSummary={requestCaseSummary}
              errorMessage={caseError}
              displayValue={displayValue}
              displayIncidentDate={formatIncidentDate}
            />
          </>
        ) : (
          <section className="tool-card generator-card">
            <div className="generator-card-header">
              <div className="generator-header-copy">
                <div className="generator-header-eyebrow">
                  <span className="generator-ai-mark" aria-hidden="true">AI</span>
                  <span>RESPONSE STUDIO</span>
                </div>
                <h2>AI 초안 생성</h2>
                <p>현재 상황을 입력하면 유사한 공식 대응사례를 참고해 초안을 생성합니다.</p>
              </div>
              <span className="generator-reference-badge">공식 사례 기반</span>
            </div>

            <section className="generator-step">
              <div className="step-heading">
                <div className="step-title-row">
                  <b>01</b>
                  <h2>현재 상황</h2>
                </div>
                <p>확인된 사실만 입력하세요. 입력하지 않은 내용은 AI가 사실로 만들지 않습니다.</p>
              </div>

              <label>
                <span className="field-label">
                  기업명
                  <em>보도자료에만 본문 표기</em>
                </span>
                <input
                  type="text"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  placeholder="예: 이삭금형"
                />
              </label>
              <label>
                현재 상황
                <textarea
                  value={situation}
                  onChange={(event) => setSituation(event.target.value)}
                  placeholder="예: 고객 일부의 개인정보 외부 노출 정황을 확인했고, 영향 범위를 조사 중입니다."
                />
              </label>
            </section>

            <section className="generator-step document-setting-step">
              <div className="step-heading">
                <div className="step-title-row">
                  <b>02</b>
                  <h2>문서 작성 설정</h2>
                </div>
                <p>보도자료와 사과문은 기업명을 공식 발표 주체로 사용하고, Q&A는 질문·답변 10개만 작성합니다.</p>
              </div>

              <label>
                문서 유형
                <select
                  value={document}
                  onChange={(event) => {
                    setDocument(event.target.value);
                    setCopyNotice("");
                  }}
                >
                  {documents.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <p className="document-guide">{DOCUMENT_GUIDES[document]}</p>
            </section>

            <section className="generator-step request-step">
              <div className="step-heading">
                <div className="step-title-row">
                  <b>03</b>
                  <h2>선택 입력</h2>
                </div>
                <p>현재 조치와 문체 요청은 필요한 경우에만 입력하세요.</p>
              </div>

              <label>
                <span className="field-label">
                  현재 조치
                  <em>선택</em>
                </span>
                <textarea
                  value={currentActions}
                  onChange={(event) => setCurrentActions(event.target.value)}
                  placeholder="예: 접근 경로를 차단하고 영향 범위를 조사 중입니다."
                />
              </label>
              <label>
                <span className="field-label">
                  추가 요청사항
                  <em>선택</em>
                </span>
                <textarea
                  value={additionalRequest}
                  onChange={(event) => setAdditionalRequest(event.target.value)}
                  placeholder="예: 고객 불안을 낮추는 어조로 간결하게 작성해 주세요."
                />
              </label>
            </section>

            <button
              type="button"
              className={`primary-action ${isGenerating ? "is-loading" : ""}`}
              onClick={handleGenerate}
              disabled={isGenerating || !company.trim() || !situation.trim()}
            >
              {isGenerating ? (
                <>
                  {/* 생성 중임을 보여주는 회전 표시 */}
                  <span className="generate-spinner" aria-hidden="true" />
                  AI 초안 생성 중...
                </>
              ) : draft ? (
                "다시 생성하기"
              ) : (
                "AI 초안 생성하기"
              )}
            </button>

            {generateError && <p className="generate-error">{generateError}</p>}

            {draft && (
              <div className="generated-draft">
                <b>{draft.generationStatus === "fallback" ? "AI 생성에 실패한 임시 초안입니다." : `${draft.documentType} 초안이 준비되었습니다.`}</b>
                {draft.generationStatus === "fallback" && (
                  <p className="draft-fallback-notice" role="alert">
                    공식 사례를 반영한 AI 완성본이 아닙니다. API 키와 AI 서버 상태를 확인한 뒤 다시 생성해 주세요.
                  </p>
                )}
                {draft.incidentType && (
                  <p className="incident-type-notice">
                    AI가 파악한 사건 유형: <strong>{draft.incidentType}</strong>
                  </p>
                )}

                {/* 현재 초안을 복사하거나, 같은 이슈로 새 초안을 생성합니다. */}
                <div className="draft-actions">
                  <button
                    type="button"
                    className="draft-action-button"
                    onClick={handleCopyDraft}
                  >
                    초안 복사
                  </button>

                  <button
                    type="button"
                    className="draft-action-button draft-regenerate-button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    다시 생성
                  </button>
                </div>

                {copyNotice && (
                  <p className="draft-action-notice">{copyNotice}</p>
                )}

                <p className="draft-regenerate-guide">공식 대응사례는 구성과 표현 참고용이며, 초안의 사실은 입력한 현재 상황과 조치만 반영합니다.</p>

                <GeneratedDraftContent
                  documentType={draft.documentType}
                  content={draft.draftResponse}
                />

                {draft.referenceCases?.length > 0 && (
                  <section className="reference-articles">
                    <button
                      type="button"
                      className="reference-toggle-button"
                      onClick={() =>
                        setIsReferenceCasesOpen((prev) => !prev)
                      }
                      aria-expanded={isReferenceCasesOpen}
                    >
                      참고 공식 사례{" "}
                      {isReferenceCasesOpen
                        ? "접기"
                        : `${draft.referenceCases.length}건 보기`}
                      <span>{isReferenceCasesOpen ? "⌃" : "⌄"}</span>
                    </button>

                    {isReferenceCasesOpen && (
                      <ul className="reference-article-list">
                        {draft.referenceCases.map((referenceCase, index) => (
                          <li key={`${referenceCase.url || referenceCase.title}-${index}`}>
                            <div>
                              <strong>
                                {referenceCase.title || "제목 정보 없음"}
                              </strong>
                              <span>
                                {referenceCase.company || "기업 정보 없음"} · {referenceCase.responseType || "대응자료"} · {formatDate(referenceCase.publishedAt)}
                              </span>
                            </div>

                            {referenceCase.url && (
                              <a
                                href={referenceCase.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                원문 보기
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
export default ResponseToolsPage;
