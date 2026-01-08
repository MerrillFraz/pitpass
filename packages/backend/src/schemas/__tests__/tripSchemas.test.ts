import { z } from 'zod';
import { createTripSchema, updateTripSchema } from '../tripSchemas';

describe('createTripSchema', () => {
  it('should validate a correct trip object', () => {
    const validTrip = {
      name: 'Race Weekend @ Laguna Seca',
      date: new Date().toISOString(),
      location: 'Laguna Seca Raceway',
      userId: 'cluyd22s0000035661g8y2j4y', // Example CUID
      teamId: 'cluyd22s0000135661g8y2j4y', // Example CUID
    };
    expect(() => createTripSchema.parse(validTrip)).not.toThrow();
  });

  it('should throw an error for missing name', () => {
    const invalidTrip = {
      date: new Date().toISOString(),
      location: 'Laguna Seca Raceway',
      userId: 'cluyd22s0000035661g8y2j4y',
      teamId: 'cluyd22s0000135661g8y2j4y',
    };
    expect(() => createTripSchema.parse(invalidTrip)).toThrow(z.ZodError);
  });

  it('should throw an error for missing date', () => {
    const invalidTrip = {
      name: 'Race Weekend @ Laguna Seca',
      location: 'Laguna Seca Raceway',
      userId: 'cluyd22s0000035661g8y2j4y',
      teamId: 'cluyd22s0000135661g8y2j4y',
    };
    expect(() => createTripSchema.parse(invalidTrip)).toThrow(z.ZodError);
  });

  it('should throw an error for invalid date format', () => {
    const invalidTrip = {
      name: 'Race Weekend @ Laguna Seca',
      date: 'not-a-date',
      location: 'Laguna Seca Raceway',
      userId: 'cluyd22s0000035661g8y2j4y',
      teamId: 'cluyd22s0000135661g8y2j4y',
    };
    expect(() => createTripSchema.parse(invalidTrip)).toThrow(z.ZodError);
  });

  it('should throw an error for missing location', () => {
    const invalidTrip = {
      name: 'Race Weekend @ Laguna Seca',
      date: new Date().toISOString(),
      userId: 'cluyd22s0000035661g8y2j4y',
      teamId: 'cluyd22s0000135661g8y2j4y',
    };
    expect(() => createTripSchema.parse(invalidTrip)).toThrow(z.ZodError);
  });

  it('should throw an error for missing userId', () => {
    const invalidTrip = {
      name: 'Race Weekend @ Laguna Seca',
      date: new Date().toISOString(),
      location: 'Laguna Seca Raceway',
      teamId: 'cluyd22s0000135661g8y2j4y',
    };
    expect(() => createTripSchema.parse(invalidTrip)).toThrow(z.ZodError);
  });

  it('should throw an error for invalid userId format', () => {
    const invalidTrip = {
      name: 'Race Weekend @ Laguna Seca',
      date: new Date().toISOString(),
      location: 'Laguna Seca Raceway',
      userId: 'not-a-cuid',
      teamId: 'cluyd22s0000135661g8y2j4y',
    };
    expect(() => createTripSchema.parse(invalidTrip)).toThrow(z.ZodError);
  });

  it('should throw an error for missing teamId', () => {
    const invalidTrip = {
      name: 'Race Weekend @ Laguna Seca',
      date: new Date().toISOString(),
      location: 'Laguna Seca Raceway',
      userId: 'cluyd22s0000035661g8y2j4y',
    };
    expect(() => createTripSchema.parse(invalidTrip)).toThrow(z.ZodError);
  });

  it('should throw an error for invalid teamId format', () => {
    const invalidTrip = {
      name: 'Race Weekend @ Laguna Seca',
      date: new Date().toISOString(),
      location: 'Laguna Seca Raceway',
      userId: 'cluyd22s0000035661g8y2j4y',
      teamId: 'not-a-cuid',
    };
    expect(() => createTripSchema.parse(invalidTrip)).toThrow(z.ZodError);
  });
});

describe('updateTripSchema', () => {
  it('should validate a correct partial trip object', () => {
    const validUpdate = {
      name: 'Revised Race Weekend @ Laguna Seca',
      date: new Date().toISOString(),
    };
    expect(() => updateTripSchema.parse(validUpdate)).not.toThrow();
  });

  it('should allow empty object for partial update', () => {
    const emptyUpdate = {};
    expect(() => updateTripSchema.parse(emptyUpdate)).not.toThrow();
  });

  it('should throw an error for invalid date format in update', () => {
    const invalidUpdate = {
      date: 'another-bad-date',
    };
    expect(() => updateTripSchema.parse(invalidUpdate)).toThrow(z.ZodError);
  });

  it('should throw an error for invalid userId format in update', () => {
    const invalidUpdate = {
      userId: 'not-a-cuid',
    };
    expect(() => updateTripSchema.parse(invalidUpdate)).toThrow(z.ZodError);
  });
});