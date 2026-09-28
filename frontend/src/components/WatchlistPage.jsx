import { useWatchlist } from "../hooks/useWatchlist";
import { ROUTES } from "../config/routes";
import Header from "./Header";

const watchlistStyles = String.raw`/* Scoped to the watchlist content only; the shared Header is intentionally untouched. */
.watchlist-page-content {
  --watchlist-ink: #162b3a;
  --watchlist-muted: #738390;
  --watchlist-line: rgba(31, 62, 77, 0.09);
  --watchlist-accent: #0878E8;
  --watchlist-ease: cubic-bezier(0.23, 1, 0.32, 1);
  position: relative;
  isolation: isolate;
  width: min(100% - 40px, 1120px);
  margin: 0 auto;
  padding: clamp(34px, 5vw, 58px) 0 76px;
  color: var(--watchlist-ink);
}

.watchlist-page-content::before {
  position: absolute;
  z-index: -1;
  top: 8px;
  right: -105px;
  width: 310px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(55, 157, 143, 0.11), transparent 70%);
  content: "";
  pointer-events: none;
}

.watchlist-page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
  animation: watchlist-rise-in 420ms var(--watchlist-ease) both;
}

.watchlist-heading-copy > p,
.watchlist-empty-eyebrow {
  margin: 0 0 9px;
  color: var(--watchlist-accent);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.19em;
}

.watchlist-heading-copy h1 {
  margin: 0;
  color: #132b3a;
  font-size: clamp(27px, 4vw, 36px);
  font-weight: 760;
  letter-spacing: -0.055em;
  line-height: 1.15;
}

.watchlist-heading-copy > span {
  display: block;
  margin-top: 10px;
  color: var(--watchlist-muted);
  font-size: 13px;
  line-height: 1.65;
}

.watchlist-count {
  display: flex;
  flex: 0 0 auto;
  align-items: baseline;
  gap: 2px;
  padding: 10px 14px;
  border: 1px solid rgba(15, 118, 110, 0.12);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 7px 24px rgba(23, 55, 67, 0.055);
  color: #7b8b95;
  font-size: 12px;
  font-weight: 600;
}

.watchlist-count-value {
  color: var(--watchlist-accent);
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.06em;
}

.watchlist-count small {
  font-size: 11px;
}

.watchlist-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 13px;
}

.watchlist-card {
  position: relative;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--watchlist-line);
  border-radius: 17px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 18px rgba(24, 54, 66, 0.035);
  transition: transform 200ms var(--watchlist-ease), box-shadow 200ms var(--watchlist-ease), border-color 200ms var(--watchlist-ease), background-color 200ms var(--watchlist-ease);
  animation: watchlist-rise-in 420ms var(--watchlist-ease) both;
}

.watchlist-card::after {
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: linear-gradient(180deg, #58b5a3, #0878E8);
  content: "";
  opacity: 0;
  transform: scaleY(0.55);
  transition: opacity 180ms var(--watchlist-ease), transform 180ms var(--watchlist-ease);
}

.watchlist-card-main {
  display: flex;
  width: 100%;
  min-height: 112px;
  align-items: center;
  gap: 13px;
  padding: 17px 60px 17px 17px;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
}

.watchlist-card-main:focus-visible,
.watchlist-remove:focus-visible,
.watchlist-empty a:focus-visible {
  outline: 3px solid rgba(15, 118, 110, 0.34);
  outline-offset: 3px;
}

.watchlist-card-mark {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  place-items: center;
  border: 1px solid rgba(15, 118, 110, 0.1);
  border-radius: 13px;
  background: linear-gradient(145deg, #edf8f6, #e2f0ed);
  color: #0878E8;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.watchlist-card-copy {
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
}

.watchlist-company-title {
  display: flex;
  max-width: 100%;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.watchlist-company-title strong {
  overflow: hidden;
  color: #203746;
  font-size: 15px;
  font-weight: 750;
  letter-spacing: -0.035em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.watchlist-company-title small {
  flex: 0 0 auto;
  color: #93a0a9;
  font-size: 10px;
  font-weight: 650;
  letter-spacing: 0.02em;
}

.watchlist-industry {
  color: #668079;
  font-size: 11px;
  font-weight: 650;
}

.watchlist-company-info {
  display: -webkit-box;
  overflow: hidden;
  max-width: 100%;
  color: #84919a;
  font-size: 11px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.watchlist-risk {
  display: flex;
  flex: 0 0 91px;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  margin-left: auto;
  text-align: right;
}

.watchlist-risk small {
  color: #98a4aa;
  font-size: 9px;
  font-weight: 600;
}

.watchlist-risk b {
  color: #0878E8;
  font-size: 12px;
  font-style: normal;
  font-weight: 750;
}

.watchlist-risk i {
  color: #60727c;
  font-size: 10px;
  font-style: normal;
  font-weight: 650;
}

.watchlist-risk[class*="high"] b,
.watchlist-risk[class*="critical"] b,
.watchlist-risk[class*="높음"] b,
.watchlist-risk[class*="심각"] b {
  color: #c4514c;
}

.watchlist-risk[class*="medium"] b,
.watchlist-risk[class*="moderate"] b,
.watchlist-risk[class*="보통"] b,
.watchlist-risk[class*="중간"] b {
  color: #b77a27;
}

.watchlist-remove {
  position: absolute;
  top: 12px;
  right: 12px;
  display: grid;
  width: 29px;
  height: 29px;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 10px;
  background: #f6f8f7;
  color: #c2a257;
  cursor: pointer;
  transition: transform 160ms var(--watchlist-ease), color 160ms var(--watchlist-ease), background-color 160ms var(--watchlist-ease), border-color 160ms var(--watchlist-ease);
}

.watchlist-remove span {
  font-size: 14px;
  line-height: 1;
}

.watchlist-error {
  margin: 0 0 16px;
  padding: 12px 15px;
  border: 1px solid rgba(199, 75, 75, 0.16);
  border-radius: 12px;
  background: #fff6f5;
  color: #ad4545;
  font-size: 13px;
}

.watchlist-loading {
  display: flex;
  min-height: 140px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--watchlist-muted);
  font-size: 13px;
}

.watchlist-loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #0878E8;
  box-shadow: 0 0 0 5px rgba(47, 154, 141, 0.12);
  animation: watchlist-pulse 1.25s ease-in-out infinite;
}

.watchlist-empty {
  display: flex;
  min-height: 265px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 38px 20px;
  border: 1px dashed rgba(41, 91, 96, 0.2);
  border-radius: 20px;
  background: linear-gradient(145deg, rgba(255,255,255,0.82), rgba(239,248,246,0.62));
  text-align: center;
  animation: watchlist-rise-in 420ms var(--watchlist-ease) both;
}

.watchlist-empty-mark {
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  margin-bottom: 17px;
  border-radius: 18px;
  background: #e8f4f1;
  color: #0878E8;
  font-size: 29px;
}

.watchlist-empty-eyebrow {
  margin-bottom: 7px;
  font-size: 9px;
}

.watchlist-empty h2 {
  margin: 0;
  color: #203746;
  font-size: 18px;
  font-weight: 750;
  letter-spacing: -0.04em;
}

.watchlist-empty > p:not(.watchlist-empty-eyebrow) {
  margin: 9px 0 18px;
  color: var(--watchlist-muted);
  font-size: 12px;
  line-height: 1.6;
}

.watchlist-empty a {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border: 1px solid rgba(15, 118, 110, 0.12);
  border-radius: 11px;
  background: #0878E8
  box-shadow: 0 5px 14px rgba(20, 122, 112, 0.15);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 160ms var(--watchlist-ease), background-color 160ms var(--watchlist-ease), box-shadow 160ms var(--watchlist-ease);
}

@media (hover: hover) and (pointer: fine) {
  .watchlist-card:hover {
    transform: translateY(-3px);
    border-color: rgba(15, 118, 110, 0.2);
    background: #fff;
    box-shadow: 0 14px 32px rgba(24, 54, 66, 0.09);
  }

  .watchlist-card:hover::after {
    opacity: 1;
    transform: scaleY(1);
  }

  .watchlist-card:hover .watchlist-card-mark {
    transform: translateY(-1px);
  }

  .watchlist-card-mark {
    transition: transform 180ms var(--watchlist-ease);
  }

  .watchlist-remove:hover {
    transform: rotate(-8deg) scale(1.06);
    border-color: rgba(185, 145, 49, 0.16);
    background: #fff7df;
    color: #ae842a;
  }

  .watchlist-empty a:hover {
    transform: translateY(-2px);
    background: #0878E8;
    box-shadow: 0 8px 18px rgba(20, 122, 112, 0.22);
  }
}

.watchlist-card:active .watchlist-card-main,
.watchlist-remove:active,
.watchlist-empty a:active {
  transform: scale(0.985);
}

@media (min-width: 700px) {
  .watchlist-card:nth-child(2) { animation-delay: 35ms; }
  .watchlist-card:nth-child(3) { animation-delay: 70ms; }
  .watchlist-card:nth-child(4) { animation-delay: 105ms; }
  .watchlist-card:nth-child(5) { animation-delay: 140ms; }
  .watchlist-card:nth-child(6) { animation-delay: 175ms; }
  .watchlist-card:nth-child(n + 7) { animation-delay: 210ms; }
}

@media (max-width: 699px) {
  .watchlist-page-content {
    width: min(100% - 30px, 540px);
    padding-top: 30px;
  }

  .watchlist-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
  }

  .watchlist-card-main {
    min-height: 102px;
    gap: 11px;
    padding: 14px 53px 14px 14px;
  }

  .watchlist-card-mark {
    width: 38px;
    height: 38px;
    flex-basis: 38px;
    border-radius: 12px;
  }

  .watchlist-risk {
    flex-basis: 78px;
  }
}

@media (max-width: 430px) {
  .watchlist-page-heading {
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 21px;
  }

  .watchlist-heading-copy > span {
    max-width: 255px;
    font-size: 12px;
  }

  .watchlist-count {
    gap: 0;
    padding: 8px 10px;
    border-radius: 12px;
  }

  .watchlist-count-value {
    font-size: 19px;
  }

  .watchlist-count small {
    font-size: 10px;
  }

  .watchlist-card-main {
    gap: 9px;
    padding-right: 46px;
  }

  .watchlist-risk {
    flex-basis: 66px;
  }

  .watchlist-risk small {
    font-size: 8px;
  }

  .watchlist-company-title strong {
    font-size: 14px;
  }
}

@keyframes watchlist-rise-in {
  from { opacity: 0; transform: translateY(9px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes watchlist-pulse {
  50% { opacity: 0.55; transform: scale(0.88); }
}

@media (prefers-reduced-motion: reduce) {
  .watchlist-page-content *,
  .watchlist-page-content *::before,
  .watchlist-page-content *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

export default function WatchlistPage() {
  const { companies, toggleCompany, count, limit, loading, error } =
    useWatchlist();

  const openAnalysis = (company) => {
    window.location.assign(
      `${ROUTES.COMPANY_DETAIL}?companyId=${company.companyId}`,
    );
  };

  return (
    <>
      <style>{watchlistStyles}</style>
      <Header />

      <section className="watchlist-page-content">
        <header className="watchlist-page-heading">
          <div className="watchlist-heading-copy">
            <p>MY WATCHLIST</p>
            <h1>관심 기업</h1>
            <span>별표로 저장한 기업의 리스크 변화를 한눈에 확인하세요.</span>
          </div>

          <strong
            className="watchlist-count"
            aria-label={`관심 기업 ${count}개, 최대 ${limit}개`}
          >
            <span className="watchlist-count-value">{count}</span>
            <small> / {limit}개</small>
          </strong>
        </header>

        {error && (
          <p className="watchlist-error" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <div className="watchlist-loading" role="status" aria-live="polite">
            <span className="watchlist-loading-dot" aria-hidden="true" />
            관심기업을 불러오는 중입니다.
          </div>
        ) : companies.length > 0 ? (
          <div className="watchlist-grid">
            {companies.map((company) => (
              <article className="watchlist-card" key={company.companyId}>
                <button
                  className="watchlist-card-main"
                  onClick={() => openAnalysis(company)}
                  type="button"
                  aria-label={`${company.companyName} 분석 보기`}
                >
                  <span className="watchlist-card-mark" aria-hidden="true">
                    {company.companyName.slice(0, 2)}
                  </span>

                  <span className="watchlist-card-copy">
                    <span className="watchlist-company-title">
                      <strong>{company.companyName}</strong>
                      <small>{company.stockCode}</small>
                    </span>

                    <span className="watchlist-industry">
                      {company.industry}
                    </span>

                    <span className="watchlist-company-info">
                      {company.companyInfo}
                    </span>
                  </span>

                  {company.riskLevel && (
                    <span
                      className={`watchlist-risk risk-${company.riskLevel}`}
                      aria-label={`현재 위험도 ${company.riskLevel}, ${company.riskScore}점`}
                    >
                      <small>현재 위험도</small>
                      <b>{company.riskLevel}</b>
                      <i>{company.riskScore}점</i>
                    </span>
                  )}
                </button>

                <button
                  aria-label={`${company.companyName} 관심기업 해제`}
                  className="watchlist-remove"
                  onClick={() => toggleCompany(company.companyId)}
                  type="button"
                  title="관심기업 해제"
                >
                  <span aria-hidden="true">★</span>
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="watchlist-empty">
            <span className="watchlist-empty-mark" aria-hidden="true">
              ☆
            </span>
            <p className="watchlist-empty-eyebrow">YOUR WATCHLIST</p>
            <h2>등록한 관심기업이 없습니다.</h2>
            <p>기업 검색에서 별표를 눌러 관심기업을 추가해 보세요.</p>
            <a href={ROUTES.COMPANY_SEARCH}>기업 검색하기</a>
          </div>
        )}
      </section>
    </>
  );
}
