// Base response structure
export interface ApiResponse<T> {
  data: T;
  meta: {
    timestamp: string;
    cached: boolean;
    executionTime: number; // milliseconds
  };
}

// Error response structure
export interface ApiErrorResponse {
  error: string;
  details?: any;
  timestamp: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Time series parameters
export interface TimeSeriesParams {
  range?: number;      // Number of months (default: 12)
  startMonth?: number; // Start from specific month
  endMonth?: number;   // End at specific month
}
