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

// 산업별로 선택할 대표 이슈 목록입니다.
// 나중에는 이 부분을 기업 분석 결과 API 데이터로 바꿀 수 있습니다.
const INDUSTRY_ISSUES = {
  건설: [
    {
      title: "건설 현장 안전사고 관련 보도 증가",
      summary:
        "최근 건설 현장 안전관리와 사고 예방 조치에 대한 보도가 증가하고 있습니다.",
    },
    {
      title: "공사 지연 및 공급망 이슈",
      summary: "자재 수급과 공정 일정 관련 문의가 늘어나고 있습니다.",
    },
    {
      title: "하자 및 품질관리 관련 민원 증가",
      summary:
        "시공 품질과 하자 보수 절차에 대한 소비자 민원과 보도가 늘어나고 있습니다.",
    },
    {
      title: "건설 경기 침체 및 자금 유동성 우려",
      summary:
        "프로젝트 파이낸싱과 건설 경기 변동에 대한 시장 우려가 이어지고 있습니다.",
    },
    {
      title: "하도급 대금 및 협력사 분쟁 이슈",
      summary:
        "협력사와의 대금 지급, 계약 조건 관련 분쟁 가능성이 언급되고 있습니다.",
    },
    {
      title: "공사 현장 소음·환경 민원 증가",
      summary:
        "공사 과정에서 발생하는 소음과 환경 영향에 대한 지역 민원이 증가하고 있습니다.",
    },
  ],
  통신: [
    {
      title: "통신 서비스 장애 관련 문의 증가",
      summary:
        "서비스 이용 불편과 복구 현황에 대한 고객 문의가 증가하고 있습니다.",
    },
    {
      title: "개인정보 보호 이슈 관련 보도",
      summary:
        "개인정보 보호 체계와 고객 안내에 관한 관심이 높아지고 있습니다.",
    },
    {
      title: "개인정보 유출 및 보안 우려",
      summary:
        "고객 정보 보호 체계와 보안 사고 대응에 대한 관심이 높아지고 있습니다.",
    },
    {
      title: "통신 품질 및 고객 불편 민원",
      summary:
        "통화 품질과 인터넷 연결 문제에 대한 고객 불편 사례가 언급되고 있습니다.",
    },
    {
      title: "유심 정보 보호 및 보이스피싱 우려",
      summary:
        "유심 정보 보호와 금융사기 예방 조치에 대한 문의가 증가하고 있습니다.",
    },
    {
      title: "통신 요금 및 이용 약관 논란",
      summary:
        "통신 요금과 서비스 이용 조건의 공정성에 대한 관심이 이어지고 있습니다.",
    },
  ],
  자동차: [
    {
      title: "차량 품질 및 리콜 관련 이슈",
      summary: "차량 품질과 안전 점검 관련 보도가 이어지고 있습니다.",
    },
    {
      title: "전기차 안전성 관련 우려 확산",
      summary: "전기차 안전성과 사후 점검에 관한 문의가 증가하고 있습니다.",
    },
    {
      title: "전기차 화재 및 배터리 안전성 우려",
      summary:
        "전기차 화재와 배터리 안전 점검에 대한 소비자 우려가 커지고 있습니다.",
    },
    {
      title: "부품 수급 지연에 따른 출고 차질",
      summary:
        "핵심 부품 공급 변동으로 차량 생산과 출고 일정에 대한 문의가 늘어나고 있습니다.",
    },
    {
      title: "완성차 노사 협상 및 생산 차질 가능성",
      summary:
        "노사 협상 진행 상황과 생산 일정 영향에 대한 관심이 높아지고 있습니다.",
    },
    {
      title: "차량 소프트웨어 오류 및 업데이트 이슈",
      summary:
        "차량 소프트웨어 오류와 원격 업데이트 안정성 관련 보도가 이어지고 있습니다.",
    },
  ],
  "조선·중공업": [
    {
      title: "협력사 현장 안전관리 이슈",
      summary:
        "협력사 작업 현장의 안전관리와 재발 방지 대책에 대한 보도가 증가하고 있습니다.",
    },
    {
      title: "수주 및 납기 관련 공급망 이슈",
      summary:
        "공급망 변동이 생산 일정과 납기에 미칠 영향에 관심이 높아지고 있습니다.",
    },
    {
      title: "수주 원가 상승 및 수익성 악화 우려",
      summary:
        "원자재 가격과 인건비 변동이 수주 수익성에 미칠 영향이 언급되고 있습니다.",
    },
    {
      title: "선박 품질 및 납품 지연 관련 이슈",
      summary:
        "건조 품질과 납기 관리에 대한 우려 및 관련 문의가 이어지고 있습니다.",
    },
    {
      title: "조선소 인력 수급 및 노사 이슈",
      summary:
        "현장 인력 확보와 근로 환경, 노사 관계에 대한 관심이 높아지고 있습니다.",
    },
    {
      title: "친환경 선박 규제 대응 부담",
      summary:
        "환경 규제 변화에 따른 친환경 선박 기술과 대응 비용이 주요 이슈로 언급되고 있습니다.",
    },
  ],
  "유통·플랫폼": [
    {
      title: "고객 정보 보호 및 서비스 안정성 이슈",
      summary:
        "고객 정보 보호와 서비스 안정성에 대한 이용자 문의가 늘어나고 있습니다.",
    },
    {
      title: "판매자·소비자 분쟁 관련 이슈",
      summary:
        "거래 과정의 소비자 보호와 분쟁 대응에 대한 보도가 이어지고 있습니다.",
    },
    {
      title: "판매자 정산 지연 및 거래 안정성 우려",
      summary:
        "판매자 정산 일정과 거래 안정성에 대한 우려가 확산되고 있습니다.",
    },
    {
      title: "상품 품질 및 소비자 환불 분쟁",
      summary:
        "상품 품질, 환불 절차, 소비자 보호와 관련한 민원이 증가하고 있습니다.",
    },
    {
      title: "플랫폼 공정거래 및 수수료 논란",
      summary:
        "입점업체 수수료와 플랫폼 거래 조건의 공정성에 대한 관심이 이어지고 있습니다.",
    },
    {
      title: "서비스 장애 및 주문·결제 오류",
      summary:
        "주문, 결제, 배송 서비스의 오류와 복구 상황에 대한 고객 문의가 증가하고 있습니다.",
    },
  ],
};

// 화면 시연용 분석 요약입니다.
// 실제 연결 시에는 산업 분석 API의 위험도·기사 수·키워드로 바꿉니다.
const INDUSTRY_INSIGHTS = {
  건설: {
    riskLevels: ["경계", "주의", "주의", "경계", "주의", "관심"],
    articles: "18건",
    period: "최근 7일",
    keywords: ["안전사고", "현장관리", "재발방지"],
  },
  통신: {
    riskLevels: ["경계", "경계", "주의", "주의", "관심", "주의"],
    articles: "14건",
    period: "최근 7일",
    keywords: ["서비스 장애", "복구", "고객 안내"],
  },
  자동차: {
    riskLevels: ["주의", "경계", "주의", "주의", "관심", "경계"],
    articles: "12건",
    period: "최근 7일",
    keywords: ["품질", "안전 점검", "리콜"],
  },
  "조선·중공업": {
    riskLevels: ["경계", "주의", "경계", "주의", "주의", "관심"],
    articles: "16건",
    period: "최근 7일",
    keywords: ["협력사", "현장 안전", "점검"],
  },
  "유통·플랫폼": {
    riskLevels: ["주의", "경계", "주의", "경계", "주의", "관심"],
    articles: "15건",
    period: "최근 7일",
    keywords: ["고객 정보", "서비스 안정성", "소비자 보호"],
  },
};

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

  // 기업명 직접 입력 대신 산업과 이슈를 선택하도록 구성합니다.
  const [industry, setIndustry] = useState("건설");
  const [selectedIssueIndex, setSelectedIssueIndex] = useState(0);

  // 꼭 필요한 요청만 사용자가 선택적으로 작성합니다.
  const [additionalRequest, setAdditionalRequest] = useState("");

  // AI 생성 진행 상태와 결과
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [draft, setDraft] = useState(null);

  const handleGenerate = async () => {
    // 현재 선택된 산업 이슈 정보를 가져옵니다.
    const selectedIssue = INDUSTRY_ISSUES[industry][selectedIssueIndex];

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

        // 사용자가 직접 작성하지 않아도 선택 이슈를 AI에 전달합니다.
        issueName: selectedIssue.title,
        industry,

        // 추가 요청은 선택값이며, 입력하지 않아도 생성됩니다.
        analysisText: `${selectedIssue.summary}${
          additionalRequest.trim()
            ? `\n추가 요청: ${additionalRequest.trim()}`
            : ""
        }`,
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

  // 선택된 이슈와 분석 요약을 화면 여러 영역에서 재사용합니다.
  const selectedIssue = INDUSTRY_ISSUES[industry][selectedIssueIndex];
  // 선택한 이슈 순서에 맞는 위험도를 가져옵니다.
  const baseInsight = INDUSTRY_INSIGHTS[industry];

  const insight = {
    ...baseInsight,
    risk: baseInsight.riskLevels[selectedIssueIndex] || "관심",
  };

  // 위험도에 맞는 CSS 색상 클래스를 연결합니다.
  const riskClass = {
    관심: "interest",
    주의: "caution",
    경계: "warning",
    심각: "critical",
  }[insight.risk];

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
            <div className="generator-card-header">
              <span>AI DOCUMENT DRAFT</span>
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
                    onChange={(event) => {
                      // 산업 변경 시 해당 산업의 첫 번째 이슈를 자동 선택합니다.
                      setIndustry(event.target.value);
                      setSelectedIssueIndex(0);
                    }}
                  >
                    {Object.keys(INDUSTRY_ISSUES).map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>

                <label>
                  감지된 이슈
                  <select
                    value={selectedIssueIndex}
                    onChange={(event) =>
                      setSelectedIssueIndex(Number(event.target.value))
                    }
                  >
                    {INDUSTRY_ISSUES[industry].map((item, index) => (
                      <option key={item.title} value={index}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            {/* 선택 이슈의 분석 결과를 보여주는 카드 */}
            <section className="issue-insight-card">
              <div className="issue-insight-header">
                <div>
                  <span>ISSUE ANALYSIS</span>
                  <h3>{selectedIssue.title}</h3>
                </div>
                <strong className={`risk-badge risk-${riskClass}`}>
                  위험도 {insight.risk}
                </strong>{" "}
              </div>

              <p>{selectedIssue.summary}</p>

              <div className="insight-metrics">
                <div>
                  <span>대상 산업</span>
                  <strong>{industry}</strong>
                </div>
                <div>
                  <span>관련 기사</span>
                  <strong>{insight.articles}</strong>
                </div>
                <div>
                  <span>분석 기간</span>
                  <strong>{insight.period}</strong>
                </div>
              </div>

              <div className="keyword-tags">
                {insight.keywords.map((keyword) => (
                  <span key={keyword}>#{keyword}</span>
                ))}
              </div>
            </section>

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
