export interface PaginationParams {
  page?: number
  limit?: number
}

export interface Paginated<T> {
  items: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

export function paginate(page?: number, limit?: number) {
  const resolvedPage = page && page > 0 ? page : DEFAULT_PAGE
  const resolvedLimit =
    limit && limit > 0 ? Math.min(limit, MAX_LIMIT) : DEFAULT_LIMIT

  return {
    page: resolvedPage,
    limit: resolvedLimit,
    offset: (resolvedPage - 1) * resolvedLimit,
  }
}

export function toPaginated<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): Paginated<T> {
  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  }
}
