function formatPublishedAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "발행일 미상";

  return date.toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** 커뮤니티 뉴스 API의 최소 정보형 기사 카드입니다. */
export default function CompanyNewsCard({ news }) {
  return (
    <a
      className="company-news-card"
      href={news.link || news.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`${news.title} 원문 보기`}
    >
      <span className="company-news-card-industry">{news.industry}</span>
      <strong>{news.title}</strong>
      <div className="company-news-card-meta">
        <span>{news.source || news.press}</span>
        <time>{formatPublishedAt(news.publishedAt)}</time>
      </div>
    </a>
  );
}
