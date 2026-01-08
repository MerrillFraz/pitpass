import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      tripId?: string;
      stopId?: string; // Added stopId
    }
  }
}
