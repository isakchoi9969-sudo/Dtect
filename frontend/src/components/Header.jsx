import { useEffect, useRef, useState } from "react";
import { navigationItems } from "../data/landingData";
import { ROUTES } from "../config/routes";
import { api } from "../config/api";
import ThemeToggle from "./ThemeToggle";

const copy = {
  homeLabel: "D:TECT \uba54\uc778 \ud398\uc774\uc9c0",
  primaryMenu: "\uc8fc\uc694 \uba54\ub274",
  paidService: "\uc720\ub8cc \uc11c\ube44\uc2a4",
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

    api
      .get("/api/auth/me", { signal: controller.signal })
      .then((response) => setCurrentUser(response.data.user))
      .catch((error) => {
        if (error.name !== "CanceledError" && error.response?.status !== 401) {
          console.error("로그인 정보 확인 실패:", error);
        }
      });

    return () => controller.abort();
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
      window.location.href = ROUTES.HOME;
    }
  };

  const getChildHref = (item, child) => {
    const childIndex = item.children.indexOf(child);
    if (item.href === ROUTES.DASHBOARD && childIndex === 0)
      return ROUTES.DASHBOARD_WATCHLIST;
    if (item.href === ROUTES.DASHBOARD && childIndex === 1)
      return ROUTES.DASHBOARD_ISSUE_RISK;
    if (item.href === ROUTES.COMPANY_ANALYSIS && childIndex === 0)
      return ROUTES.COMPANY_SEARCH;
    if (item.href === ROUTES.COMPANY_ANALYSIS && childIndex === 1)
      return ROUTES.COMPANY_WATCHLIST;
    if (item.href === ROUTES.RESPONSE_CENTER && childIndex === 0)
      return ROUTES.CASE_SIMULATOR;
    if (item.href === ROUTES.RESPONSE_CENTER && childIndex === 1)
      return ROUTES.RESPONSE_GENERATOR;
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
        <nav
          className="desktop-nav"
          aria-label={copy.primaryMenu}
        >
          {navigationItems.map((item) => (
            <div className="nav-item" key={item.title}>
              <a href={item.href} className="nav-link">
                {item.title}
              </a>
              <div className="dropdown">
                <div className="dropdown-inner">
                  {item.paidService && (
                    <span className="business-badge">{copy.paidService}</span>
                  )}
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
              <button
                type="button"
                className="login-button desktop-login"
                onClick={handleLogout}
              >
                로그아웃
              </button>
            </>
          ) : (
            <a href={ROUTES.LOGIN} className="login-button desktop-login">
              {copy.login}
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
                  {item.paidService && (
                    <span className="business-badge">{copy.paidService}</span>
                  )}
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
            <button
              type="button"
              className="login-button mobile-login"
              onClick={handleLogout}
            >
              로그아웃
            </button>
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
    </header>
  );
}

export default Header;
