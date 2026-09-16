import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "dtect-watchlist-company-ids";
export const WATCHLIST_LIMIT = 15;

function readStoredIds() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function useWatchlist() {
  const [companyIds, setCompanyIds] = useState(readStoredIds);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(companyIds));
  }, [companyIds]);

  const toggleCompany = useCallback((companyId) => {
    if (companyIds.includes(companyId)) {
      setCompanyIds((currentIds) => currentIds.filter((id) => id !== companyId));
      return "removed";
    }

    if (companyIds.length >= WATCHLIST_LIMIT) {
      return "limit";
    }

    setCompanyIds((currentIds) => [...currentIds, companyId]);
    return "added";
  }, [companyIds]);

  return {
    companyIds,
    isWatched: (companyId) => companyIds.includes(companyId),
    toggleCompany,
    count: companyIds.length,
    limit: WATCHLIST_LIMIT,
  };
}
