const newsCache = new Map();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeNewsCacheKey(query, page, perPage) {
  return JSON.stringify([query.trim(), page, perPage]);
}

function getCachedNewsAnalysis(cacheKey) {
  const cached = newsCache.get(cacheKey);
  if (!cached) return null;

  if (Date.now() >= cached.expiresAt) {
    newsCache.delete(cacheKey);
    return null;
  }

  return clone(cached.result);
}

function cacheNewsAnalysis(cacheKey, result, ttlSeconds) {
  if (ttlSeconds <= 0) return;

  newsCache.set(cacheKey, {
    expiresAt: Date.now() + ttlSeconds * 1000,
    result: clone(result),
  });
}

function clearNewsCache() {
  newsCache.clear();
}

module.exports = {
  makeNewsCacheKey,
  getCachedNewsAnalysis,
  cacheNewsAnalysis,
  clearNewsCache,
};
