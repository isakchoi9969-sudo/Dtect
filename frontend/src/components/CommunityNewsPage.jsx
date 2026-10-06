import { useEffect, useMemo, useState } from "react";
import CommunitySharedLayout from "./CommunitySharedLayout";
import CompanyNewsCard from "./CompanyNewsCard";
import CommunityPagination from "./CommunityPagination";
import { api } from "../config/api";

const NEWS_PER_PAGE = 25;
const NEWS_INDUSTRIES = [
  "전체",
  "특허",
  "AI",
  "반도체",
  "배터리",
  "바이오",
  "로봇",
  "모빌리티",
  "방산",
  "조선",
  "에너지",
];

function CommunityNewsLoader() {
  return (
    <div className="company-news-loading" role="status" aria-live="polite">
      <span className="company-news-loading-orbit" aria-hidden="true" />
      <strong>산업별 최신 뉴스를 불러오고 있습니다.</strong>
      <p>9개 산업의 기사를 준비하고 있어요. 잠시만 기다려 주세요.</p>
    </div>
  );
}

/** 최초 한 번 산업별 스냅샷을 받고, 이후 태그는 받은 데이터 안에서 즉시 전환합니다. */
export default function CommunityNewsPage() {
  const [selectedIndustry, setSelectedIndustry] = useState("전체");
  const [page, setPage] = useState(1);
  const [snapshot, setSnapshot] = useState(null);
  const [isNewsLoading, setIsNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);
  const [patentSnapshot, setPatentSnapshot] = useState(null);
  const [isPatentLoading, setIsPatentLoading] = useState(false);
  const [patentError, setPatentError] = useState("");
  const [patentReloadCount, setPatentReloadCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    api
      .get("/api/news/community/all", { signal: controller.signal })
      .then((response) => {
        if (!controller.signal.aborted) setSnapshot(response.data);
      })
      .catch((error) => {
        if (error.code === "ERR_CANCELED" || controller.signal.aborted) return;
        setNewsError(
          error.response?.data?.message ||
            "산업 뉴스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsNewsLoading(false);
      });

    return () => controller.abort();
  }, [reloadCount]);

  useEffect(() => {
    if (selectedIndustry !== "특허" || patentSnapshot) return undefined;
    const controller = new AbortController();
    api.get("/api/news/community/patents", { signal: controller.signal })
      .then((response) => {
        if (!controller.signal.aborted) setPatentSnapshot(response.data);
      })
      .catch((error) => {
        if (error.code === "ERR_CANCELED" || controller.signal.aborted) return;
        setPatentError(error.response?.data?.message || "특허 뉴스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsPatentLoading(false);
      });
    return () => controller.abort();
  }, [selectedIndustry, patentReloadCount, patentSnapshot]);

  const selectedNews = useMemo(() => {
    if (selectedIndustry === "특허") return patentSnapshot?.items || [];
    if (!snapshot) return [];
    return selectedIndustry === "전체"
      ? snapshot.all?.items || []
      : snapshot.industries?.[selectedIndustry]?.items || [];
  }, [selectedIndustry, snapshot, patentSnapshot]);
  const returnedCount =
    selectedIndustry === "특허"
      ? patentSnapshot?.returnedCount ?? selectedNews.length
      : selectedIndustry === "전체"
      ? snapshot?.all?.returnedCount ?? selectedNews.length
      : snapshot?.industries?.[selectedIndustry]?.returnedCount ??
        selectedNews.length;
  const totalPages = Math.ceil(selectedNews.length / NEWS_PER_PAGE);
  const currentNews = selectedNews.slice(
    (page - 1) * NEWS_PER_PAGE,
    page * NEWS_PER_PAGE,
  );

  const selectIndustry = (industry) => {
    if (industry === "특허" && !patentSnapshot) {
      setIsPatentLoading(true);
      setPatentError("");
    }
    setSelectedIndustry(industry);
    setPage(1);
  };

  return (
    <CommunitySharedLayout
      eyebrow="COMPANY NEWS"
      title="기업 신소식"
      description="산업별 신기술과 기술개발, 연구개발 및 신사업 동향을 한곳에서 확인하세요."
    >
      <section className="company-news-feed" aria-label="기업 신소식 목록">
        <div className="company-news-feed-heading">
          <div>
            <span>TECHNOLOGY & BUSINESS</span>
            <h2>기술·사업 동향</h2>
          </div>
          <p>산업별 최신 기업·기술·사업 동향을 확인하세요.</p>
        </div>
        {selectedIndustry !== "특허" && isNewsLoading ? (
          <CommunityNewsLoader />
        ) : selectedIndustry !== "특허" && newsError ? (
          <div className="company-news-state" role="alert">
            <strong>뉴스를 불러오지 못했습니다.</strong>
            <p>{newsError}</p>
            <button type="button" onClick={() => {
              setIsNewsLoading(true);
              setNewsError("");
              setReloadCount((count) => count + 1);
            }}>
              다시 불러오기
            </button>
          </div>
        ) : (
          <>
        <div className="company-news-industries" aria-label="산업 필터">
          {NEWS_INDUSTRIES.map((industry) => (
            <button
              key={industry}
              type="button"
              className={selectedIndustry === industry ? "is-active" : ""}
              aria-pressed={selectedIndustry === industry}
              onClick={() => selectIndustry(industry)}
            >
              {industry}
            </button>
          ))}
        </div>
        {selectedIndustry === "특허" && isPatentLoading ? (
          <div className="company-news-state" role="status">
            <strong>2026년 특허 뉴스를 불러오고 있습니다.</strong>
            <p>신규 출원·등록 보도를 확인하고 있습니다.</p>
          </div>
        ) : selectedIndustry === "특허" && patentError ? (
          <div className="company-news-state" role="alert">
            <strong>특허 뉴스를 불러오지 못했습니다.</strong>
            <p>{patentError}</p>
            <button type="button" onClick={() => {
              setPatentSnapshot(null);
              setIsPatentLoading(true);
              setPatentError("");
              setPatentReloadCount((count) => count + 1);
            }}>다시 불러오기</button>
          </div>
        ) : (
          <>
            <p className="company-news-count">
              {selectedIndustry === "특허" ? "2026년 신규 특허 출원·등록 뉴스" : selectedIndustry} · {returnedCount}건
              {selectedIndustry === "특허" && totalPages > 0 && ` · ${page}/${totalPages}페이지 · 페이지당 25건`}
            </p>
            {selectedIndustry === "특허" && (
              <p className="company-news-count">
                기사 발행일 기준입니다. 분쟁·침해 관련 보도는 제외하며, 특허청의 공식 등록 목록과는 다를 수 있습니다.
              </p>
            )}
            <div className="company-news-grid">
              {currentNews.map((news) => <CompanyNewsCard key={news.link} news={news} />)}
              {currentNews.length === 0 && (
                <p className="company-news-empty">
                  {selectedIndustry === "특허"
                    ? "2026년 발행된 신규 특허 출원·등록 보도를 찾지 못했습니다."
                    : "현재 조건에서 확인된 뉴스가 없습니다."}
                </p>
              )}
            </div>
            <CommunityPagination currentPage={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
          </>
        )}
      </section>
    </CommunitySharedLayout>
  );
}
