import { ROUTES } from "../config/routes.js";

// 복귀 주소는 같은 사이트의 일반 화면만 허용한다.
export function safeReturnPath(value) {
  if (typeof value !== "string" || !value.startsWith("/") ||
    value.startsWith("//") || value.includes("\\") ||
    [...value].some((character) => character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127)) return ROUTES.HOME;

  try {
    const target = new URL(value, "https://dtect.local");
    const pathname = target.pathname.replace(/\/+$/, "") || "/";
    if (target.origin !== "https://dtect.local" ||
      [ROUTES.LOGIN, ROUTES.SIGNUP].includes(pathname)) return ROUTES.HOME;
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return ROUTES.HOME;
  }
}

export function getAuthReturnPath(search = window.location.search) {
  return safeReturnPath(new URLSearchParams(search).get("returnTo"));
}

export function buildAuthUrl(route, returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`) {
  return `${route}?${new URLSearchParams({ returnTo: safeReturnPath(returnTo) })}`;
}
