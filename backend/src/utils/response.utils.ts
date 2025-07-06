import { Response } from 'express';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
    [key: string]: any;
  };
}

// Send success response
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: ApiResponse<T>['meta']
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

// Send error response
export const sendError = (
  res: Response,
  message = 'An error occurred',
  statusCode = 500,
  errors?: any
): Response => {
  const response: ApiResponse<null> = {
    success: false,
    message,
  };

  if (errors) {
    response.data = { errors };
  }

  return res.status(statusCode).json(response);
};

// Send paginated response
export const sendPaginatedResponse = <T>(
  res: Response,
  data: T[],
  message = 'Success',
  statusCode = 200,
  page = 1,
  limit = 10,
  totalItems = 0,
  additionalMeta?: Record<string, any>
): Response => {
  const totalPages = Math.ceil(totalItems / limit);

  const response: ApiResponse<T[]> = {
    success: true,
    message,
    data,
    meta: {
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
      ...additionalMeta,
    },
  };

  return res.status(statusCode).json(response);
};