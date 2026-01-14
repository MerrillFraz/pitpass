import request from 'supertest';
import express from 'express';
import { prismaMock } from '../../tests/setup';
import teamsRouter from '../teams';
import errorHandler from '../../middleware/errorHandler';
import { User, Role, Team } from '@prisma/client';

jest.mock('../../middleware/auth', () => ({
  protect: (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = { id: 'user1', email: 'test@example.com', name: 'Test User' };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use('/api/teams', teamsRouter);
app.use(errorHandler);

const user: User = {
    id: 'user1',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
};

const team: Team = {
    id: 'team1',
    name: 'Test Team',
    createdAt: new Date(),
    updatedAt: new Date(),
};

describe('Teams Routes', () => {
    it('should return 401 for unauthenticated requests', async () => {
        const res = await request(app).get('/api/teams');
        expect(res.status).toBe(401);
    });

    it('should create a new team', async () => {
        prismaMock.team.create.mockResolvedValue(team);
        const res = await request(app)
            .post('/api/teams')
            .set('Authorization', 'Bearer token')
            .send({ name: 'Test Team' });

        expect(res.status).toBe(201);
        expect(res.body.name).toBe('Test Team');
        expect(prismaMock.team.create).toHaveBeenCalledWith({
            data: {
                name: 'Test Team',
                memberships: {
                    create: {
                        userId: user.id,
                        role: Role.OWNER,
                        isPrimary: true,
                    },
                },
            },
        });
    });

    it('should get all teams for the authenticated user', async () => {
        prismaMock.team.findMany.mockResolvedValue([team]);
        const res = await request(app).get('/api/teams').set('Authorization', 'Bearer token');

        expect(res.status).toBe(200);
        expect(res.body[0].name).toBe('Test Team');
        expect(prismaMock.team.findMany).toHaveBeenCalledWith({
            where: {
                memberships: {
                    some: {
                        userId: user.id,
                    },
                },
            },
        });
    });

    it('should get a single team by id', async () => {
        prismaMock.team.findFirst.mockResolvedValue(team);
        const res = await request(app).get('/api/teams/team1').set('Authorization', 'Bearer token');
        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Test Team');
    });

    it('should allow an OWNER to update a team', async () => {
        prismaMock.teamMembership.findFirst.mockResolvedValue({ role: Role.OWNER, id: '1', userId: 'user1', teamId: 'team1', isPrimary: true, createdAt: new Date(), updatedAt: new Date() });
        prismaMock.team.update.mockResolvedValue({ ...team, name: 'Updated Team' });
        const res = await request(app)
            .put('/api/teams/team1')
            .set('Authorization', 'Bearer token')
            .send({ name: 'Updated Team' });
        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Updated Team');
    });

    it('should forbid a non-OWNER from updating a team', async () => {
        prismaMock.teamMembership.findFirst.mockResolvedValue({ role: Role.GUEST, id: '1', userId: 'user1', teamId: 'team1', isPrimary: true, createdAt: new Date(), updatedAt: new Date() });
        const res = await request(app)
            .put('/api/teams/team1')
            .set('Authorization', 'Bearer token')
            .send({ name: 'Updated Team' });
        expect(res.status).toBe(403);
    });

    it('should allow an OWNER to delete a team', async () => {
        prismaMock.teamMembership.findFirst.mockResolvedValue({ role: Role.OWNER, id: '1', userId: 'user1', teamId: 'team1', isPrimary: true, createdAt: new Date(), updatedAt: new Date() });
        const res = await request(app)
            .delete('/api/teams/team1')
            .set('Authorization', 'Bearer token');
        expect(res.status).toBe(204);
    });

    it('should forbid a non-OWNER from deleting a team', async () => {
        prismaMock.teamMembership.findFirst.mockResolvedValue({ role: Role.GUEST, id: '1', userId: 'user1', teamId: 'team1', isPrimary: true, createdAt: new Date(), updatedAt: new Date() });
        const res = await request(app)
            .delete('/api/teams/team1')
            .set('Authorization', 'Bearer token');
        expect(res.status).toBe(403);
    });
});
