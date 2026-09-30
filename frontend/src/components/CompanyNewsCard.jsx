/** API 뉴스 데이터에 맞춘 최소 정보형 카드입니다. */
export default function CompanyNewsCard({ news }) {
  return (
    <a
      className="company-news-card"
      href={news.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`${news.title} 원문 보기`}
    >
      <span className="company-news-card-industry">{news.industry}</span>
      <strong>{news.title}</strong>
      <div className="company-news-card-meta">
        <span>{news.company}</span>
        <span>{news.press}</span>
        <time>{news.publishedAt}</time>
      </div>
    </a>
  );
}
