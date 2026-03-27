import { Router } from 'express';
import prisma from '../prisma';
import { validate } from '../middleware/validate';
import { createTripSchema, updateTripSchema } from '../schemas/tripSchemas';
import expensesRouter from './expenses';
import notesRouter from './notes';
import tripStopsRouter from './tripStops'; // Import tripStops router
import { protect } from '../middleware/auth';

const router = Router();
router.use(protect);

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
router.get('/', async (req, res, next) => {
  try {
    const trips = await prisma.trip.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        expenses: true,
        notes: true,
      },
    });
    res.json(trips);
  } catch (error) {
    next(error);
  }
});

// GET a single trip by id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const trip = await prisma.trip.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        expenses: true,
        notes: true,
        tripStops: {
          include: { track: true },
          orderBy: { startDate: 'asc' },
        },
      },
    });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json(trip);
  } catch (error) {
    next(error);
  }
});

// POST a new trip
router.post('/', validate(createTripSchema), async (req, res, next) => {
  try {
    const { name, date, location, teamId } = req.body;
    const trip = await prisma.trip.create({
      data: {
        name,
        date,
        location,
        userId: req.user.id,
        teamId,
      },
    });
    res.status(201).json(trip);
  } catch (error) {
    next(error);
  }
});

// PUT (update) a trip
router.put('/:id', validate(updateTripSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, date, location, teamId } = req.body;
    const trip = await prisma.trip.updateMany({
      where: {
        id,
        userId: req.user.id,
      },
      data: {
        name,
        date,
        location,
        teamId,
      },
    });
    res.json(trip);
  } catch (error) {
    next(error);
  }
});

// DELETE a trip
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.trip.deleteMany({
      where: {
        id,
        userId: req.user.id,
      },
    });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
