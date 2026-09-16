import Header from "./Header";

function initials(name) {
  return name.length > 3 ? name.slice(0, 2) : name;
}

export default function AnalysisLayout({
  children,
  companies = [],
  selectedCompanyId,
  onSelectCompany,
}) {
  return (
    <div className="analysis-app">
      <Header />
      <div className={`analysis-shell ${companies.length === 0 ? "without-sidebar" : ""}`}>
        {companies.length > 0 && <aside className="analysis-sidebar" aria-label="관심 기업">
          <div className="analysis-sidebar-heading">
            <span>MY WATCHLIST</span>
            <button type="button" aria-label="관심 기업 추가">+</button>
          </div>
          <div className="analysis-company-list">
            {companies.map((company) => {
              const isSelected = company.id === selectedCompanyId;
              return (
                <button
                  className={isSelected ? "is-selected" : ""}
                  key={company.id ?? company.ticker ?? company.name}
                  onClick={() => onSelectCompany?.(company.id)}
                  type="button"
                >
                  <span className="analysis-company-mark">{initials(company.name)}</span>
                  <span>
                    <strong>{company.name}</strong>
                    <small>{company.ticker ?? company.code} · {company.market ?? "KOSPI"}</small>
                  </span>
                  {company.change !== undefined && (
                    <em className={String(company.change).startsWith("-") ? "is-down" : "is-up"}>
                      {company.change}%
                    </em>
                  )}
                </button>
              );
            })}
          </div>
          <button className="analysis-add-company" type="button">+ 관심 기업 추가</button>
          <div className="analysis-sidebar-footer">
            <a href="#settings">설정</a>
            <a href="#help">도움말</a>
          </div>
        </aside>}
        <main className="analysis-content">{children}</main>
      </div>
    </div>
  );
}
