import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// GET all notes for a trip
router.get('/:tripId/notes', async (req, res) => {
  const { tripId } = req.params;
  const notes = await prisma.note.findMany({
    where: { tripId },
  });
  res.json(notes);
});

// POST a new note for a trip
router.post('/:tripId/notes', async (req, res) => {
  const { tripId } = req.params;
  const { content, date } = req.body;
  const note = await prisma.note.create({
    data: {
      tripId,
      content,
      date,
    },
  });
  res.json(note);
});

// DELETE a note
router.delete('/notes/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.note.delete({
    where: { id },
  });
  res.json({ message: 'Note deleted' });
});

export default router;
