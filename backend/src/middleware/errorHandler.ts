import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { APIError } from '../types';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error | AppError | Prisma.PrismaClientKnownRequestError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: any = undefined;

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        statusCode = 409;
        message = 'Resource already exists';
        details = { field: error.meta?.target };
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Resource not found';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Invalid reference';
        break;
      default:
        statusCode = 400;
        message = 'Database error';
        details = { code: error.code };
    }
  }
  // Handle custom AppError
  else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }
  // Handle validation errors
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    details = error.message;
  }
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  // Handle other known errors
  else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  const apiError: APIError = {
    code: error.name || 'INTERNAL_ERROR',
    message,
    details
  };

  // Log error for debugging
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    statusCode,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(statusCode).json(apiError);
};
