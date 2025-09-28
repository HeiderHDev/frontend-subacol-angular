export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
