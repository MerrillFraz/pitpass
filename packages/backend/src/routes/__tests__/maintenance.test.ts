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

const BASE = '/api/teams/team1/cars/car1/maintenance';

const ownerMembership = {
  id: 'm1', userId: 'user1', teamId: 'team1', role: Role.OWNER,
  isPrimary: true, createdAt: new Date(), updatedAt: new Date(),
};

const maintenanceEvent = {
  id: 'event1', carId: 'car1', type: 'Oil Change',
  date: new Date('2026-01-15T00:00:00.000Z'), notes: 'Full synthetic',
  lapInterval: 200, createdAt: new Date(), updatedAt: new Date(),
};

describe('Maintenance Routes', () => {
  describe('GET /maintenance', () => {
    it('should return 403 if user is not a team member', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(null);
      const res = await request(app).get(BASE).set('Authorization', 'Bearer token');
      expect(res.status).toBe(403);
    });

    it('should return all maintenance events for a team member', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(ownerMembership);
      prismaMock.maintenanceEvent.findMany.mockResolvedValue([maintenanceEvent]);
      const res = await request(app).get(BASE).set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].type).toBe('Oil Change');
    });
  });

  describe('GET /maintenance/:eventId', () => {
    it('should return 403 if user is not a team member', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(null);
      const res = await request(app).get(`${BASE}/event1`).set('Authorization', 'Bearer token');
      expect(res.status).toBe(403);
    });

    it('should return 404 if event not found', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(ownerMembership);
      prismaMock.maintenanceEvent.findFirst.mockResolvedValue(null);
      const res = await request(app).get(`${BASE}/event1`).set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
    });

    it('should return a single maintenance event', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(ownerMembership);
      prismaMock.maintenanceEvent.findFirst.mockResolvedValue(maintenanceEvent);
      const res = await request(app).get(`${BASE}/event1`).set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.type).toBe('Oil Change');
    });
  });

  describe('POST /maintenance', () => {
    const payload = { type: 'Oil Change', date: '2026-01-15T00:00:00.000Z', lapInterval: 200 };

    it('should return 403 if user is not OWNER or PIT_BOSS', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue({ ...ownerMembership, role: Role.DRIVER });
      const res = await request(app).post(BASE).set('Authorization', 'Bearer token').send(payload);
      expect(res.status).toBe(403);
    });

    it('should create a maintenance event as OWNER', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(ownerMembership);
      prismaMock.maintenanceEvent.create.mockResolvedValue(maintenanceEvent);
      const res = await request(app).post(BASE).set('Authorization', 'Bearer token').send(payload);
      expect(res.status).toBe(201);
      expect(res.body.type).toBe('Oil Change');
    });

    it('should create a maintenance event as PIT_BOSS', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue({ ...ownerMembership, role: Role.PIT_BOSS });
      prismaMock.maintenanceEvent.create.mockResolvedValue(maintenanceEvent);
      const res = await request(app).post(BASE).set('Authorization', 'Bearer token').send(payload);
      expect(res.status).toBe(201);
    });
  });

  describe('PUT /maintenance/:eventId', () => {
    it('should return 403 if user is not OWNER or PIT_BOSS', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue({ ...ownerMembership, role: Role.GUEST });
      const res = await request(app)
        .put(`${BASE}/event1`)
        .set('Authorization', 'Bearer token')
        .send({ type: 'Tire Rotation' });
      expect(res.status).toBe(403);
    });

    it('should return 404 if event not found', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(ownerMembership);
      prismaMock.maintenanceEvent.updateMany.mockResolvedValue({ count: 0 });
      const res = await request(app)
        .put(`${BASE}/event1`)
        .set('Authorization', 'Bearer token')
        .send({ type: 'Tire Rotation' });
      expect(res.status).toBe(404);
    });

    it('should update a maintenance event as OWNER', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(ownerMembership);
      prismaMock.maintenanceEvent.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.maintenanceEvent.findFirst.mockResolvedValue({ ...maintenanceEvent, type: 'Tire Rotation' });
      const res = await request(app)
        .put(`${BASE}/event1`)
        .set('Authorization', 'Bearer token')
        .send({ type: 'Tire Rotation' });
      expect(res.status).toBe(200);
      expect(res.body.type).toBe('Tire Rotation');
    });
  });

  describe('DELETE /maintenance/:eventId', () => {
    it('should return 403 if user is not OWNER or PIT_BOSS', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue({ ...ownerMembership, role: Role.CREW });
      const res = await request(app).delete(`${BASE}/event1`).set('Authorization', 'Bearer token');
      expect(res.status).toBe(403);
    });

    it('should return 404 if event not found', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(ownerMembership);
      prismaMock.maintenanceEvent.deleteMany.mockResolvedValue({ count: 0 });
      const res = await request(app).delete(`${BASE}/event1`).set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
    });

    it('should delete a maintenance event as OWNER', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(ownerMembership);
      prismaMock.maintenanceEvent.deleteMany.mockResolvedValue({ count: 1 });
      const res = await request(app).delete(`${BASE}/event1`).set('Authorization', 'Bearer token');
      expect(res.status).toBe(204);
    });
  });
});
