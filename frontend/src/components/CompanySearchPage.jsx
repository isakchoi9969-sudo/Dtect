import { useState } from "react";
import { api } from "../config/api";
import { useWatchlist } from "../hooks/useWatchlist";
import { ROUTES } from "../config/routes";
import Header from "./Header";

const recommendedKeywords = [
  "삼성",
  "LG",
  "현대",
  "SK",
  "롯데",
  "카카오",
  "2차전지",
  "게임",
  "금융",
  "바이오",
  "식품",
];
const LOGO_DEV_TOKEN = "pk_LmDNVeHjR3Sh2eSen5P1yA";

const companyDomains = {
  삼성SDI: "samsungsdi.co.kr",
  삼성물산: "samsungcnt.com",
  삼성바이오로직스: "samsungbiologics.com",
  삼성생명: "samsunglife.com",
  삼성엔지니어링: "samsungena.com",
  삼성전기: "samsungsem.com",
  삼성전자: "samsung.com",
  삼성중공업: "samsungshi.com",
  삼성화재: "samsungfire.com",
  HD현대중공업: "hd-hhi.com",
  현대건설: "hdec.kr",
  현대글로비스: "glovis.net",
  현대모비스: "mobis.com",
  현대백화점: "ehyundai.com",
  현대위아: "hyundai-wia.com",
  현대자동차: "hyundai.com",
  현대제철: "hyundai-steel.com",
  DL이앤씨: "dlenc.co.kr",
  GS: "gs.co.kr",
  GS건설: "gsenc.com",
  KB금융: "kbfg.com",
  KT: "kt.com",
  "KT&G": "ktng.com",
  "LS ELECTRIC": "ls-electric.com",
  "S-OIL": "s-oil.com",
  SKC: "skc.kr",
  SK온: "sk-on.com",
  SK이노베이션: "skinnovation.com",
  SK텔레콤: "sktelecom.com",
  SPC: "spc.co.kr",
  카카오: "kakao.com",
  카카오게임즈: "kakaogames.com",
  SK바이오팜: "skbp.com",
  고려아연: "koreazinc.co.kr",
  하이브: "hybecorp.com",
  "JYP Ent.": "jype.com",
  "YG PLUS": "ygplus.com",
  SM: "smentertainment.com",
  하이트진로: "hitejinro.com",
  NAVER: "naver.com",
  이마트: "emart.com",
  금호석유화학: "kkpc.com",
  금호타이어: "kumhotire.com",
  기아: "kia.com",
  미래에셋증권: "securities.miraeasset.com",
  LG디스플레이: "lgdisplay.com",
  LG생활건강: "lghnh.com",
  LG에너지솔루션: "lgensol.com",
  LG유플러스: "lguplus.com",
  LG이노텍: "lginnotek.com",
  LG전자: "lge.co.kr",
  LG화학: "lgchem.com",
  HMM: "hmm21.com",
  HD한국조선해양: "hd-ksoe.com",
  한국가스공사: "kogas.or.kr",
  한국전력: "kepco.co.kr",
  한국콜마: "kolmar.co.kr",
  한국타이어앤테크놀로지: "hankooktire.com",
  코스맥스: "cosmax.com",
  두산에너빌리티: "doosanenerbility.com",
  두산로보틱스: "doosanrobotics.com",
  두산밥캣: "doosanbobcat.com",
  롯데쇼핑: "lotteshoppingir.com",
  롯데에너지머티리얼즈: "lotteenergymaterials.com",
  롯데칠성음료: "lottechilsung.co.kr",
  롯데케미칼: "lottechem.com",
  CJ대한통운: "cjlogistics.com",
  대웅제약: "daewoong.co.kr",
  대한항공: "koreanair.com",
  아시아나항공: "flyasiana.com",
  제주항공: "jejuair.net",
  OCI홀딩스: "oci-holdings.co.kr",
  POSCO홀딩스: "posco-inc.com",
  SK스퀘어: "sksquare.com",
  SK하이닉스: "skhynix.com",
  펄어비스: "pearlabyss.com",
  BGF리테일: "bgfretail.com",
  CJ제일제당: "cj.co.kr",
  GS리테일: "gsretail.com",
  CJ: "cj.net",
  HLB: "hlbbio.co.kr",
  HL만도: "hlmando.com",
  넷마블: "netmarble.com",
  농심: "nongshim.com",
  메리츠금융지주: "meritzgroup.com",
  삼양식품: "samyangfoods.com",
  셀트리온: "celltrion.com",
  신세계: "shinsegae.com",
  신한지주: "shinhangroup.com",
  아모레퍼시픽: "amorepacific.com",
  에코프로: "ecopro.co.kr",
  에코프로비엠: "ecoprobm.co.kr",
  엔씨소프트: "ncsoft.com",
  엘앤에프: "landf.co.kr",
  오뚜기: "ottogi.co.kr",
  오리온: "orionworld.com",
  우리금융: "woorifg.com",
  우리금융지주: "woorifg.com",
  유한양행: "yuhan.co.kr",
  종근당: "ckdhc.com",
  쿠팡: "coupang.com",
  크래프톤: "krafton.com",
  포스코퓨처엠: "poscofuturem.com",
  하나금융지주: "hanafn.com",
  DB하이텍: "dbhitek.com",
  KG스틸: "kg-steel.co.kr",
  한미약품: "hanmi.co.kr",
  한진칼: "hanjinkal.co.kr",
  한화솔루션: "hanwhasolutions.com",
  한화에어로스페이스: "hanwhaaerospace.com",
  한화오션: "hanwhaocean.com",
  호텔신라: "hotelshilla.net",
  하나금융: "hanafn.com",
};

function CompanySearchLogo({ companyName }) {
  const [imageFailed, setImageFailed] = useState(false);
  const domain = companyDomains[companyName];

  if (!domain || imageFailed) {
    return <span aria-label={`${companyName} 글자 로고`}>{companyName.slice(0, 2)}</span>;
  }

  return (
    <img
      alt={`${companyName} 로고`}
      onError={() => setImageFailed(true)}
      src={`https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=128&format=png`}
      style={{
        width: "34px",
        height: "34px",
        objectFit: "contain",
        objectPosition: "center",
        display: "block",
      }}
    />
  );
}

export default function CompanySearchPage() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [pendingAction, setPendingAction] = useState(null);
  const [isUpdatingWatchlist, setIsUpdatingWatchlist] = useState(false);

  const {
    isWatched,
    toggleCompany,
    count,
    limit,
    error: watchlistError,
  } = useWatchlist();

  const runSearch = async (rawKeyword) => {
    const keyword = rawKeyword.trim();
    if (!keyword) return;

    try {
      const response = await api.get("/api/company/search", {
        params: { keyword },
      });
      setSearchResults(response.data.data || []);
      setSubmittedQuery(keyword);
      setNotice("");
    } catch (error) {
      console.error("기업 검색 실패:", error);
      setSearchResults([]);
      setSubmittedQuery(keyword);
      setNotice("기업 검색 중 오류가 발생했습니다.");
    }
  };

  const submitSearch = (event) => {
    event.preventDefault();
    runSearch(query);
  };

  const chooseKeyword = (keyword) => {
    setQuery(keyword);
    runSearch(keyword);
  };

  const toggleWatchlist = (event, company) => {
    event.stopPropagation();

    if (isWatched(company.companyId)) {
      setPendingAction({ type: "remove", company });
      return;
    }

    if (count >= limit) {
      setPendingAction({ type: "limit" });
      return;
    }

    void toggleCompany(company.companyId);
  };

  const confirmRemoval = async () => {
    if (!pendingAction || pendingAction.type !== "remove") return;

    setIsUpdatingWatchlist(true);
    await toggleCompany(pendingAction.company.companyId);
    setIsUpdatingWatchlist(false);
    setPendingAction(null);
  };

  const openAnalysis = (company) => {
    window.location.assign(
      `${ROUTES.COMPANY_DETAIL}?companyId=${company.companyId}`,
    );
  };

  const hasResults = submittedQuery.length > 0;

  return (
    <div className={`company-search-page ${hasResults ? "has-results" : ""}`}>
      <Header />

      <main className="company-search-main">
        {!hasResults && (
          <section className="company-search-intro">
            <p className="company-search-eyebrow">CORPORATE INTELLIGENCE</p>
            <div className="company-search-logo">
              D<span>:</span>TECT
            </div>
            <h1>기업의 오늘을 검색하세요.</h1>
            <p>
              뉴스와 시장 신호를 분석해 기업의 리스크와 감성 변화를
              보여드립니다.
            </p>
          </section>
        )}

        <section className="company-search-workspace" aria-label="기업 검색">
          {hasResults && (
            <p className="company-search-eyebrow">COMPANY SEARCH</p>
          )}

          <form className="company-search-form" onSubmit={submitSearch}>
            <span aria-hidden="true">⌕</span>
            <input
              autoFocus
              onChange={(event) => setQuery(event.target.value)}
              placeholder="기업명을 검색하세요"
              value={query}
            />
            <button type="submit">검색</button>
          </form>

          <div className="company-search-recommendations">
            <span>추천 검색어</span>
            {recommendedKeywords.map((keyword) => (
              <button
                key={keyword}
                onClick={() => chooseKeyword(keyword)}
                type="button"
                style={{ transition: "all 0.2s ease" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 6px rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {keyword}
              </button>
            ))}
          </div>
        </section>

        {notice && (
          <p className="company-search-notice" role="status">
            {notice}
          </p>
        )}

        {watchlistError && (
          <p className="company-search-notice" role="alert">
            {watchlistError}
          </p>
        )}

        {hasResults && (
          <section className="company-search-results">
            <div className="company-search-results-heading">
              <div>
                <p>
                  <b>{submittedQuery}</b> 검색 결과
                </p>
                <span>{searchResults.length}개 기업을 찾았습니다.</span>
              </div>
              <small>
                관심기업 {count}/{limit}
              </small>
            </div>

            {searchResults.length > 0 ? (
              <div className="company-result-list">
                {searchResults.map((company) => {
                  const watched = isWatched(company.companyId);

                  return (
                    <article
                      className="company-result"
                      key={company.companyId}
                      style={{
                        transition:
                          "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-3px)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 20px rgba(0,0,0,0.07)";
                        e.currentTarget.style.borderColor = "#d1d5db";

                        const arrow = e.currentTarget.querySelector(
                          ".company-result-arrow",
                        );
                        if (arrow) {
                          arrow.style.transform = "translateX(4px)";
                          arrow.style.color = "#111827";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.borderColor = "";

                        const arrow = e.currentTarget.querySelector(
                          ".company-result-arrow",
                        );
                        if (arrow) {
                          arrow.style.transform = "translateX(0)";
                          arrow.style.color = "";
                        }
                      }}
                    >
                      <button
                        className="company-result-main"
                        onClick={() => openAnalysis(company)}
                        type="button"
                      >
                        <span
                          className="company-result-mark"
                          style={{
                            width: "52px",
                            height: "52px",
                            minWidth: "52px",
                            minHeight: "52px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            flexShrink: 0,
                            borderRadius: "14px",
                            background: "#fff",
                            border: "1px solid #e5e7eb",
                            boxSizing: "border-box",
                          }}
                        >
                          <CompanySearchLogo companyName={company.companyName} />
                        </span>

                        <span className="company-result-copy">
                          <strong>
                            {company.companyName}
                            {company.stockCode && <small>{company.stockCode}</small>}
                          </strong>
                          <em>{company.industry || "업종 정보 없음"}</em>
                          <span>{company.companyInfo || "기업 정보가 준비 중입니다."}</span>
                        </span>

                        <span
                          className="company-result-arrow"
                          style={{
                            transition:
                              "transform 0.22s ease, color 0.22s ease",
                          }}
                        >
                          ›
                        </span>
                      </button>

                      <button
                        aria-label={`${company.companyName} 관심기업 ${
                          watched ? "해제" : "등록"
                        }`}
                        className={`company-star ${watched ? "is-active" : ""}`}
                        onClick={(event) => toggleWatchlist(event, company)}
                        type="button"
                        style={{
                          transition: "transform 0.18s ease, color 0.18s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        {watched ? "★" : "☆"}
                      </button>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="company-search-empty">
                <strong>검색 결과가 없습니다.</strong>
                <p>기업명을 다시 확인해 주세요.</p>
              </div>
            )}
          </section>
        )}
      </main>

      {pendingAction && (
        <div className="company-search-modal-backdrop" role="presentation">
          <section
            className="company-search-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="company-search-modal-title"
            aria-describedby="company-search-modal-description"
          >
            <p>WATCHLIST</p>
            {pendingAction.type === "remove" ? (
              <>
                <h2 id="company-search-modal-title">관심기업 해제</h2>
                <span id="company-search-modal-description">
                  <strong>{pendingAction.company.companyName}</strong>을(를) 관심기업에서 삭제할까요?
                </span>
                <div className="company-search-modal-actions">
                  <button
                    type="button"
                    onClick={() => setPendingAction(null)}
                    disabled={isUpdatingWatchlist}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    className="is-danger"
                    onClick={confirmRemoval}
                    disabled={isUpdatingWatchlist}
                  >
                    {isUpdatingWatchlist ? "삭제 중..." : "삭제"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 id="company-search-modal-title">관심기업 한도 안내</h2>
                <span id="company-search-modal-description">
                  관심기업은 최대 <strong>{limit}개</strong>까지 등록할 수 있습니다.
                </span>
                <div className="company-search-modal-actions">
                  <button type="button" onClick={() => setPendingAction(null)}>
                    확인
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
