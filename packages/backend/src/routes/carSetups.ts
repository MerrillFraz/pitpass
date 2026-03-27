import { Router } from 'express';
import prisma from '../prisma';
import { validate } from '../middleware/validate';
import { createCarSetupSchema, updateCarSetupSchema } from '../schemas/carSetupSchemas';
import { hasRole } from '../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router({ mergeParams: true });

// Helper: verify the requesting user is a member of the team
async function requireMembership(userId: string, teamId: string) {
  return prisma.teamMembership.findFirst({ where: { userId, teamId } });
}

// GET /api/teams/:teamId/cars/:carId/setups
router.get('/', async (req, res, next) => {
  try {
    const { teamId, carId } = req.params;
    const membership = await requireMembership(req.user.id, teamId);
    if (!membership) return res.status(403).json({ message: 'Not a member of this team' });

    const setups = await prisma.carSetup.findMany({
      where: { carId },
      include: { tripStop: { include: { track: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(setups);
  } catch (error) {
    next(error);
  }
});

// GET /api/teams/:teamId/cars/:carId/setups/:setupId
router.get('/:setupId', async (req, res, next) => {
  try {
    const { teamId, carId, setupId } = req.params;
    const membership = await requireMembership(req.user.id, teamId);
    if (!membership) return res.status(403).json({ message: 'Not a member of this team' });

    const setup = await prisma.carSetup.findFirst({
      where: { id: setupId, carId },
      include: { tripStop: { include: { track: true } } },
    });
    if (!setup) return res.status(404).json({ message: 'Car setup not found' });
    res.json(setup);
  } catch (error) {
    next(error);
  }
});

// POST /api/teams/:teamId/cars/:carId/setups
router.post(
  '/',
  hasRole([Role.OWNER, Role.PIT_BOSS]),
  validate(createCarSetupSchema),
  async (req, res, next) => {
    try {
      const { carId } = req.params;
      const setup = await prisma.carSetup.create({
        data: { carId, ...req.body },
      });
      res.status(201).json(setup);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/teams/:teamId/cars/:carId/setups/:setupId
router.put(
  '/:setupId',
  hasRole([Role.OWNER, Role.PIT_BOSS]),
  validate(updateCarSetupSchema),
  async (req, res, next) => {
    try {
      const { carId, setupId } = req.params;
      const existing = await prisma.carSetup.findFirst({ where: { id: setupId, carId } });
      if (!existing) return res.status(404).json({ message: 'Car setup not found' });

      const setup = await prisma.carSetup.update({
        where: { id: setupId },
        data: req.body,
      });
      res.json(setup);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/teams/:teamId/cars/:carId/setups/:setupId
router.delete('/:setupId', hasRole([Role.OWNER, Role.PIT_BOSS]), async (req, res, next) => {
  try {
    const { carId, setupId } = req.params;
    const deleted = await prisma.carSetup.deleteMany({ where: { id: setupId, carId } });
    if (deleted.count === 0) return res.status(404).json({ message: 'Car setup not found' });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
