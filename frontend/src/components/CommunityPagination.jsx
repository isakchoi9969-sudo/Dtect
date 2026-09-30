function pageNumbers(currentPage, totalPages) {
  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  return Array.from({ length: Math.min(5, totalPages) }, (_, index) => start + index);
}

/** 더미 데이터와 추후 API 목록 모두에 재사용할 수 있는 페이지네이션입니다. */
export default function CommunityPagination({ currentPage, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="community-content-pagination" aria-label="뉴스 페이지">
      <button type="button" onClick={() => onChange(currentPage - 1)} disabled={currentPage === 1}>이전</button>
      {pageNumbers(currentPage, totalPages).map((page) => (
        <button
          type="button"
          key={page}
          className={page === currentPage ? "is-active" : ""}
          aria-current={page === currentPage ? "page" : undefined}
          onClick={() => onChange(page)}
        >
          {page}
        </button>
      ))}
      <button type="button" onClick={() => onChange(currentPage + 1)} disabled={currentPage === totalPages}>다음</button>
    </nav>
  );
}
