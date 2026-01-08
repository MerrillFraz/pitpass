import { z } from 'zod';
import { createTripStopSchema, updateTripStopSchema } from '../tripStopSchemas';

describe('createTripStopSchema', () => {
  it('should validate a correct trip stop object', () => {
    const validTripStop = {
      trackId: 'cluyd22s0000035661g8y2j4y', // Changed to CUID
      startDate: '2026-01-15T10:00:00Z',
      endDate: '2026-01-15T18:00:00Z',
    };
    expect(() => createTripStopSchema.parse(validTripStop)).not.toThrow();
  });

  it('should throw an error for missing trackId', () => {
    const invalidTripStop = {
      startDate: '2026-01-15T10:00:00Z',
      endDate: '2026-01-15T18:00:00Z',
    };
    expect(() => createTripStopSchema.parse(invalidTripStop)).toThrow(z.ZodError);
  });

  it('should throw an error for invalid trackId format', () => {
    const invalidTripStop = {
      trackId: 'not-a-cuid',
      startDate: '2026-01-15T10:00:00Z',
      endDate: '2026-01-15T18:00:00Z',
    };
    expect(() => createTripStopSchema.parse(invalidTripStop)).toThrow(z.ZodError);
  });

  it('should throw an error for missing startDate', () => {
    const invalidTripStop = {
      trackId: 'cluyd22s0000035661g8y2j4y',
      endDate: '2026-01-15T18:00:00Z',
    };
    expect(() => createTripStopSchema.parse(invalidTripStop)).toThrow(z.ZodError);
  });

  it('should throw an error for missing endDate', () => {
    const invalidTripStop = {
      trackId: 'cluyd22s0000035661g8y2j4y',
      startDate: '2026-01-15T10:00:00Z',
    };
    expect(() => createTripStopSchema.parse(invalidTripStop)).toThrow(z.ZodError);
  });

  it('should throw an error for invalid date format for startDate', () => {
    const invalidTripStop = {
      trackId: 'cluyd22s0000035661g8y2j4y',
      startDate: 'not-a-date',
      endDate: '2026-01-15T18:00:00Z',
    };
    expect(() => createTripStopSchema.parse(invalidTripStop)).toThrow(z.ZodError);
  });

  it('should throw an error for invalid date format for endDate', () => {
    const invalidTripStop = {
      trackId: 'cluyd22s0000035661g8y2j4y',
      startDate: '2026-01-15T10:00:00Z',
      endDate: 'not-a-date',
    };
    expect(() => createTripStopSchema.parse(invalidTripStop)).toThrow(z.ZodError);
  });

  it('should throw an error if startDate is after endDate', () => {
    const invalidTripStop = {
      trackId: 'cluyd22s0000035661g8y2j4y',
      startDate: '2026-01-15T18:00:00Z',
      endDate: '2026-01-15T10:00:00Z',
    };
    expect(() => createTripStopSchema.parse(invalidTripStop)).toThrow(z.ZodError);
  });
});

describe('updateTripStopSchema', () => {
  it('should validate a correct partial trip stop object', () => {
    const validUpdate = {
      endDate: '2026-01-16T17:00:00Z',
    };
    expect(() => updateTripStopSchema.parse(validUpdate)).not.toThrow();
  });

  it('should allow empty object for partial update', () => {
    const emptyUpdate = {};
    expect(() => updateTripStopSchema.parse(emptyUpdate)).not.toThrow();
  });

  it('should throw an error for invalid trackId format in update', () => {
    const invalidUpdate = {
      trackId: 'another-bad-id',
    };
    expect(() => updateTripStopSchema.parse(invalidUpdate)).toThrow(z.ZodError);
  });

  it('should throw an error for invalid date format for startDate in update', () => {
    const invalidUpdate = {
      startDate: 'bad-date',
    };
    expect(() => updateTripStopSchema.parse(invalidUpdate)).toThrow(z.ZodError);
  });

  it('should throw an error for invalid date format for endDate in update', () => {
    const invalidUpdate = {
      endDate: 'bad-date',
    };
    expect(() => updateTripStopSchema.parse(invalidUpdate)).toThrow(z.ZodError);
  });
});