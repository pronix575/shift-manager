export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 20;
export const MAX_PER_PAGE = 100;

export type PaginationParams = {
  page: number;
  perPage: number;
};

export type PaginationRange = PaginationParams & {
  skip: number;
  take: number;
  totalPages: number;
};

export type PaginationMeta = PaginationParams & {
  total: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  items: T[];
  meta: PaginationMeta;
};

export function getPaginationRange(
  pagination: PaginationParams,
  total: number,
): PaginationRange {
  const totalPages = Math.max(1, Math.ceil(total / pagination.perPage));
  const page = Math.min(pagination.page, totalPages);

  return {
    page,
    perPage: pagination.perPage,
    skip: (page - 1) * pagination.perPage,
    take: pagination.perPage,
    totalPages,
  };
}

export function buildPaginatedResult<T>(
  items: T[],
  total: number,
  range: Pick<PaginationRange, 'page' | 'perPage' | 'totalPages'>,
): PaginatedResult<T> {
  return {
    items,
    meta: {
      page: range.page,
      perPage: range.perPage,
      total,
      totalPages: range.totalPages,
    },
  };
}
