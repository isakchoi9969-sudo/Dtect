import { useCallback, useEffect, useState } from "react";
import { api } from "../config/api"; // 경로는 프로젝트 구조에 맞게 수정

const API_URL = "/api/favorite-company";
const WATCHLIST_LIMIT = 15; // 서버 라우터의 WATCHLIST_LIMIT 과 동일하게 유지

const getErrorMessage = (e) =>
  e.response?.data?.message || e.message || "요청에 실패했습니다.";

export function useWatchlist() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(API_URL);
      setCompanies(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadInitialCompanies = async () => {
      try {
        const { data } = await api.get(API_URL);
        if (isActive) setCompanies(data);
      } catch (e) {
        if (isActive) setError(getErrorMessage(e));
      } finally {
        if (isActive) setLoading(false);
      }
    };

    void loadInitialCompanies();

    return () => {
      isActive = false;
    };
  }, [fetchCompanies]);

  const isFavorite = useCallback(
    (companyId) =>
      companies.some((c) => Number(c.companyId) === Number(companyId)),
    [companies],
  );

  // 별표 토글: 이미 등록돼 있으면 DELETE, 아니면 POST
  const toggleCompany = useCallback(
    async (companyId) => {
      setError(null);
      try {
        if (isFavorite(companyId)) {
          await api.delete(`${API_URL}/${companyId}`);
        } else {
          if (companies.length >= WATCHLIST_LIMIT) {
            setError(
              `관심기업은 최대 ${WATCHLIST_LIMIT}개까지 등록할 수 있습니다.`,
            );
            return;
          }
          await api.post(API_URL, { companyId });
        }
        await fetchCompanies(); // 서버 기준으로 목록 재조회
      } catch (e) {
        setError(getErrorMessage(e));
      }
    },
    [companies.length, fetchCompanies, isFavorite],
  );

  return {
    companies,
    toggleCompany,
    isFavorite,
    isWatched: isFavorite, // 기존 CompanySearchPage 등에서 쓰던 이름 호환
    count: companies.length,
    limit: WATCHLIST_LIMIT,
    loading,
    error,
  };
}
