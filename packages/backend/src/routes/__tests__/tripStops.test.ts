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

const BASE = '/api/trips/trip1/stops';

// Valid CUID-format IDs required by Zod schema validation
const TRACK_ID = 'clxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

const tripStop = {
  id: 'stop1',
  tripId: 'trip1',
  trackId: TRACK_ID,
  startDate: new Date('2026-03-01T08:00:00.000Z'),
  endDate: new Date('2026-03-01T20:00:00.000Z'),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('TripStops Routes', () => {
  describe('GET /stops', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const res = await request(app).get(BASE);
      expect(res.status).toBe(401);
    });

    it('should return all stops for a trip', async () => {
      prismaMock.tripStop.findMany.mockResolvedValue([tripStop]);
      const res = await request(app).get(BASE).set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].trackId).toBe(TRACK_ID);
    });
  });

  describe('GET /stops/:id', () => {
    it('should return 404 if stop not found', async () => {
      prismaMock.tripStop.findUnique.mockResolvedValue(null);
      const res = await request(app).get(`${BASE}/stop1`).set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
    });

    it('should return a single trip stop with track and results', async () => {
      prismaMock.tripStop.findUnique.mockResolvedValue({ ...tripStop, track: null, raceResults: [] } as any);
      const res = await request(app).get(`${BASE}/stop1`).set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.trackId).toBe(TRACK_ID);
    });
  });

  describe('POST /stops', () => {
    const payload = {
      trackId: TRACK_ID,
      startDate: '2026-03-01T08:00:00.000Z',
      endDate: '2026-03-01T20:00:00.000Z',
    };

    it('should create a new trip stop', async () => {
      prismaMock.tripStop.create.mockResolvedValue(tripStop);
      const res = await request(app).post(BASE).set('Authorization', 'Bearer token').send(payload);
      expect(res.status).toBe(201);
      expect(res.body.trackId).toBe(TRACK_ID);
    });
  });

  describe('PUT /stops/:id', () => {
    it('should update a trip stop', async () => {
      prismaMock.tripStop.update.mockResolvedValue({ ...tripStop, trackId: 'track2' });
      const res = await request(app)
        .put(`${BASE}/stop1`)
        .set('Authorization', 'Bearer token')
        .send({ trackId: TRACK_ID, startDate: '2026-03-01T08:00:00.000Z', endDate: '2026-03-01T20:00:00.000Z' });
      expect(res.status).toBe(200);
      expect(res.body.trackId).toBe('track2');
    });
  });

  describe('DELETE /stops/:id', () => {
    it('should delete a trip stop', async () => {
      prismaMock.tripStop.delete.mockResolvedValue(tripStop);
      const res = await request(app).delete(`${BASE}/stop1`).set('Authorization', 'Bearer token');
      expect(res.status).toBe(204);
    });
  });
});
