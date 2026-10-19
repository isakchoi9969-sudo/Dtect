import assert from "node:assert/strict";
import test from "node:test";
import { safeReturnPath, buildAuthUrl, getAuthReturnPath } from "../src/utils/authNavigation.js";

test("로그인과 회원가입 전환 시 기업 ID와 화면 위치를 보존한다", () => {
  const target = "/company-analysis/company?companyId=12#analysis";
  const signup = buildAuthUrl("/signup", target);
  const fromSignup = getAuthReturnPath(new URL(signup, "https://dtect.local").search);
  const login = buildAuthUrl("/login", fromSignup);
  assert.equal(getAuthReturnPath(new URL(login, "https://dtect.local").search), target);
  assert.equal(safeReturnPath("/company-analysis/watchlist"), "/company-analysis/watchlist");
});

test("외부 주소 및 인증 화면으로의 복귀는 차단한다", () => {
  for (const target of [null, "https://example.com", "//example.com", "/\\example.com", "/\n/example.com", "/login", "/signup?returnTo=/login", "/a/../login/", "javascript:alert(1)"]) {
    assert.equal(safeReturnPath(target), "/", String(target));
  }
  assert.equal(getAuthReturnPath(""), "/");
});
