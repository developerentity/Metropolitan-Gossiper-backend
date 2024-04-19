export interface ErrorResponse {
  error?: any;
  message?: any;
}

export type ItemsListViewModel<T> = {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  items: T[];
};
