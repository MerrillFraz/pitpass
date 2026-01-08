import errorHandler from '../errorHandler';
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import httpStatus from 'http-status';

describe('errorHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should handle ZodError with 400 status and error details', () => {
    const error = new ZodError([
      {
        code: 'invalid_type',
        expected: 'string',
        message: 'Expected string, received number',
        path: ['name'],
      } as any, // Cast to any to satisfy ZodError constructor
    ]);

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'fail',
        message: 'Validation error',
        errors: [{ path: ['name'], message: 'Expected string, received number' }],
      })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle generic Error with 500 status and message', () => {
    const error = new Error('Something went wrong');

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'Something went wrong',
      })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle errors with a status code property', () => {
    const error: any = new Error('Unauthorized');
    error.statusCode = 401;

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'Unauthorized',
      })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle errors with a status property', () => {
    const error: any = new Error('Forbidden');
    error.status = 403;

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'Forbidden',
      })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should send a 500 for unknown error types', () => {
    const error = 'a string error'; // Not an instance of Error

    errorHandler(error as any, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'Internal Server Error',
      })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });
});
