import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

// Custom error class for API errors
export class ApiError extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handling middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);
  
  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle unique constraint violations
    if (err.code === 'P2002') {
      const field = (err.meta?.target as string[]) || ['record'];
      return res.status(409).json({
        message: `A ${field.join(', ')} with this value already exists.`,
        error: 'UNIQUE_CONSTRAINT_VIOLATION'
      });
    }
    
    // Handle record not found
    if (err.code === 'P2001' || err.code === 'P2018') {
      return res.status(404).json({
        message: 'Record not found.',
        error: 'RECORD_NOT_FOUND'
      });
    }
    
    // Handle foreign key constraint failures
    if (err.code === 'P2003') {
      return res.status(400).json({
        message: 'Related record not found.',
        error: 'FOREIGN_KEY_CONSTRAINT_FAILURE'
      });
    }
    
    // Default Prisma error
    return res.status(400).json({
      message: 'Database operation failed.',
      error: err.code
    });
  }
  
  // Handle custom API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      error: err.name
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token.',
      error: 'INVALID_TOKEN'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired.',
      error: 'TOKEN_EXPIRED'
    });
  }
  
  // Default error handler
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? 'SERVER_ERROR' : err.stack
  });
};

// Async handler to catch async errors
export const asyncHandler = (fn: Function) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};