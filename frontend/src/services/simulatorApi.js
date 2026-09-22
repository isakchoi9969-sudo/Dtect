import { api } from "../config/api";

/** Node 서버를 통해 현재 이슈의 실제 과거 유사사례를 조회한다. */
export async function fetchSimilarCases({
  title,
  majorCategory = null,
  minorCategory = null,
  currentIndustry = null,
}) {
  const { data } = await api.post("/api/simulator/cases", {
    title,
    majorCategory,
    minorCategory,
    currentIndustry,
  });

  return data;
}
