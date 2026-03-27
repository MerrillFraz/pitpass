import { z } from 'zod';
import {
  createExpenseSchema,
  updateExpenseSchema,
} from '../expenseSchemas';

describe('createExpenseSchema', () => {
  it('should validate a correct expense object', () => {
    const validExpense = {
      type: 'RACE_GAS',
      amount: 100,
      date: new Date().toISOString(),
    };
    expect(() => createExpenseSchema.parse({ body: validExpense })).not.toThrow();
  });

  it('should throw an error for missing amount', () => {
    const invalidExpense = {
      type: 'RACE_GAS',
      date: new Date().toISOString(),
    };
    expect(() => createExpenseSchema.parse({ body: invalidExpense })).toThrow(z.ZodError);
  });

  it('should throw an error for invalid amount type', () => {
    const invalidExpense = {
      type: 'RACE_GAS',
      amount: '100',
      date: new Date().toISOString(),
    };
    expect(() => createExpenseSchema.parse({ body: invalidExpense })).toThrow(z.ZodError);
  });

  it('should throw an error for non-positive amount', () => {
    const invalidExpense = {
      type: 'RACE_GAS',
      amount: 0,
      date: new Date().toISOString(),
    };
    expect(() => createExpenseSchema.parse({ body: invalidExpense })).toThrow(z.ZodError);
  });

  it('should throw an error for missing type', () => {
    const invalidExpense = {
      amount: 100,
      date: new Date().toISOString(),
    };
    expect(() => createExpenseSchema.parse({ body: invalidExpense })).toThrow(z.ZodError);
  });

  it('should throw an error for invalid type enum value', () => {
    const invalidExpense = {
      type: 'INVALID_TYPE',
      amount: 100,
      date: new Date().toISOString(),
    };
    expect(() => createExpenseSchema.parse({ body: invalidExpense })).toThrow(z.ZodError);
  });

  it('should throw an error for missing date', () => {
    const invalidExpense = {
      type: 'RACE_GAS',
      amount: 100,
    };
    expect(() => createExpenseSchema.parse({ body: invalidExpense })).toThrow(z.ZodError);
  });

  it('should throw an error for invalid date format', () => {
    const invalidExpense = {
      type: 'RACE_GAS',
      amount: 100,
      date: 'not-a-date',
    };
    expect(() => createExpenseSchema.parse({ body: invalidExpense })).toThrow(z.ZodError);
  });
});

describe('updateExpenseSchema', () => {
  it('should validate a correct partial expense object', () => {
    const validUpdate = {
      type: 'REPAIRS',
      amount: 120,
    };
    expect(() => updateExpenseSchema.parse({ body: validUpdate })).not.toThrow();
  });

  it('should allow empty object for partial update', () => {
    const emptyUpdate = {};
    expect(() => updateExpenseSchema.parse({ body: emptyUpdate })).not.toThrow();
  });

  it('should throw an error for invalid amount type in update', () => {
    const invalidUpdate = {
      amount: 'abc',
    };
    expect(() => updateExpenseSchema.parse({ body: invalidUpdate })).toThrow(z.ZodError);
  });

  it('should throw an error for non-positive amount in update', () => {
    const invalidUpdate = {
      amount: -10,
    };
    expect(() => updateExpenseSchema.parse({ body: invalidUpdate })).toThrow(z.ZodError);
  });

  it('should throw an error for invalid type enum value in update', () => {
    const invalidUpdate = {
      type: 'BAD_TYPE',
    };
    expect(() => updateExpenseSchema.parse({ body: invalidUpdate })).toThrow(z.ZodError);
  });

  it('should throw an error for invalid date format in update', () => {
    const invalidUpdate = {
      date: 'another-bad-date',
    };
    expect(() => updateExpenseSchema.parse({ body: invalidUpdate })).toThrow(z.ZodError);
  });
});
