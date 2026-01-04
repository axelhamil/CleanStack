/**
 * Parameters for paginated queries.
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Result of a paginated query.
 * @template T The type of items in the result.
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Creates pagination metadata from params and total count.
 */
export function createPaginatedResult<T>(
  data: T[],
  params: PaginationParams,
  total: number,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / params.limit);
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasNextPage: params.page < totalPages,
      hasPreviousPage: params.page > 1,
    },
  };
}

/**
 * Default pagination params.
 */
export const DEFAULT_PAGINATION: PaginationParams = {
  page: 1,
  limit: 20,
};
