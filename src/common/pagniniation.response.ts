export interface PagninationResponse<T> {
    data: T[];
    meta: {
      total: number;
      limit: number;
      page: number;
    };
  }
  