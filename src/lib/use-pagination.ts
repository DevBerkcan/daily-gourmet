import { useEffect, useState } from "react";

const DEFAULT_PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

/** Client-side pagination over an already-fetched, already-filtered array — every list hook in
 * this app already pulls its full working set in one request (pageSize up to 500) and filters it
 * client-side, so slicing that same array for display is the low-risk way to add page controls
 * without threading page/pageSize through every query. Resets to page 1 whenever the item count
 * changes (e.g. a search/filter narrows the results), so you never land on a stranded empty page. */
export function usePagination<T>(items: T[], initialPageSize: number = DEFAULT_PAGE_SIZE_OPTIONS[0]) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  useEffect(() => {
    setPage(1);
  }, [items.length]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page_ = Math.min(page, totalPages);
  const pageItems = items.slice((page_ - 1) * pageSize, page_ * pageSize);

  return {
    pageItems,
    page: page_,
    setPage,
    pageSize,
    setPageSize: (n: number) => {
      setPageSize(n);
      setPage(1);
    },
    totalPages,
    totalItems: items.length,
    pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS as readonly number[],
  };
}
