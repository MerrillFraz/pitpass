import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// GET all trips
router.get('/', async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      include: {
        expenses: true,
        notes: true,
      },
    });
    res.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET a single trip by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        expenses: true,
        notes: true,
      },
    });
    res.json(trip);
  } catch (error) {
    console.error(`Error fetching trip with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST a new trip
router.post('/', async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT (update) a trip
router.put('/:id', async (req, res) => {
  try {
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
  } catch (error) {
    console.error(`Error updating trip with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE a trip
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.trip.delete({
      where: { id },
    });
    res.json({ message: 'Trip deleted' });
  } catch (error) {
    console.error(`Error deleting trip with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
