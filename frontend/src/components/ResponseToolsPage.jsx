import { useState } from "react";
import Header from "./Header";
import { useCallback } from "react";
import { ROUTES } from "../config/routes";
import { CASE_TYPE_OPTIONS } from "../data/caseTypeOptions";
import { fetchSimilarCases } from "../services/simulatorApi";
import "./ResponseToolsPage.css";
import "./CaseSimulator.css";
const documents = ["보도자료", "고객 안내문", "임직원 공지", "Q&A 문서"];
const RISK_TYPE_LABELS = { ACCIDENT: "사건·사고", REGULATION: "규제", LABOR: "노사", PERFORMANCE: "실적", MANAGEMENT: "경영", REPUTATION: "평판" };

function formatDate(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}. ${match[2]}. ${match[3]}.` : "정보 준비 중";
}

function formatDateRange(startDate, lastDate) {
  if (!startDate || !lastDate) return "정보 준비 중";
  return `${formatDate(startDate)} ~ ${formatDate(lastDate)}`;
}

function formatFinalScore(value) {
  if (value == null || value === "") return "정보 준비 중";
  const score = Number(value);
  return Number.isFinite(score) ? `${score.toFixed(1)}점` : "정보 준비 중";
}

function formatSemanticSimilarity(value) {
  if (value == null || value === "") return "정보 준비 중";
  const similarity = Number(value);
  return Number.isFinite(similarity) ? `${(similarity * 100).toFixed(1)}%` : "정보 준비 중";
}

function CurrentIssueContext({ currentIssue, caseType, onChange, onCaseTypeChange, onSearch, isSearching }) {
  const canSearch = currentIssue.name.trim() || caseType.major || caseType.minor;
  const selectedMajor = CASE_TYPE_OPTIONS.find((item) => item.major === caseType.major);
  const minorOptions = selectedMajor ? selectedMajor.minors : [];

  return <section className="current-issue-context"><span>CURRENT ISSUE</span><h2>현재 분석 이슈</h2><label>이슈명<input type="text" value={currentIssue.name} onChange={(event) => onChange({ ...currentIssue, name: event.target.value })} placeholder="예: 개인정보 유출" /></label><div className="case-type-selectors" aria-label="사례 유형 선택"><span>사례 유형</span><div><label>대분류<select value={caseType.major} onChange={(event) => onCaseTypeChange({ major: event.target.value, minor: "" })}><option value="">대분류를 선택하세요</option>{CASE_TYPE_OPTIONS.map((item) => <option key={item.major} value={item.major}>{item.major}</option>)}</select></label><label>소분류<select value={caseType.minor} disabled={!caseType.major} onChange={(event) => onCaseTypeChange({ ...caseType, minor: event.target.value })}><option value="">{caseType.major ? "소분류를 선택하세요" : "대분류를 먼저 선택하세요"}</option>{minorOptions.map((minor) => <option key={minor} value={minor}>{minor}</option>)}</select></label></div></div><button type="button" className="primary-action" onClick={onSearch} disabled={!canSearch || isSearching}>{isSearching ? "유사 사례를 찾는 중…" : "유사 사례 검색"}</button><p>입력한 이슈명 또는 선택한 사례 유형을 기준으로 저장된 과거 유사사례를 검색합니다.</p></section>;
}

function SimulatorContent({
  status,
  cases,
  selectedCase,
  onSelect,
  errorMessage,
  displayValue,
  displayDateRange,
  displayScore,
}) {
  if (status === "idle") {
    return <section className="case-status">현재 이슈를 입력한 뒤 유사 사례를 검색해 주세요.</section>;
  }

  if (status === "loading") {
    return <section className="case-status" role="status">유사 사례를 찾는 중입니다…</section>;
  }

  if (status === "error") {
    return <section className="case-status case-status-error" role="alert">{errorMessage || "유사 사례를 불러오지 못했습니다."}</section>;
  }

  if (cases.length === 0) {
    return <section className="case-status">조건에 맞는 과거 사례가 없습니다.</section>;
  }

  const selectedSimilarCase = cases[selectedCase] || cases[0];

  return <section className="tool-grid"><div className="tool-card"><span>CASE LIBRARY</span><h2>유사 사례를 선택하세요</h2><div className="case-options">{cases.map((item, index) => <button type="button" className={selectedCase === index ? "selected" : ""} onClick={() => onSelect(index)} key={item.issueName}><span>{item.issueName}</span><small>{displayScore(item.finalScore)}</small><i>›</i></button>)}</div></div><div className="tool-card simulation-result"><span>SIMILAR CASE</span><h2>{selectedSimilarCase.issueName}</h2><p>{selectedSimilarCase.description}</p><div className="case-detail-grid"><div><span>기업</span><strong>{displayValue(selectedSimilarCase.companyName)}</strong></div><div><span>업종</span><strong>{displayValue(selectedSimilarCase.industry)}</strong></div><div><span>리스크 유형</span><strong>{selectedSimilarCase.riskType ? RISK_TYPE_LABELS[selectedSimilarCase.riskType] || selectedSimilarCase.riskType : "정보 준비 중"}</strong></div><div><span>사건 기간</span><strong>{displayDateRange(selectedSimilarCase.startDate, selectedSimilarCase.lastDate)}</strong></div><div><span>지속기간</span><strong>{selectedSimilarCase.durationDays == null ? "정보 준비 중" : `${selectedSimilarCase.durationDays}일`}</strong></div><div><span>관련 기사</span><strong>{selectedSimilarCase.articleCount == null ? "정보 준비 중" : `${selectedSimilarCase.articleCount}건`}</strong></div><div><span>종합 유사도</span><strong>{displayScore(selectedSimilarCase.finalScore)}</strong></div><div><span>의미 유사도</span><strong>{formatSemanticSimilarity(selectedSimilarCase.semanticSimilarity)}</strong></div></div><div className="representative-news"><span>대표기사</span><strong>{displayValue(selectedSimilarCase.representativeTitle)}</strong></div></div></section>;
}
function ResponseToolsPage({ mode }) {
  const [activeMode, setActiveMode] = useState(mode);
  const [selectedCase, setSelectedCase] = useState(0);
  const [currentIssue, setCurrentIssue] = useState({ name: "" });
  const [caseType, setCaseType] = useState({ major: "", minor: "" });
  const [similarCases, setSimilarCases] = useState([]);
  const [caseLoadStatus, setCaseLoadStatus] = useState("idle");
  const [caseError, setCaseError] = useState("");
  const [document, setDocument] = useState(documents[0]);
  const [generated, setGenerated] = useState(false);
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

      setSimilarCases(Array.isArray(response.similarCases) ? response.similarCases : []);
      setSelectedCase(0);
      setCaseLoadStatus("success");
    } catch (error) {
      setSimilarCases([]);
      setCaseError(error.message || "유사 사례를 불러오지 못했습니다.");
      setCaseLoadStatus("error");
    }
  }, [caseType, currentIssue]);

  const changeMode = (next) => {
    setActiveMode(next);
    window.history.pushState({}, "", next === "simulator" ? ROUTES.CASE_SIMULATOR : ROUTES.RESPONSE_GENERATOR);
  };

  return <div className="response-page"><Header /><main className="response-main"><p className="response-kicker">AI RESPONSE CENTER</p><h1>{simulator ? "과거 사례 시뮬레이터" : "대응자료 생성"}</h1><p className="response-description">과거 대응 사례를 참고하고, 현재 이슈에 맞는 자료 초안을 빠르게 준비하세요.</p><div className="response-tabs"><button type="button" className={simulator ? "active" : ""} onClick={() => changeMode("simulator")}>과거 사례 시뮬레이터</button><button type="button" className={!simulator ? "active" : ""} onClick={() => changeMode("generator")}>대응자료 생성</button></div>{simulator ? <><CurrentIssueContext currentIssue={currentIssue} caseType={caseType} onChange={setCurrentIssue} onCaseTypeChange={setCaseType} onSearch={loadSimilarCases} isSearching={caseLoadStatus === "loading"} /><SimulatorContent status={caseLoadStatus} cases={similarCases} selectedCase={selectedCase} onSelect={setSelectedCase} errorMessage={caseError} displayValue={displayValue} displayDateRange={formatDateRange} displayScore={formatFinalScore} /></> : <section className="tool-card generator-card"><span>AI DOCUMENT DRAFT</span><h2>대응 자료 초안을 생성하세요</h2><label>문서 유형<select value={document} onChange={(event) => setDocument(event.target.value)}>{documents.map((item) => <option key={item}>{item}</option>)}</select></label><label>핵심 상황<textarea defaultValue="공급망 이슈와 관련한 고객 문의가 증가하고 있습니다." /></label><button type="button" className="primary-action" onClick={() => setGenerated(true)}>AI 초안 생성하기</button>{generated && <div className="generated-draft"><b>{document} 초안이 준비되었습니다.</b><p>현재 상황을 인지하고 있으며, 고객과 이해관계자에게 정확한 정보를 신속하게 안내하겠습니다.</p></div>}</section>}</main></div>;
}
export default ResponseToolsPage;
