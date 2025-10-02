import { Request, Response, NextFunction } from 'express';
import { DomainException } from '@domain/exceptions/domain.exception';
// import { logger } from '@infrastructure/config/logger.config';

export class ErrorResponse {
  constructor(
    public timestamp: Date,
    public status: number,
    public error: string,
    public message: string,
    public errorCode: string,
    public path: string
  ) { }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
  });

  if (err instanceof DomainException) {
    const errorResponse = new ErrorResponse(
      new Date(),
      err.statusCode,
      err.name,
      err.message,
      err.errorCode,
      req.path
    );

    return res.status(err.statusCode).json(errorResponse);
  }

  // Default error
  const errorResponse = new ErrorResponse(
    new Date(),
    500,
    'Internal Server Error',
    err.message || 'An unexpected error occurred',
    'INTERNAL_ERROR',
    req.path
  );

  return res.status(500).json(errorResponse);
}
