import { Router } from 'express';
import prisma from '../prisma';
import { validate } from '../middleware/validate';
import { createCarSchema, updateCarSchema } from '../schemas/carSchemas';
import { hasRole } from '../middleware/rbac';
import { protect } from '../middleware/auth';
import { Role } from '@prisma/client';
import maintenanceRouter from './maintenance';

const router = Router({ mergeParams: true });

// Helper: verify the requesting user is a member of the team
async function requireMembership(userId: string, teamId: string) {
  const membership = await prisma.teamMembership.findFirst({
    where: { userId, teamId },
  });
  return membership;
}

// GET /api/teams/:teamId/cars
router.get('/', async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const membership = await requireMembership(req.user.id, teamId);
    if (!membership) return res.status(403).json({ message: 'Not a member of this team' });

    const cars = await prisma.car.findMany({ where: { teamId } });
    res.json(cars);
  } catch (error) {
    next(error);
  }
});

// GET /api/teams/:teamId/cars/:carId
router.get('/:carId', async (req, res, next) => {
  try {
    const { teamId, carId } = req.params;
    const membership = await requireMembership(req.user.id, teamId);
    if (!membership) return res.status(403).json({ message: 'Not a member of this team' });

    const car = await prisma.car.findFirst({ where: { id: carId, teamId } });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json(car);
  } catch (error) {
    next(error);
  }
});

// POST /api/teams/:teamId/cars
router.post(
  '/',
  hasRole([Role.OWNER, Role.PIT_BOSS]),
  validate(createCarSchema),
  async (req, res, next) => {
    try {
      const { teamId } = req.params;
      const { make, model, year, color, vin } = req.body;
      const car = await prisma.car.create({
        data: { teamId, make, model, year, color, vin },
      });
      res.status(201).json(car);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/teams/:teamId/cars/:carId
router.put(
  '/:carId',
  hasRole([Role.OWNER, Role.PIT_BOSS]),
  validate(updateCarSchema),
  async (req, res, next) => {
    try {
      const { teamId, carId } = req.params;
      const { make, model, year, color, vin } = req.body;
      const updated = await prisma.car.updateMany({
        where: { id: carId, teamId },
        data: { make, model, year, color, vin },
      });
      if (updated.count === 0) return res.status(404).json({ message: 'Car not found' });
      const car = await prisma.car.findFirst({ where: { id: carId } });
      res.json(car);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/teams/:teamId/cars/:carId
router.delete('/:carId', hasRole([Role.OWNER, Role.PIT_BOSS]), async (req, res, next) => {
  try {
    const { teamId, carId } = req.params;
    const deleted = await prisma.car.deleteMany({ where: { id: carId, teamId } });
    if (deleted.count === 0) return res.status(404).json({ message: 'Car not found' });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// Middleware to attach carId to req for nested sub-routers
router.use('/:carId', (req, _res, next) => {
  req.carId = req.params.carId;
  next();
});

// GET /api/teams/:teamId/cars/:carId/laps-since-maintenance
// Must be registered before the maintenance sub-router to avoid path ambiguity
router.get('/:carId/laps-since-maintenance', protect, async (req, res, next) => {
  try {
    const { teamId, carId } = req.params;
    const car = await prisma.car.findFirst({ where: { id: carId, teamId } });
    if (!car) return res.status(404).json({ message: 'Car not found' });

    const lastEvent = await prisma.maintenanceEvent.findFirst({
      where: { carId },
      orderBy: { date: 'desc' },
    });

    const since = lastEvent?.date ?? new Date(0);
    const result = await prisma.raceResult.aggregate({
      where: { carId, createdAt: { gt: since } },
      _sum: { laps: true },
    });

    res.json({
      lapsSinceMaintenance: result._sum.laps ?? 0,
      lastMaintenanceDate: lastEvent?.date ?? null,
    });
  } catch (error) {
    next(error);
  }
});

router.use('/:carId/maintenance', maintenanceRouter);

export default router;
