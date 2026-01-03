import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// GET all trips
router.get('/', async (req, res) => {
  const trips = await prisma.trip.findMany();
  res.json(trips);
});

// GET a single trip by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const trip = await prisma.trip.findUnique({
    where: { id },
  });
  res.json(trip);
});

// POST a new trip
router.post('/', async (req, res) => {
  const { name, date, location } = req.body;
  const isoDate = new Date(date).toISOString();
  const trip = await prisma.trip.create({
    data: {
      name,
      date: isoDate,
      location,
    },
  });
  res.json(trip);
});

// PUT (update) a trip
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, date, location } = req.body;
  const isoDate = new Date(date).toISOString();
  const trip = await prisma.trip.update({
    where: { id },
    data: {
      name,
      date: isoDate,
      location,
    },
  });
  res.json(trip);
});

// DELETE a trip
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.trip.delete({
    where: { id },
  });
  res.json({ message: 'Trip deleted' });
});

export default router;
