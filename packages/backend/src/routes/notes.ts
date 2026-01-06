import { Router } from 'express';
import prisma from '../prisma';
import { validate } from '../middleware/validate';
import { createNoteSchema, updateNoteSchema } from '../schemas/noteSchemas';

const router = Router({ mergeParams: true });

// GET all notes for a trip
router.get('/', async (req, res) => {
  const tripId = req.tripId!; // Access tripId from merged params
  const notes = await prisma.note.findMany({
    where: { tripId },
  });
  res.json(notes);
});

// POST a new note for a trip
router.post('/', validate(createNoteSchema), async (req, res) => {
  const tripId = req.tripId!; // Access tripId from merged params
  const { content, date } = req.body;
  const note = await prisma.note.create({
    data: {
      tripId,
      content,
      date,
    },
  });
  res.status(201).json(note);
});

// PUT (update) a note
router.put('/:id', validate(updateNoteSchema), async (req, res) => {
  const { id } = req.params;
  const tripId = req.tripId!; // Access tripId from merged params
  const { content, date } = req.body;
  const note = await prisma.note.update({
    where: { id, tripId }, // Ensure note belongs to the trip
    data: {
      content,
      date,
    },
  });
  res.json(note);
});

// DELETE a note
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const tripId = req.tripId!; // Access tripId from merged params
  await prisma.note.delete({
    where: { id, tripId }, // Ensure note belongs to the trip
  });
  res.status(204).json({ message: 'Note deleted' });
});

export default router;
