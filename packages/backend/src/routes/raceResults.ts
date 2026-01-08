import { Router } from 'express';
import prisma from '../prisma';
import { validate } from '../middleware/validate';
import { createRaceResultSchema, updateRaceResultSchema } from '../schemas/raceResultSchemas';

const router = Router({ mergeParams: true });

// GET all race results for a trip stop
router.get('/', async (req, res) => {
  const tripStopId = req.stopId!; // Access id from merged params (which is tripStopId)
  const raceResults = await prisma.raceResult.findMany({
    where: { tripStopId },
  });
  res.json(raceResults);
});

// GET a single race result by id
router.get('/:id', async (req, res) => {
  const { id } = req.params; // This id is the raceResultId
  const tripStopId = req.stopId!;
  const raceResult = await prisma.raceResult.findUnique({
    where: { id, tripStopId },
  });
  res.json(raceResult);
});

// POST a new race result for a trip stop
router.post('/', validate(createRaceResultSchema), async (req, res) => {
  const tripStopId = req.stopId!; // Access id from merged params (which is tripStopId)
  const { carId, laps, bestLapTime, position, notes } = req.body;
  const raceResult = await prisma.raceResult.create({
    data: {
      tripStopId,
      carId,
      laps,
      bestLapTime,
      position,
      notes,
    },
  });
  res.status(201).json(raceResult);
});

// PUT (update) a race result
router.put('/:id', validate(updateRaceResultSchema), async (req, res) => {
  const { id } = req.params; // This id is the raceResultId
  const tripStopId = req.stopId!;
  const { carId, laps, bestLapTime, position, notes } = req.body;
  const raceResult = await prisma.raceResult.update({
    where: { id, tripStopId },
    data: {
      carId,
      laps,
      bestLapTime,
      position,
      notes,
    },
  });
  res.json(raceResult);
});

// DELETE a race result
router.delete('/:id', async (req, res) => {
  const { id } = req.params; // This id is the raceResultId
  const tripStopId = req.stopId!;
  await prisma.raceResult.delete({
    where: { id, tripStopId },
  });
  res.status(204).json({ message: 'Race result deleted' });
});

export default router;
