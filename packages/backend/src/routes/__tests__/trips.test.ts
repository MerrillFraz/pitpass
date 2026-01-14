import request from 'supertest';
import express from 'express';
import { prismaMock } from '../../tests/setup';
import tripsRouter from '../trips';
import errorHandler from '../../middleware/errorHandler';
import { User } from '@prisma/client';

// Mock the protect middleware
jest.mock('../../middleware/auth', () => ({
  protect: (req, res, next) => {
    // Check for a token to simulate protected route
    const bearer = req.headers.authorization;
    if (!bearer || !bearer.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    // Attach a mock user to the request
    req.user = { id: 'user1', email: 'test@example.com', name: 'Test User' };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use('/api/trips', tripsRouter);
app.use(errorHandler);

const user = {
    id: 'user1',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
} as User;

const trip = {
    id: 'trip1',
    name: 'Test Trip',
    date: new Date(),
    location: 'Test Location',
    userId: user.id,
    teamId: 'clxxxxxxxxxxxxxxxxxxxxxxx',
    createdAt: new Date(),
    updatedAt: new Date(),
};

describe('Trips Routes', () => {
  it('should return 401 for unauthenticated requests', async () => {
    const res = await request(app).get('/api/trips');
    expect(res.status).toBe(401);
  });

  it('should get all trips for the authenticated user', async () => {
    prismaMock.trip.findMany.mockResolvedValue([trip]);
    const res = await request(app).get('/api/trips').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    // Convert date objects to ISO strings for comparison
    expect(res.body).toEqual([
      {
        ...trip,
        date: trip.date.toISOString(),
        createdAt: trip.createdAt.toISOString(),
        updatedAt: trip.updatedAt.toISOString(),
      },
    ]);
    expect(prismaMock.trip.findMany).toHaveBeenCalledWith({
      where: { userId: user.id },
      include: {
        expenses: true,
        notes: true,
      },
    });
  });

  it('should get a single trip for the authenticated user', async () => {
    prismaMock.trip.findFirst.mockResolvedValue(trip);
    const res = await request(app).get('/api/trips/trip1').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    // Convert date objects to ISO strings for comparison
    expect(res.body).toEqual({
      ...trip,
      date: trip.date.toISOString(),
      createdAt: trip.createdAt.toISOString(),
      updatedAt: trip.updatedAt.toISOString(),
    });
    expect(prismaMock.trip.findFirst).toHaveBeenCalledWith({
      where: { id: 'trip1', userId: user.id },
      include: {
        expenses: true,
        notes: true,
      },
    });
  });

  it('should return null when getting a trip not owned by the user', async () => {
    prismaMock.trip.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/trips/trip2').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body).toBe(null);
  });

  it('should create a new trip for the authenticated user', async () => {
    const newTrip = { name: 'New Trip', location: 'New Location', date: new Date().toISOString(), teamId: 'clxxxxxxxxxxxxxxxxxxxxxxx' };
    const createdTrip = { ...newTrip, id: 'trip2', userId: user.id, date: new Date(newTrip.date), createdAt: new Date(), updatedAt: new Date() };
    prismaMock.trip.create.mockResolvedValue(createdTrip);
    const res = await request(app).post('/api/trips').set('Authorization', 'Bearer token').send(newTrip);
    expect(res.status).toBe(201);
    // Convert date objects to ISO strings for comparison
    expect(res.body).toEqual({
        ...createdTrip,
        date: createdTrip.date.toISOString(),
        createdAt: createdTrip.createdAt.toISOString(),
        updatedAt: createdTrip.updatedAt.toISOString(),
    });
    expect(prismaMock.trip.create).toHaveBeenCalledWith({
      data: {
        ...newTrip,
        date: new Date(newTrip.date),
        userId: user.id,
        teamId: newTrip.teamId,
      },
    });
  });

  it('should update a trip for the authenticated user', async () => {
    const updatedData = { name: 'Updated Trip' };
    prismaMock.trip.updateMany.mockResolvedValue({ count: 1 });
    const res = await request(app).put('/api/trips/trip1').set('Authorization', 'Bearer token').send(updatedData);
    expect(res.status).toBe(200);
    expect(prismaMock.trip.updateMany).toHaveBeenCalledWith({
      where: { id: 'trip1', userId: user.id },
      data: updatedData,
    });
  });

  it('should delete a trip for the authenticated user', async () => {
    prismaMock.trip.deleteMany.mockResolvedValue({ count: 1 });
    const res = await request(app).delete('/api/trips/trip1').set('Authorization', 'Bearer token');
    expect(res.status).toBe(204);
    expect(prismaMock.trip.deleteMany).toHaveBeenCalledWith({
      where: { id: 'trip1', userId: user.id },
    });
  });
});
