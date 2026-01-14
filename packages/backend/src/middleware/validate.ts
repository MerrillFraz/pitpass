import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate = (schema: z.ZodSchema<any>) => // Changed AnyZodObject to z.AnyZodObject
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      Object.assign(req.body, parsed.body);
      Object.assign(req.query, parsed.query);
      Object.assign(req.params, parsed.params);
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
