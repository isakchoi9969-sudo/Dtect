export function paginate(items, page, pageSize = 10) {
  if (!Array.isArray(items) || !Number.isInteger(pageSize) || pageSize < 1) return [];
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(Number(page) || 1, 1), pageCount);
  return items.slice((currentPage - 1) * pageSize, currentPage * pageSize);
}
