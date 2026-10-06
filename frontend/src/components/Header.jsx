import { useEffect, useRef, useState } from "react";
import { navigationItems } from "../data/landingData";
import { ROUTES } from "../config/routes";
import { api } from "../config/api";
import ThemeToggle from "./ThemeToggle";
import RiskSurgeToast from "./RiskSurgeToast";

const copy = {
  homeLabel: "D:TECT \uba54\uc778 \ud398\uc774\uc9c0",
  primaryMenu: "\uc8fc\uc694 \uba54\ub274",
  login: "\ub85c\uadf8\uc778",
  openMenu: "\uba54\ub274 \uc5f4\uae30",
};

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const handleUserUpdated = (event) => setCurrentUser(event.detail);

    api
      .get("/api/auth/me", { signal: controller.signal })
      .then((response) => setCurrentUser(response.data.user))
      .catch((error) => {
        if (error.name !== "CanceledError" && error.response?.status !== 401) {
          console.error("로그인 정보 확인 실패:", error);
        }
      });

    window.addEventListener("dtect-user-updated", handleUserUpdated);

    return () => {
      controller.abort();
      window.removeEventListener("dtect-user-updated", handleUserUpdated);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        mobileOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMobileOpen(false);
        setOpenMobileMenu(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [mobileOpen]);

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setOpenMobileMenu(null);
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    } finally {
      localStorage.removeItem("isLoggedIn");
      window.location.href = ROUTES.HOME;
    }
  };

  const getChildHref = (item, child) => {
    const childIndex = item.children.indexOf(child);
    if (item.href === ROUTES.COMPANY_ANALYSIS && childIndex === 0)
      return ROUTES.COMPANY_SEARCH;
    if (item.href === ROUTES.COMPANY_ANALYSIS && childIndex === 1)
      return ROUTES.STOCK_SEARCH;
    if (item.href === ROUTES.COMPANY_ANALYSIS && childIndex === 2)
      return ROUTES.COMPANY_WATCHLIST;

    if (item.href === ROUTES.RESPONSE_CENTER && childIndex === 0)
      return ROUTES.CASE_SIMULATOR;
    if (item.href === ROUTES.RESPONSE_CENTER && childIndex === 1)
      return ROUTES.RESPONSE_GENERATOR;
    if (item.href === ROUTES.RESPONSE_CENTER && childIndex === 2)
      return ROUTES.RISK_ALERT;

    // 커뮤니티
    if (item.href === ROUTES.COMUNITY && childIndex === 0)
      return ROUTES.COMUNITY;

    if (item.href === ROUTES.COMUNITY && childIndex === 1)
      return ROUTES.COMMUNITY_STOCK;

    if (item.href === ROUTES.COMUNITY && childIndex === 2)
      return ROUTES.COMMUNITY_NEWS;

    if (item.href === ROUTES.COMUNITY && childIndex === 3)
      return ROUTES.COMMUNITY_COMPANY_HUB;

    return item.href;
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <a
          href={ROUTES.HOME}
          className="logo"
          aria-label={copy.homeLabel}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          D:TECT
        </a>
        <nav className="desktop-nav" aria-label={copy.primaryMenu}>
          {navigationItems.map((item) => (
            <div className="nav-item" key={item.title}>
              <a
                href={getChildHref(item, item.children[0])}
                className="nav-link"
              >
                {item.title}
              </a>
              <div className="dropdown">
                <div className="dropdown-inner">
                  {item.children.map((child) => (
                    <a href={getChildHref(item, child)} key={child}>
                      {child}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>
        <div className="landing-header-actions">
          <ThemeToggle />
          {currentUser ? (
            <>
              <span className="header-user-name">{currentUser.name} 님</span>
              <a
                href={ROUTES.MYPAGE}
                className="header-icon-button desktop-login"
                aria-label="마이페이지"
                title="마이페이지"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 20c0-3.3 3.6-5.5 8-5.5s8 2.2 8 5.5" />
                  <circle cx="12" cy="7.5" r="3.5" />
                </svg>
              </a>
              <button
                type="button"
                className="header-icon-button desktop-login"
                onClick={handleLogout}
                aria-label="로그아웃"
                title="로그아웃"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M10 5H5v14h5" />
                  <path d="M14 8l4 4-4 4M18 12H9" />
                </svg>
              </button>
            </>
          ) : (
            <a
              href={ROUTES.LOGIN}
              className="header-icon-button desktop-login"
              aria-label={copy.login}
              title={copy.login}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3v9" />
                <path d="M7.1 5.8a8 8 0 1 0 9.8 0" />
              </svg>
            </a>
          )}
        </div>
        <button
          className={`mobile-menu-button ${mobileOpen ? "is-open" : ""}`}
          type="button"
          aria-label={copy.openMenu}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
        <div
          ref={menuRef}
          id="mobile-navigation"
          className={`mobile-nav ${mobileOpen ? "is-open" : ""}`}
        >
          {navigationItems.map((item, index) => (
            <div className="mobile-nav-group" key={item.title}>
              <button
                type="button"
                className="mobile-nav-heading"
                aria-expanded={openMobileMenu === index}
                onClick={() =>
                  setOpenMobileMenu(openMobileMenu === index ? null : index)
                }
              >
                <span>{item.title}</span>
                <span aria-hidden="true">+</span>
              </button>
              {openMobileMenu === index && (
                <div className="mobile-submenu">
                  {item.children.map((child) => (
                    <a
                      href={getChildHref(item, child)}
                      key={child}
                      onClick={closeMobileMenu}
                    >
                      {child}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          {currentUser ? (
            <>
              <a
                href={ROUTES.MYPAGE}
                className="login-button mobile-login"
                onClick={closeMobileMenu}
              >
                마이페이지
              </a>
              <button
                type="button"
                className="login-button mobile-login"
                onClick={handleLogout}
              >
                로그아웃
              </button>
            </>
          ) : (
            <a
              href={ROUTES.LOGIN}
              className="login-button mobile-login"
              onClick={closeMobileMenu}
            >
              {copy.login}
            </a>
          )}
        </div>
      </div>

      {/* 로그인한 사용자가 사이트를 이용 중일 때 새 위험도 알림을 확인합니다. */}
      <RiskSurgeToast enabled={Boolean(currentUser)} />
    </header>
  );
}

export default Header;
