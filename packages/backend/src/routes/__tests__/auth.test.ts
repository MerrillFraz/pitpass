import request from 'supertest';
import express from 'express';
import { prismaMock } from '../../tests/setup';
import authRouter from '../auth';
import errorHandler from '../../middleware/errorHandler';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use(errorHandler);

process.env.JWT_SECRET = 'test-secret';

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user and return a token', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const hashedPassword = 'hashedPassword';
      const user = { id: '1', ...userData, password: hashedPassword, createdAt: new Date(), updatedAt: new Date() };

      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);

      const res = await request(app).post('/api/auth/register').send(userData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
    });

    it('should return 409 if user already exists', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const user = { id: '1', ...userData, createdAt: new Date(), updatedAt: new Date() };

      prismaMock.user.findUnique.mockResolvedValue(user);

      const res = await request(app).post('/api/auth/register').send(userData);

      expect(res.status).toBe(409);
      expect(res.body).toEqual({ message: 'User already exists' });
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user and return a token', async () => {
        const loginData = { email: 'test@example.com', password: 'password123' };
        const user = { id: '1', email: 'test@example.com', password: 'hashedPassword', name: 'Test User', createdAt: new Date(), updatedAt: new Date() };
  
        prismaMock.user.findUnique.mockResolvedValue(user);
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
  
        const res = await request(app).post('/api/auth/login').send(loginData);
  
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
      });

    it('should return 401 for invalid credentials (user not found)', async () => {
        const loginData = { email: 'test@example.com', password: 'password123' };

        prismaMock.user.findUnique.mockResolvedValue(null);

        const res = await request(app).post('/api/auth/login').send(loginData);

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ message: 'Invalid credentials' });
    });

    it('should return 401 for invalid credentials (wrong password)', async () => {
        const loginData = { email: 'test@example.com', password: 'wrongpassword' };
        const user = { id: '1', email: 'test@example.com', password: 'hashedPassword', name: 'Test User', createdAt: new Date(), updatedAt: new Date() };

        prismaMock.user.findUnique.mockResolvedValue(user);
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

        const res = await request(app).post('/api/auth/login').send(loginData);

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ message: 'Invalid credentials' });
    });
  });
});
