const test = require("node:test");
const assert = require("node:assert/strict");
const {
  isPublishedIn2026,
  toPatentNewsArticle,
  fetchCommunityPatentNews,
  getCachedCommunityPatentNews,
  clearCommunityPatentNewsCache,
} = require("../src/services/communityPatentNews.service");

const now = new Date("2026-10-06T12:00:00+09:00");
const article = (title, pubDate = "Tue, 06 Oct 2026 09:00:00 +0900", link = "https://www.yna.co.kr/view/1", description = "") => ({
  title,
  description,
  pubDate,
  originallink: link,
  link,
});

test("2026년 한국 시간 발행일 경계를 검사하고 미래 기사는 제외한다", () => {
  assert.equal(isPublishedIn2026("Thu, 01 Jan 2026 00:00:00 +0900", now), true);
  assert.equal(isPublishedIn2026("Wed, 31 Dec 2025 23:59:59 +0900", now), false);
  assert.equal(isPublishedIn2026("Fri, 01 Jan 2027 00:00:00 +0900", now), false);
  assert.equal(isPublishedIn2026("Tue, 06 Oct 2026 13:00:00 +0900", now), false);
});

test("완료된 특허 출원·등록·취득 뉴스만 허용한다", () => {
  assert.ok(toPatentNewsArticle(article("A사, 배터리 특허 출원"), now));
  assert.ok(toPatentNewsArticle(article("B사, 반도체 특허 등록 완료"), now));
  assert.ok(toPatentNewsArticle(article("C사, 특허권 취득"), now));
  assert.equal(toPatentNewsArticle(article("D사, 특허 출원 계획 발표"), now), null);
  assert.equal(toPatentNewsArticle(article("E사, 특허 등록 추진"), now), null);
  assert.equal(toPatentNewsArticle(article("F사, 특허 기술 개발"), now), null);
  assert.equal(toPatentNewsArticle(article("G사, 특허 기술 확보"), now), null);
  assert.equal(toPatentNewsArticle(article("H사, 특허 등록결정"), now), null);
  assert.equal(toPatentNewsArticle(article("[그래픽] ESS 특허출원 비중"), now), null);
  assert.equal(toPatentNewsArticle(article("전력망용 ESS 특허출원 한국 1위"), now), null);
  assert.equal(toPatentNewsArticle(article("[특징주] 특허 등록 소식에 상한가"), now), null);
  assert.equal(toPatentNewsArticle(article("하이트진로, 맥주 거품 특허 출원", undefined, undefined,
    "지난 2024년 6월 기술 특허를 출원했고 특허청이 의견제출통지서를 보냈다."), now), null);
  assert.equal(toPatentNewsArticle(article("A사, 신규 특허 출원", undefined, undefined,
    "지난해 출원한 특허를 다시 소개했다."), now), null);
});

test("검색어 5페이지 이후도 조사해 25건 초과 기사를 모두 보존한다", async () => {
  let deepestPage = 0;
  const fetchNews = async (_query, page) => {
    deepestPage = Math.max(deepestPage, page);
    if (page < 6) {
      return { items: Array.from({ length: 50 }, (_, index) =>
        article("특허 기술 동향", undefined, `https://www.yna.co.kr/view/skip-${page}-${index}`)) };
    }
    return { items: Array.from({ length: 30 }, (_, index) =>
      article(`기업${index}, 신규 특허 출원`, undefined, `https://www.yna.co.kr/view/patent-${index}`)) };
  };
  const result = await fetchCommunityPatentNews({ fetchNews, now });
  assert.equal(deepestPage, 6);
  assert.equal(result.returnedCount, 30);
  assert.equal(result.items.slice(0, 25).length, 25);
  assert.equal(result.items.slice(25, 50).length, 5);
});

test("법적 분쟁과 무효·거절 기사, 2026년 외 기사, 미승인 언론사를 제외한다", () => {
  assert.equal(toPatentNewsArticle(article("A사, 특허 출원 둘러싼 침해 소송"), now), null);
  assert.equal(toPatentNewsArticle(article("A사, 특허 등록", undefined, undefined, "무효심판 제기"), now), null);
  assert.equal(toPatentNewsArticle(article("A사, 특허 등록 취소"), now), null);
  assert.equal(toPatentNewsArticle(article("A사, 특허 출원", "Wed, 01 Oct 2025 09:00:00 +0900"), now), null);
  assert.equal(toPatentNewsArticle(article("A사, 특허 출원", undefined, "https://example.com/news/1"), now), null);
});

test("검색어 간 중복을 제거하고 최신순으로 반환하며 캐시를 재사용한다", async () => {
  clearCommunityPatentNewsCache();
  let requests = 0;
  const fetchNews = async () => {
    requests += 1;
    return { items: [
      article("A사, 특허 출원", "Tue, 06 Oct 2026 09:00:00 +0900"),
      article("B사, 특허 등록", "Mon, 05 Oct 2026 09:00:00 +0900", "https://www.yna.co.kr/view/2"),
      article("C사, 특허 침해 소송", "Tue, 06 Oct 2026 09:00:00 +0900", "https://www.yna.co.kr/view/3"),
    ] };
  };
  const result = await fetchCommunityPatentNews({ fetchNews, now });
  assert.deepEqual(result.items.map((item) => item.title), ["A사, 특허 출원", "B사, 특허 등록"]);
  assert.equal(result.returnedCount, 2);
  const first = await getCachedCommunityPatentNews({ fetchNews, now });
  const requestCount = requests;
  const second = await getCachedCommunityPatentNews({ fetchNews, now });
  assert.equal(first.cached, false);
  assert.equal(second.cached, true);
  assert.equal(requests, requestCount);
  clearCommunityPatentNewsCache();
});
