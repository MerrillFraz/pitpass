import { Router } from 'express';
import prisma from '../../prisma';
import { validate } from '../middleware/validate';
import { createTripStopSchema, updateTripStopSchema } from '../schemas/tripStopSchemas';
import raceResultsRouter from './raceResults'; // Import raceResults router

const router = Router({ mergeParams: true });

// Middleware to attach stopId to req for nested routes
router.use('/:stopId', (req, res, next) => {
  req.stopId = req.params.stopId;
  next();
});

// Mount sub-routers
router.use('/:stopId/results', raceResultsRouter);

// GET all trip stops for a trip
router.get('/', async (req, res) => {
  const tripId = req.tripId;
  const tripStops = await prisma.tripStop.findMany({
    where: { tripId },
  });
  res.json(tripStops);
});

// GET a single trip stop by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const tripId = req.tripId;
  const tripStop = await prisma.tripStop.findUnique({
    where: { id, tripId },
  });
  res.json(tripStop);
});

// POST a new trip stop for a trip
router.post('/', validate(createTripStopSchema), async (req, res) => {
  const tripId = req.tripId;
  const { trackId, startDate, endDate } = req.body;
  const tripStop = await prisma.tripStop.create({
    data: {
      tripId,
      trackId,
      startDate,
      endDate,
    },
  });
  res.status(201).json(tripStop);
});

// PUT (update) a trip stop
router.put('/:id', validate(updateTripStopSchema), async (req, res) => {
  const { id } = req.params;
  const tripId = req.tripId;
  const { trackId, startDate, endDate } = req.body;
  const tripStop = await prisma.tripStop.update({
    where: { id, tripId },
    data: {
      trackId,
      startDate,
      endDate,
    },
  });
  res.json(tripStop);
});

// DELETE a trip stop
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const tripId = req.tripId;
  await prisma.tripStop.delete({
    where: { id, tripId },
  });
  res.status(204).json({ message: 'Trip stop deleted' });
});

export default router;
