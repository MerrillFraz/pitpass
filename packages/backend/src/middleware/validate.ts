import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate = (schema: z.AnyZodObject) => // Changed AnyZodObject to z.AnyZodObject
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'fail',
          errors: error.issues.map(issue => ({ // Changed error.errors to error.issues
            path: issue.path,
            message: issue.message,
          })),
        });
      }
      next(error);
    }
  };
