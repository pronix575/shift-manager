export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 20;

export type PaginationQuery = {
  page?: number;
  perPage?: number;
};

export type PaginationMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  meta: PaginationMeta;
};

export function cleanPaginationQuery(query: PaginationQuery) {
  return Object.fromEntries(
    Object.entries(query)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)]),
  ) as Record<string, string>;
}

export function getEmptyPaginatedResponse<T>(
  perPage = DEFAULT_PER_PAGE,
): PaginatedResponse<T> {
  return {
    items: [],
    meta: {
      page: DEFAULT_PAGE,
      perPage,
      total: 0,
      totalPages: 1,
    },
  };
}
