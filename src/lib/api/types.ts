/** Response envelope shape returned by every DailyGourmet.Api endpoint (see BACKEND_IMPLEMENTATION_PLAN.md §6). */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string | null;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
