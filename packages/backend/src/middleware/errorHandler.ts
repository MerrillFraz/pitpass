import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err); // Log the error for debugging purposes

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation error',
      errors: err.errors.map(error => ({
        path: error.path,
        message: error.message,
      })),
    });
  }

  // Handle Prisma errors (example - you might want to differentiate more)
  if (err.code && err.code.startsWith('P')) { // Prisma Client errors start with 'P'
    return res.status(400).json({
      status: 'fail',
      message: 'Database error',
      error: err.message,
    });
  }

  // Generic error handling
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
};

export default errorHandler;
