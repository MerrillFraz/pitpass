import { z } from 'zod';
import { createNoteSchema, updateNoteSchema } from '../noteSchemas';

describe('createNoteSchema', () => {
  it('should validate a correct note object', () => {
    const validNote = {
      content: 'Checked oil, replaced spark plugs.',
      date: new Date().toISOString(),
    };
    expect(() => createNoteSchema.parse(validNote)).not.toThrow();
  });

  it('should throw an error for missing content', () => {
    const invalidNote = {
      date: new Date().toISOString(),
    };
    expect(() => createNoteSchema.parse(invalidNote)).toThrow(z.ZodError);
  });

  it('should throw an error for empty content', () => {
    const invalidNote = {
      content: '',
      date: new Date().toISOString(),
    };
    expect(() => createNoteSchema.parse(invalidNote)).toThrow(z.ZodError);
  });

  it('should throw an error for missing date', () => {
    const invalidNote = {
      content: 'Checked oil, replaced spark plugs.',
    };
    expect(() => createNoteSchema.parse(invalidNote)).toThrow(z.ZodError);
  });

  it('should throw an error for invalid date format', () => {
    const invalidNote = {
      content: 'Checked oil, replaced spark plugs.',
      date: 'not-a-date',
    };
    expect(() => createNoteSchema.parse(invalidNote)).toThrow(z.ZodError);
  });
});

describe('updateNoteSchema', () => {
  it('should validate a correct partial note object', () => {
    const validUpdate = {
      content: 'Checked oil, replaced spark plugs, noted exhaust leak.',
    };
    expect(() => updateNoteSchema.parse(validUpdate)).not.toThrow();
  });

  it('should allow empty object for partial update', () => {
    const emptyUpdate = {};
    expect(() => updateNoteSchema.parse(emptyUpdate)).not.toThrow();
  });

  it('should throw an error for empty content in update', () => {
    const invalidUpdate = {
      content: '',
    };
    expect(() => updateNoteSchema.parse(invalidUpdate)).toThrow(z.ZodError);
  });

  it('should throw an error for invalid date format in update', () => {
    const invalidUpdate = {
      date: 'another-bad-date',
    };
    expect(() => updateNoteSchema.parse(invalidUpdate)).toThrow(z.ZodError);
  });
});