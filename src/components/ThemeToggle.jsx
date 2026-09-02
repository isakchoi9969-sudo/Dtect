import { useEffect, useState } from "react";

const THEME_KEY = "dtect-theme";

function getInitialTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function ThemeToggle({ className = "" }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      aria-pressed={isDark}
      title={isDark ? "라이트 모드" : "다크 모드"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <svg className="theme-icon sun" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3.7" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg className="theme-icon moon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.2 15.2A8.6 8.6 0 0 1 8.8 3.8a8.6 8.6 0 1 0 11.4 11.4Z" />
      </svg>
    </button>
  );
}

export default ThemeToggle;
