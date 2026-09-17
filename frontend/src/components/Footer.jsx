function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          {/* 왼쪽: 로고 + 카피 */}
          <div className="footer-brand">
            <strong className="footer-logo">D:TECT</strong>
            <p className="footer-copy">
              © {currentYear} D:TECT. All rights reserved.
            </p>
          </div>

          {/* 오른쪽: 링크 */}
          <nav className="footer-links" aria-label="Footer navigation">
            <a href="/privacy" className="footer-link">
              Privacy Policy
            </a>
            <span className="footer-divider" aria-hidden="true">
              ·
            </span>
            <a href="/terms" className="footer-link">
              Terms of Service
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
