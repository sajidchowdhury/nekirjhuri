/**
 * Pagination helpers shared by admin list pages and list APIs.
 *
 * Convention: page is 1-indexed (page 1 = first page). All helpers are
 * pure and type-safe — safe to call from server components or route handlers.
 */

export interface PaginationInput {
  /** 1-indexed page number (clamped to >= 1). Defaults to 1. */
  page?: number;
  /** Items per page (clamped to 1..MAX). Defaults to DEFAULT_PAGE_SIZE. */
  pageSize?: number;
}

export interface PaginationMeta {
  /** The resolved page (1-indexed). */
  page: number;
  /** The resolved page size. */
  pageSize: number;
  /** Total item count (from the DB count query). */
  total: number;
  /** Total number of pages (>= 1). */
  totalPages: number;
  /** Whether a previous page exists. */
  hasPrev: boolean;
  /** Whether a next page exists. */
  hasNext: boolean;
}

export interface PaginationResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Clamp a pagination request into safe Prisma skip/take values.
 * Use the returned `{ skip, take }` directly in a Prisma `findMany` call.
 */
export function parsePagination(input: PaginationInput): {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
} {
  const page = clampPage(input.page);
  const pageSize = clampPageSize(input.pageSize);

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

/**
 * Build the full pagination meta from a DB result + total count.
 */
export function buildPaginationMeta(
  parsed: { page: number; pageSize: number },
  total: number
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / parsed.pageSize));
  const page = Math.min(parsed.page, totalPages);

  return {
    page,
    pageSize: parsed.pageSize,
    total,
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages,
  };
}

/**
 * Convenience: wrap a findMany + count pair into a single PaginationResult.
 *
 * @example
 * const result = await paginate({
 *   page: 2, pageSize: 10,
 *   findMany: (args) => db.ummahNeed.findMany(args),
 *   count: () => db.ummahNeed.count(),
 * });
 */
export async function paginate<T>(opts: {
  page?: number;
  pageSize?: number;
  findMany: (args: { skip: number; take: number }) => Promise<T[]>;
  count: () => Promise<number>;
}): Promise<PaginationResult<T>> {
  const parsed = parsePagination(opts);
  const [items, total] = await Promise.all([
    opts.findMany({ skip: parsed.skip, take: parsed.take }),
    opts.count(),
  ]);

  return {
    items,
    meta: buildPaginationMeta(parsed, total),
  };
}

// ---------- internals ----------

function clampPage(page: number | undefined): number {
  const p = Number(page ?? 1);
  if (!Number.isFinite(p) || p < 1) return 1;
  return Math.floor(p);
}

function clampPageSize(pageSize: number | undefined): number {
  const ps = Number(pageSize ?? DEFAULT_PAGE_SIZE);
  if (!Number.isFinite(ps) || ps < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(Math.floor(ps), MAX_PAGE_SIZE);
}
