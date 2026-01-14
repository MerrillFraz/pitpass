import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation error',
      errors: err.issues.map(issue => ({ // Changed err.errors to err.issues
        path: issue.path,
        message: issue.message,
      })),
    });
  }

  // Handle Prisma errors (example - you might want to differentiate more)
  if ((err as any).code && (err as any).code.startsWith('P')) { // Cast to any to access 'code'
    return res.status(400).json({
      status: 'fail',
      message: 'Database error',
      error: err.message,
    });
  }

  // Generic error handling
  res.status((err as any).statusCode || (err as any).status || 500).json({ // Cast to any to access 'statusCode' and 'status'
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
};

export default errorHandler;

