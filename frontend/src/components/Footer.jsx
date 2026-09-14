function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <strong className="footer-logo">D:TECT</strong>

        <p>© {new Date().getFullYear()} D:TECT</p>

        <div className="footer-links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
