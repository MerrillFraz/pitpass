import { z } from 'zod';
import { createRaceResultSchema, updateRaceResultSchema } from '../raceResultSchemas';

describe('createRaceResultSchema', () => {
  it('should validate a correct race result object', () => {
    const validRaceResult = {
      carId: 'cluyd22s0000035661g8y2j4y', // Changed to CUID
      laps: 50,
      bestLapTime: 90.5,
      position: 1,
      notes: 'Great race, car felt good.',
    };
    expect(() => createRaceResultSchema.parse(validRaceResult)).not.toThrow();
  });

  it('should throw an error for missing carId', () => {
    const invalidRaceResult = {
      laps: 50,
      bestLapTime: 90.5,
      position: 1,
      notes: 'Great race, car felt good.',
    };
    expect(() => createRaceResultSchema.parse(invalidRaceResult)).toThrow(z.ZodError);
  });

  it('should throw an error for invalid carId format', () => {
    const invalidRaceResult = {
      carId: 'not-a-cuid',
      laps: 50,
      bestLapTime: 90.5,
    };
    expect(() => createRaceResultSchema.parse(invalidRaceResult)).toThrow(z.ZodError);
  });

  it('should allow optional fields to be missing', () => {
    const validRaceResult = {
      carId: 'cluyd22s0000035661g8y2j4y',
    };
    expect(() => createRaceResultSchema.parse(validRaceResult)).not.toThrow();
  });

  it('should throw an error for invalid laps type', () => {
    const invalidRaceResult = {
      carId: 'cluyd22s0000035661g8y2j4y',
      laps: 'fifty',
    };
    expect(() => createRaceResultSchema.parse(invalidRaceResult)).toThrow(z.ZodError);
  });

  it('should throw an error for non-positive laps', () => {
    const invalidRaceResult = {
      carId: 'cluyd22s0000035661g8y2j4y',
      laps: 0,
    };
    expect(() => createRaceResultSchema.parse(invalidRaceResult)).toThrow(z.ZodError);
  });

  it('should throw an error for invalid bestLapTime type', () => {
    const invalidRaceResult = {
      carId: 'cluyd22s0000035661g8y2j4y',
      bestLapTime: 'ninety',
    };
    expect(() => createRaceResultSchema.parse(invalidRaceResult)).toThrow(z.ZodError);
  });

  it('should throw an error for non-positive bestLapTime', () => {
    const invalidRaceResult = {
      carId: 'cluyd22s0000035661g8y2j4y',
      bestLapTime: 0,
    };
    expect(() => createRaceResultSchema.parse(invalidRaceResult)).toThrow(z.ZodError);
  });
});

describe('updateRaceResultSchema', () => {
  it('should validate a correct partial race result object', () => {
    const validUpdate = {
      position: 2,
      notes: 'Car was a bit loose.',
    };
    expect(() => updateRaceResultSchema.parse(validUpdate)).not.toThrow();
  });

  it('should allow empty object for partial update', () => {
    const emptyUpdate = {};
    expect(() => updateRaceResultSchema.parse(emptyUpdate)).not.toThrow();
  });

  it('should throw an error for invalid carId format in update', () => {
    const invalidUpdate = {
      carId: 'another-bad-id',
    };
    expect(() => updateRaceResultSchema.parse(invalidUpdate)).toThrow(z.ZodError);
  });

  it('should throw an error for invalid position type in update', () => {
    const invalidUpdate = {
      position: 'second',
    };
    expect(() => updateRaceResultSchema.parse(invalidUpdate)).toThrow(z.ZodError);
  });

  it('should throw an error for non-positive position in update', () => {
    const invalidUpdate = {
      position: 0,
    };
    expect(() => updateRaceResultSchema.parse(invalidUpdate)).toThrow(z.ZodError);
  });
});