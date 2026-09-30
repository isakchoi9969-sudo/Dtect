import { api } from "../config/api";

export async function fetchSavedCases() {
  const { data } = await api.get("/api/saved-cases");
  return data;
}

export async function fetchSavedCaseStatus(caseKeys) {
  const { data } = await api.post("/api/saved-cases/status", { caseKeys });
  return data;
}

export async function saveHistoricalCase(payload) {
  const { data } = await api.post("/api/saved-cases", payload);
  return data;
}

export async function deleteSavedCase(savedCaseId) {
  const { data } = await api.delete(`/api/saved-cases/${savedCaseId}`);
  return data;
}

export async function deleteSavedCaseByKey(caseKey) {
  const { data } = await api.delete(`/api/saved-cases/by-key/${encodeURIComponent(caseKey)}`);
  return data;
}
