import { Request } from 'express';
import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      tripId?: string;
      stopId?: string;
      carId?: string;
      user: User;
    }
  }
}
