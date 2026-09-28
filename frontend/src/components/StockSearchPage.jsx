import { useState } from "react";
import { api } from "../config/api";
import { useWatchlist } from "../hooks/useWatchlist";
import { ROUTES } from "../config/routes";
import Header from "./Header";

const recommendedKeywords = ["삼성", "현대", "카카오", "바이오", "2차전지"];
const LOGO_DEV_TOKEN = "pk_LmDNVeHjR3Sh2eSen5P1yA";
const companyDomains = {
  삼성SDI: "samsungsdi.co.kr",
  삼성물산: "samsungcnt.com",
  삼성바이오로직스: "samsungbiologics.com",
  삼성생명: "samsunglife.com",
  삼성엔지니어링: "samsungena.com",
  삼성전기: "samsungsem.com",
  삼성전자: "samsung.com",
  삼성중공업: "samsungcareers.com",
  삼성화재: "samsungfire.com",

  HD현대중공업: "hd-hhi.com",
  현대건설: "hdec.kr",
  현대글로비스: "glovis.net",
  현대모비스: "mobis.com",
  현대백화점: "ehyundai.com",
  현대위아: "hyundai-wia.com",
  현대자동차: "hyundai.com",
  현대제철: "hyundai-steel.com",

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

  금호석유화학: "recruit.kkpc.com",
  금호타이어: "kumhotire.com",

  미래에셋증권: "securities.miraeasset.com",

  LG디스플레이: "lgdisplay.com",
  LG생활건강: "lghnh.com",
  LG에너지솔루션: "lgensol.com",
  LG유플러스: "uplusumobile.com",
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
  롯데칠성음료: "company.lottechilsung.co.kr",
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

  에코프로비엠: "ecoprobm.com",
  포스코퓨처엠: "poscofuturem.com",

  하나금융: "hanafn.com",
  하나금융지주: "hanafn.com",

  KB금융: "kbfg.com",
  메리츠금융지주: "meritzgroup.com",

  우리금융: "woorifg.com",
  우리금융지주: "woorifg.com",

  농심: "nongshim.com",
  오뚜기: "otoki.com",
  신세계: "shinsegae.com",

  GS건설: "gsenc.com",
};

function getCompanyLogo(companyName) {
  const domain = companyDomains[companyName];

  if (!domain) {
    return null;
  }

  return `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=128`;
}

export default function StockSearchPage() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const { isWatched, toggleWatch } = useWatchlist();

  const searchCompanies = async (searchKeyword) => {
    const trimmedKeyword = searchKeyword.trim();

    if (!trimmedKeyword) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await api.get("/api/company/search", {
        params: {
          keyword: trimmedKeyword,
        },
      });

      const companies = response.data?.companies ?? [];

      setResults(companies);
    } catch (error) {
      console.error("기업 검색 실패:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    searchCompanies(keyword);
  };

  const handleRecommendedKeyword = (recommendedKeyword) => {
    setKeyword(recommendedKeyword);
    searchCompanies(recommendedKeyword);
  };

  const handleCompanyClick = (company) => {
    const companyId = company.companyId ?? company.id;

    if (!companyId) {
      return;
    }

    window.location.href = `${ROUTES.COMPANY_DETAIL}?companyId=${companyId}`;
  };

  return (
    <div className="company-search-page">
      <Header />

      <main className="company-search-main">
        {/* 페이지 소개 */}
        <section className="company-search-intro">
          <p className="company-search-eyebrow">COMPANY INTELLIGENCE</p>

          <div className="company-search-logo">
            D<span>:</span>TECT
          </div>

          <h1>관심 있는 기업을 찾아보세요.</h1>

          <p>
            기업명을 검색하면 관련 기업의 정보를 확인하고
            <br />
            주요 이슈와 리스크를 분석할 수 있습니다.
          </p>
        </section>

        {/* 검색 영역 */}
        <section className="company-search-workspace">
          <form className="company-search-form" onSubmit={handleSubmit}>
            <div className="company-search-input-wrap">
              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="기업명을 입력해 주세요."
                aria-label="기업명 검색"
              />

              <button type="submit" disabled={loading}>
                {loading ? "검색 중..." : "검색"}
              </button>
            </div>
          </form>

          {/* 추천 검색어 */}
          <div className="company-search-recommended">
            <span>추천 검색어</span>

            <div>
              {recommendedKeywords.map((recommendedKeyword) => (
                <button
                  key={recommendedKeyword}
                  type="button"
                  onClick={() => handleRecommendedKeyword(recommendedKeyword)}
                >
                  {recommendedKeyword}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 검색 결과 */}
        <section className="company-search-results">
          <div className="company-search-results-heading">
            <div>
              <p>{searched ? "검색 결과" : "기업을 검색해보세요."}</p>

              {searched && <span>{results.length}개 기업</span>}
            </div>
          </div>

          {/* 검색 전 */}
          {!searched && (
            <div className="company-search-empty">
              <strong>분석하고 싶은 기업을 검색해보세요.</strong>

              <p>기업명을 입력하거나 추천 검색어를 선택할 수 있습니다.</p>
            </div>
          )}

          {/* 검색 결과 없음 */}
          {searched && !loading && results.length === 0 && (
            <div className="company-search-empty">
              <strong>검색 결과가 없습니다.</strong>

              <p>다른 기업명이나 검색어를 입력해보세요.</p>
            </div>
          )}

          {/* 검색 결과 목록 */}
          {results.length > 0 && (
            <div className="company-result-list">
              {results.map((company) => {
                const companyId = company.companyId ?? company.id;

                const companyName =
                  company.companyName ?? company.name ?? "기업명 없음";

                const logoUrl = getCompanyLogo(companyName);

                const watched = companyId ? isWatched(companyId) : false;

                return (
                  <article
                    className="company-result"
                    key={companyId ?? companyName}
                  >
                    <div
                      className="company-result-main"
                      role="button"
                      tabIndex={0}
                      onClick={() => handleCompanyClick(company)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleCompanyClick(company);
                        }
                      }}
                    >
                      {/* 기업 로고 */}
                      <span
                        className="company-result-mark"
                        style={{
                          width: "56px",
                          height: "56px",
                          minWidth: "56px",
                          minHeight: "56px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          borderRadius: "14px",
                          background: "#ffffff",
                          border: "1px solid #e5e7eb",
                          overflow: "hidden",
                          boxSizing: "border-box",
                        }}
                      >
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={`${companyName} 로고`}
                            style={{
                              width: "38px",
                              height: "38px",
                              objectFit: "contain",
                            }}
                            onError={(event) => {
                              event.currentTarget.style.display = "none";

                              const fallback =
                                event.currentTarget.nextElementSibling;

                              if (fallback) {
                                fallback.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}

                        {/* 로고를 불러오지 못했을 때 */}
                        <span
                          style={{
                            display: logoUrl ? "none" : "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            height: "100%",
                            fontSize: "16px",
                            fontWeight: 700,
                            color: "#111827",
                          }}
                        >
                          {companyName.charAt(0)}
                        </span>

                        {logoUrl && (
                          <span
                            style={{
                              display: "none",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "100%",
                              height: "100%",
                              fontSize: "16px",
                              fontWeight: 700,
                              color: "#111827",
                            }}
                          >
                            {companyName.charAt(0)}
                          </span>
                        )}
                      </span>

                      {/* 기업 정보 */}
                      <span className="company-result-copy">
                        <strong>{companyName}</strong>

                        {company.score !== undefined && (
                          <em>
                            검색 정확도 {Math.round(company.score * 100)}%
                          </em>
                        )}
                      </span>

                      {/* 관심기업 버튼 */}
                      {companyId && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleWatch(companyId);
                          }}
                          style={{
                            marginLeft: "auto",
                            marginRight: "12px",
                            border: "1px solid #e5e7eb",
                            background: watched ? "#111827" : "#ffffff",
                            color: watched ? "#ffffff" : "#6b7280",
                            borderRadius: "10px",
                            padding: "8px 12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {watched ? "관심기업" : "관심등록"}
                        </button>
                      )}

                      {/* 화살표 */}
                      <span className="company-result-arrow">›</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
