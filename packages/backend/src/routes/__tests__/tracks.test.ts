import request from 'supertest';
import express from 'express';
import { prismaMock } from '../../tests/setup';
import tracksRouter from '../tracks';
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
app.use('/api/tracks', tracksRouter);
app.use(errorHandler);

const track = {
  id: 'track1',
  name: 'Watkins Glen',
  location: 'Watkins Glen, NY',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Tracks Routes', () => {
  it('should return 401 for unauthenticated requests', async () => {
    const res = await request(app).get('/api/tracks');
    expect(res.status).toBe(401);
  });

  it('should return all tracks ordered by name', async () => {
    prismaMock.track.findMany.mockResolvedValue([track]);
    const res = await request(app).get('/api/tracks').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe('Watkins Glen');
    expect(prismaMock.track.findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
  });
});
