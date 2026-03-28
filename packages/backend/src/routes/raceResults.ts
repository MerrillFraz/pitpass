import { Router } from 'express';
import prisma from '../prisma';
import { validate } from '../middleware/validate';
import { createRaceResultSchema, updateRaceResultSchema } from '../schemas/raceResultSchemas';

const router = Router({ mergeParams: true });

// GET all race results for a trip stop
router.get('/', async (req, res, next) => {
  try {
    const tripStopId = req.stopId!;
    const raceResults = await prisma.raceResult.findMany({
      where: { tripStopId },
    });
    res.json(raceResults);
  } catch (error) {
    next(error);
  }
});

// GET a single race result by id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const tripStopId = req.stopId!;
    const raceResult = await prisma.raceResult.findUnique({
      where: { id, tripStopId },
    });
    if (!raceResult) return res.status(404).json({ message: 'Race result not found' });
    res.json(raceResult);
  } catch (error) {
    next(error);
  }
});

// POST a new race result for a trip stop
router.post('/', validate(createRaceResultSchema), async (req, res, next) => {
  try {
    const tripStopId = req.stopId!;
    const { carId, sessionType, startPosition, laps, bestLapTime, position, notes } = req.body;
    const raceResult = await prisma.raceResult.create({
      data: {
        tripStopId,
        carId,
        sessionType,
        startPosition,
        laps,
        bestLapTime,
        position,
        notes,
      },
    });
    res.status(201).json(raceResult);
  } catch (error) {
    next(error);
  }
});

// PUT (update) a race result
router.put('/:id', validate(updateRaceResultSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const tripStopId = req.stopId!;
    const { carId, sessionType, startPosition, laps, bestLapTime, position, notes } = req.body;
    const raceResult = await prisma.raceResult.update({
      where: { id, tripStopId },
      data: {
        carId,
        sessionType,
        startPosition,
        laps,
        bestLapTime,
        position,
        notes,
      },
    });
    res.json(raceResult);
  } catch (error) {
    next(error);
  }
});

// DELETE a race result
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const tripStopId = req.stopId!;
    await prisma.raceResult.delete({
      where: { id, tripStopId },
    });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
