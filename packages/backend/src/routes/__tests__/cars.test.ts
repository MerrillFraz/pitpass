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

const ownerMembership = {
  id: 'm1', userId: 'user1', teamId: 'team1', role: Role.OWNER,
  isPrimary: true, createdAt: new Date(), updatedAt: new Date(),
};

const car = {
  id: 'car1', teamId: 'team1', make: 'Honda', model: 'Civic',
  year: 2020, color: 'Red', vin: null, createdAt: new Date(), updatedAt: new Date(),
};

describe('Cars Routes', () => {
  it('should return 401 for unauthenticated requests', async () => {
    const res = await request(app).get('/api/teams/team1/cars');
    expect(res.status).toBe(401);
  });

  describe('GET /api/teams/:teamId/cars', () => {
    it('should return 403 if user is not a team member', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(null);
      const res = await request(app).get('/api/teams/team1/cars').set('Authorization', 'Bearer token');
      expect(res.status).toBe(403);
    });

    it('should return all cars for a team member', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(ownerMembership);
      prismaMock.car.findMany.mockResolvedValue([car]);
      const res = await request(app).get('/api/teams/team1/cars').set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].make).toBe('Honda');
    });
  });

  describe('GET /api/teams/:teamId/cars/:carId', () => {
    it('should return 403 if user is not a team member', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(null);
      const res = await request(app).get('/api/teams/team1/cars/car1').set('Authorization', 'Bearer token');
      expect(res.status).toBe(403);
    });

    it('should return 404 if car not found', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(ownerMembership);
      prismaMock.car.findFirst.mockResolvedValue(null);
      const res = await request(app).get('/api/teams/team1/cars/car1').set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
    });

    it('should return a single car for a team member', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(ownerMembership);
      prismaMock.car.findFirst.mockResolvedValue(car);
      const res = await request(app).get('/api/teams/team1/cars/car1').set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.make).toBe('Honda');
    });
  });

  describe('POST /api/teams/:teamId/cars', () => {
    it('should return 403 if user is not OWNER or PIT_BOSS', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue({ ...ownerMembership, role: Role.GUEST });
      const res = await request(app)
        .post('/api/teams/team1/cars')
        .set('Authorization', 'Bearer token')
        .send({ make: 'Honda', model: 'Civic', year: 2020 });
      expect(res.status).toBe(403);
    });

    it('should create a car as OWNER', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(ownerMembership);
      prismaMock.car.create.mockResolvedValue(car);
      const res = await request(app)
        .post('/api/teams/team1/cars')
        .set('Authorization', 'Bearer token')
        .send({ make: 'Honda', model: 'Civic', year: 2020 });
      expect(res.status).toBe(201);
      expect(res.body.make).toBe('Honda');
    });

    it('should create a car as PIT_BOSS', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue({ ...ownerMembership, role: Role.PIT_BOSS });
      prismaMock.car.create.mockResolvedValue(car);
      const res = await request(app)
        .post('/api/teams/team1/cars')
        .set('Authorization', 'Bearer token')
        .send({ make: 'Honda', model: 'Civic', year: 2020 });
      expect(res.status).toBe(201);
    });
  });

  describe('PUT /api/teams/:teamId/cars/:carId', () => {
    it('should return 403 if user is not OWNER or PIT_BOSS', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue({ ...ownerMembership, role: Role.DRIVER });
      const res = await request(app)
        .put('/api/teams/team1/cars/car1')
        .set('Authorization', 'Bearer token')
        .send({ make: 'Toyota' });
      expect(res.status).toBe(403);
    });

    it('should return 404 if car not found', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(ownerMembership);
      prismaMock.car.updateMany.mockResolvedValue({ count: 0 });
      const res = await request(app)
        .put('/api/teams/team1/cars/car1')
        .set('Authorization', 'Bearer token')
        .send({ make: 'Toyota' });
      expect(res.status).toBe(404);
    });

    it('should update a car as OWNER', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(ownerMembership);
      prismaMock.car.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.car.findFirst.mockResolvedValue({ ...car, make: 'Toyota' });
      const res = await request(app)
        .put('/api/teams/team1/cars/car1')
        .set('Authorization', 'Bearer token')
        .send({ make: 'Toyota' });
      expect(res.status).toBe(200);
      expect(res.body.make).toBe('Toyota');
    });
  });

  describe('DELETE /api/teams/:teamId/cars/:carId', () => {
    it('should return 403 if user is not OWNER or PIT_BOSS', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue({ ...ownerMembership, role: Role.CREW });
      const res = await request(app)
        .delete('/api/teams/team1/cars/car1')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(403);
    });

    it('should return 404 if car not found', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(ownerMembership);
      prismaMock.car.deleteMany.mockResolvedValue({ count: 0 });
      const res = await request(app)
        .delete('/api/teams/team1/cars/car1')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
    });

    it('should delete a car as OWNER', async () => {
      prismaMock.teamMembership.findFirst.mockResolvedValue(ownerMembership);
      prismaMock.car.deleteMany.mockResolvedValue({ count: 1 });
      const res = await request(app)
        .delete('/api/teams/team1/cars/car1')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(204);
    });
  });

  describe('GET /api/teams/:teamId/cars/:carId/laps-since-maintenance', () => {
    it('should return 404 if car not found', async () => {
      prismaMock.car.findFirst.mockResolvedValue(null);
      const res = await request(app)
        .get('/api/teams/team1/cars/car1/laps-since-maintenance')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
    });

    it('should return lap count with no prior maintenance', async () => {
      prismaMock.car.findFirst.mockResolvedValue(car);
      prismaMock.maintenanceEvent.findFirst.mockResolvedValue(null);
      prismaMock.raceResult.aggregate.mockResolvedValue({ _sum: { laps: 42 } } as any);
      const res = await request(app)
        .get('/api/teams/team1/cars/car1/laps-since-maintenance')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.lapsSinceMaintenance).toBe(42);
      expect(res.body.lastMaintenanceDate).toBeNull();
    });

    it('should return 0 laps when aggregate returns null', async () => {
      prismaMock.car.findFirst.mockResolvedValue(car);
      prismaMock.maintenanceEvent.findFirst.mockResolvedValue(null);
      prismaMock.raceResult.aggregate.mockResolvedValue({ _sum: { laps: null } } as any);
      const res = await request(app)
        .get('/api/teams/team1/cars/car1/laps-since-maintenance')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.lapsSinceMaintenance).toBe(0);
    });
  });
});
