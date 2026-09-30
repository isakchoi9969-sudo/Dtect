import { useMemo, useState } from "react";
import CommunitySharedLayout from "./CommunitySharedLayout";
import CompanyNewsCard from "./CompanyNewsCard";
import CommunityPagination from "./CommunityPagination";
import { COMPANY_NEWS_DUMMY, NEWS_INDUSTRIES } from "../data/companyNewsDummy";

const NEWS_PER_PAGE = 20;

/** 실제 뉴스 API 연결 전, 기업 신소식 화면의 공통 UI 진입점입니다. */
export default function CommunityNewsPage() {
  const [selectedIndustry, setSelectedIndustry] = useState("전체");
  const [page, setPage] = useState(1);
  const filteredNews = useMemo(
    () => selectedIndustry === "전체"
      ? COMPANY_NEWS_DUMMY
      : COMPANY_NEWS_DUMMY.filter((item) => item.industry === selectedIndustry),
    [selectedIndustry],
  );
  const totalPages = Math.ceil(filteredNews.length / NEWS_PER_PAGE);
  const currentNews = filteredNews.slice((page - 1) * NEWS_PER_PAGE, page * NEWS_PER_PAGE);

  const selectIndustry = (industry) => {
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
          <p>현재는 화면 검토용 더미 뉴스입니다.</p>
        </div>
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
        <p className="company-news-count">{selectedIndustry} · {filteredNews.length}건</p>
        <div className="company-news-grid">
          {currentNews.map((news) => <CompanyNewsCard key={news.id} news={news} />)}
        </div>
        <CommunityPagination currentPage={page} totalPages={totalPages} onChange={setPage} />
      </section>
    </CommunitySharedLayout>
  );
}
