import { Router } from 'express';
import prisma from '../prisma';
import { validate } from '../middleware/validate';
import { createTripSchema, updateTripSchema } from '../schemas/tripSchemas';
import expensesRouter from './expenses';
import notesRouter from './notes';
import tripStopsRouter from './tripStops'; // Import tripStops router

const router = Router();

// Middleware to attach tripId to req for nested routes
router.use('/:tripId', (req, res, next) => {
  req.tripId = req.params.tripId;
  next();
});

// Mount sub-routers
router.use('/:tripId/expenses', expensesRouter);
router.use('/:tripId/notes', notesRouter);
router.use('/:tripId/stops', tripStopsRouter); // Mount tripStops router

// GET all trips
router.get('/', async (req, res) => {
    const trips = await prisma.trip.findMany({
      include: {
        expenses: true,
        notes: true,
      },
    });
    res.json(trips);
});

// GET a single trip by id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        expenses: true,
        notes: true,
      },
    });
    res.json(trip);
});

// POST a new trip
router.post('/', validate(createTripSchema), async (req, res) => {
    const { name, date, location, userId, teamId } = req.body;
    const trip = await prisma.trip.create({
      data: {
        name,
        date,
        location,
        userId,
        teamId,
      },
    });
    res.status(201).json(trip);
});

// PUT (update) a trip
router.put('/:id', validate(updateTripSchema), async (req, res) => {
    const { id } = req.params;
    const { name, date, location, userId, teamId } = req.body;
    const trip = await prisma.trip.update({
      where: { id },
      data: {
        name,
        date,
        location,
        userId,
        teamId,
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
    res.status(204).json({ message: 'Trip deleted' });
});

export default router;
