import request from 'supertest';
import express from 'express';
import { prismaMock } from '../../tests/setup';
import tripsRouter from '../trips';
import errorHandler from '../../middleware/errorHandler';
jest.mock('../../middleware/auth', () => ({
  protect: (req: any, res: any, next: any) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = { id: 'user1', email: 'test@example.com', firstName: 'Test', lastName: 'User' };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use('/api/trips', tripsRouter);
app.use(errorHandler);

const BASE = '/api/trips/trip1/stops/stop1/results';

// Valid CUID-format ID required by Zod schema validation
const CAR_ID = 'clxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

const raceResult = {
  id: 'result1',
  tripStopId: 'stop1',
  carId: CAR_ID,
  sessionType: 'FEATURE' as const,
  startPosition: 4,
  laps: 25,
  bestLapTime: 15.432,
  position: 2,
  notes: 'Good run',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('RaceResults Routes', () => {
  describe('GET /results', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const res = await request(app).get(BASE);
      expect(res.status).toBe(401);
    });

    it('should return all race results for a stop', async () => {
      prismaMock.raceResult.findMany.mockResolvedValue([raceResult]);
      const res = await request(app).get(BASE).set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].sessionType).toBe('FEATURE');
    });
  });

  describe('GET /results/:id', () => {
    it('should return 404 if result not found', async () => {
      prismaMock.raceResult.findUnique.mockResolvedValue(null);
      const res = await request(app).get(`${BASE}/result1`).set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
    });

    it('should return a single race result', async () => {
      prismaMock.raceResult.findUnique.mockResolvedValue(raceResult);
      const res = await request(app).get(`${BASE}/result1`).set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.position).toBe(2);
    });
  });

  describe('POST /results', () => {
    const payload = {
      carId: CAR_ID,
      sessionType: 'FEATURE',
      startPosition: 4,
      laps: 25,
      bestLapTime: 15.432,
      position: 2,
    };

    it('should create a new race result', async () => {
      prismaMock.raceResult.create.mockResolvedValue(raceResult);
      const res = await request(app).post(BASE).set('Authorization', 'Bearer token').send(payload);
      expect(res.status).toBe(201);
      expect(res.body.sessionType).toBe('FEATURE');
      expect(res.body.laps).toBe(25);
    });

    it('should create a qualifying result', async () => {
      const qualResult = { ...raceResult, sessionType: 'QUALIFYING' as const, startPosition: null, laps: 2 };
      prismaMock.raceResult.create.mockResolvedValue(qualResult);
      const res = await request(app)
        .post(BASE)
        .set('Authorization', 'Bearer token')
        .send({ carId: CAR_ID, sessionType: 'QUALIFYING', laps: 2, bestLapTime: 14.9 });
      expect(res.status).toBe(201);
      expect(res.body.sessionType).toBe('QUALIFYING');
    });
  });

  describe('PUT /results/:id', () => {
    it('should update a race result', async () => {
      prismaMock.raceResult.update.mockResolvedValue({ ...raceResult, position: 1 });
      const res = await request(app)
        .put(`${BASE}/result1`)
        .set('Authorization', 'Bearer token')
        .send({ position: 1 });
      expect(res.status).toBe(200);
      expect(res.body.position).toBe(1);
    });
  });

  describe('DELETE /results/:id', () => {
    it('should delete a race result', async () => {
      prismaMock.raceResult.delete.mockResolvedValue(raceResult);
      const res = await request(app).delete(`${BASE}/result1`).set('Authorization', 'Bearer token');
      expect(res.status).toBe(204);
    });
  });
});
