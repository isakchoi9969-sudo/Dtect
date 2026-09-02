import { useEffect, useRef, useState } from "react";
import { navigationItems } from "../data/landingData";
import { ROUTES } from "../config/routes";
import ThemeToggle from "./ThemeToggle";

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(null);
  const menuRef = useRef(null);

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

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [mobileOpen]);

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setOpenMobileMenu(null);
  };

  const getChildHref = (item, child) => {
    if (item.title === "기업 분석" && child === "감성·리스크 분석") {
      return ROUTES.SENTIMENT_RISK;
    }

    return item.href;
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <a
          href={ROUTES.HOME}
          className="logo"
          aria-label="D:TECT 메인페이지"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          D:TECT
        </a>

        <nav className="desktop-nav" aria-label="주요 메뉴">
          {navigationItems.map((item) => (
            <div className="nav-item" key={item.title}>
              <a href={item.href} className="nav-link">
                {item.title}
              </a>

              <div className="dropdown">
                <div className="dropdown-inner">
                  {item.businessOnly && (
                    <span className="business-badge">기업회원 전용</span>
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
          <a href={ROUTES.LOGIN} className="login-button desktop-login">
            로그인
          </a>
        </div>

        <button
          className={`mobile-menu-button ${mobileOpen ? "is-open" : ""}`}
          type="button"
          aria-label="메뉴 열기"
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
                  {item.businessOnly && (
                    <span className="business-badge">기업회원 전용</span>
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

          <a
            href={ROUTES.LOGIN}
            className="login-button mobile-login"
            onClick={closeMobileMenu}
          >
            로그인
          </a>

        </div>
      </div>
    </header>
  );
}

export default Header;
