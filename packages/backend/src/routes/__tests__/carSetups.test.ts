import request from 'supertest';
import express from 'express';
import { prismaMock } from '../../tests/setup';
import teamsRouter from '../teams';
import errorHandler from '../../middleware/errorHandler';
import { Role } from '@prisma/client';

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
app.use('/api/teams', teamsRouter);
app.use(errorHandler);

const BASE = '/api/teams/team1/cars/car1/setups';

const ownerMembership = {
  id: 'm1', userId: 'user1', teamId: 'team1', role: Role.OWNER,
  isPrimary: true, createdAt: new Date(), updatedAt: new Date(),
};

const setup = {
  id: 'setup1', carId: 'car1', tripStopId: null,
  tireCompound: 'Soft', tireSizeFront: '205/55R16', tireSizeRear: '205/55R16',
  offset: null, springRateFront: null, springRateRear: null,
  rideHeightFront: null, rideHeightRear: null,
  shockRateFront: null, shockRateRear: null,
  gearRatio: null, notes: 'Qualifying setup',
  createdAt: new Date(), updatedAt: new Date(),
};

describe('Car Setup Routes', () => {
  describe('GET /setups', () => {
    it('should return 403 if user is not a team member', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(null);
      const res = await request(app).get(BASE).set('Authorization', 'Bearer token');
      expect(res.status).toBe(403);
    });

    it('should return all setups for a team member', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(ownerMembership);
      prismaMock.carSetup.findMany.mockResolvedValue([setup] as any);
      const res = await request(app).get(BASE).set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].tireCompound).toBe('Soft');
    });
  });

  describe('GET /setups/:setupId', () => {
    it('should return 403 if user is not a team member', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(null);
      const res = await request(app).get(`${BASE}/setup1`).set('Authorization', 'Bearer token');
      expect(res.status).toBe(403);
    });

    it('should return 404 if setup not found', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(ownerMembership);
      prismaMock.carSetup.findFirst.mockResolvedValue(null);
      const res = await request(app).get(`${BASE}/setup1`).set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
    });

    it('should return a single setup for a team member', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(ownerMembership);
      prismaMock.carSetup.findFirst.mockResolvedValue(setup as any);
      const res = await request(app).get(`${BASE}/setup1`).set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.tireCompound).toBe('Soft');
    });
  });

  describe('POST /setups', () => {
    const payload = { tireCompound: 'Soft', notes: 'Qualifying setup' };

    it('should return 403 if user is not OWNER or PIT_BOSS', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue({ ...ownerMembership, role: Role.DRIVER });
      const res = await request(app).post(BASE).set('Authorization', 'Bearer token').send(payload);
      expect(res.status).toBe(403);
    });

    it('should create a setup as OWNER', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(ownerMembership);
      prismaMock.carSetup.create.mockResolvedValue(setup);
      const res = await request(app).post(BASE).set('Authorization', 'Bearer token').send(payload);
      expect(res.status).toBe(201);
      expect(res.body.tireCompound).toBe('Soft');
    });

    it('should create a setup as PIT_BOSS', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue({ ...ownerMembership, role: Role.PIT_BOSS });
      prismaMock.carSetup.create.mockResolvedValue(setup);
      const res = await request(app).post(BASE).set('Authorization', 'Bearer token').send(payload);
      expect(res.status).toBe(201);
    });
  });

  describe('PUT /setups/:setupId', () => {
    it('should return 403 if user is not OWNER or PIT_BOSS', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue({ ...ownerMembership, role: Role.GUEST });
      const res = await request(app)
        .put(`${BASE}/setup1`)
        .set('Authorization', 'Bearer token')
        .send({ tireCompound: 'Hard' });
      expect(res.status).toBe(403);
    });

    it('should return 404 if setup not found', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(ownerMembership);
      prismaMock.carSetup.findFirst.mockResolvedValue(null);
      const res = await request(app)
        .put(`${BASE}/setup1`)
        .set('Authorization', 'Bearer token')
        .send({ tireCompound: 'Hard' });
      expect(res.status).toBe(404);
    });

    it('should update a setup as OWNER', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(ownerMembership);
      prismaMock.carSetup.findFirst.mockResolvedValue(setup);
      prismaMock.carSetup.update.mockResolvedValue({ ...setup, tireCompound: 'Hard' });
      const res = await request(app)
        .put(`${BASE}/setup1`)
        .set('Authorization', 'Bearer token')
        .send({ tireCompound: 'Hard' });
      expect(res.status).toBe(200);
      expect(res.body.tireCompound).toBe('Hard');
    });
  });

  describe('DELETE /setups/:setupId', () => {
    it('should return 403 if user is not OWNER or PIT_BOSS', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue({ ...ownerMembership, role: Role.CREW });
      const res = await request(app).delete(`${BASE}/setup1`).set('Authorization', 'Bearer token');
      expect(res.status).toBe(403);
    });

    it('should return 404 if setup not found', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(ownerMembership);
      prismaMock.carSetup.deleteMany.mockResolvedValue({ count: 0 });
      const res = await request(app).delete(`${BASE}/setup1`).set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
    });

    it('should delete a setup as OWNER', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(ownerMembership);
      prismaMock.carSetup.deleteMany.mockResolvedValue({ count: 1 });
      const res = await request(app).delete(`${BASE}/setup1`).set('Authorization', 'Bearer token');
      expect(res.status).toBe(204);
    });
  });
});
