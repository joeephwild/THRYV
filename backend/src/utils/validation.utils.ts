import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ApiError } from '../middleware/error.middleware';

// Middleware to validate request using express-validator
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format validation errors
    const formattedErrors = errors.array().map(error => {
      return {
        field: error.param,
        message: error.msg,
      };
    });

    // Return validation errors
    return next(new ApiError(400, 'Validation Error', formattedErrors));
  };
};

// Common validation patterns
export const patterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  phone: /^\+?[1-9]\d{1,14}$/,
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^\d+$/,
  decimal: /^\d+(\.\d+)?$/,
};

// Common validation error messages
export const errorMessages = {
  required: (field: string) => `${field} is required`,
  email: 'Please enter a valid email address',
  password: 'Password must be at least 8 characters long and include uppercase, lowercase, and numbers',
  minLength: (field: string, length: number) => `${field} must be at least ${length} characters long`,
  maxLength: (field: string, length: number) => `${field} cannot exceed ${length} characters`,
  numeric: (field: string) => `${field} must contain only numbers`,
  decimal: (field: string) => `${field} must be a valid decimal number`,
  positive: (field: string) => `${field} must be a positive number`,
  date: (field: string) => `${field} must be a valid date`,
  future: (field: string) => `${field} must be a future date`,
  past: (field: string) => `${field} must be a past date`,
  boolean: (field: string) => `${field} must be true or false`,
  enum: (field: string, values: string[]) => `${field} must be one of: ${values.join(', ')}`,
  url: 'Please enter a valid URL',
  uuid: 'Please enter a valid UUID',
  match: (field1: string, field2: string) => `${field1} and ${field2} must match`,
};