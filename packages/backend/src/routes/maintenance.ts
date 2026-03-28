import { Router } from 'express';
import prisma from '../prisma';
import { validate } from '../middleware/validate';
import { createMaintenanceSchema, updateMaintenanceSchema } from '../schemas/maintenanceSchemas';
import { hasRole } from '../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router({ mergeParams: true });

// Helper: verify the requesting user is a member of the team
async function requireMembership(userId: string, teamId: string) {
  return prisma.teamMembership.findFirst({ where: { userId, teamId } });
}

// GET /api/teams/:teamId/cars/:carId/maintenance
router.get('/', async (req, res, next) => {
  try {
    const { teamId, carId } = req.params as { teamId: string; carId: string };
    const membership = await requireMembership(req.user.id, teamId);
    if (!membership) return res.status(403).json({ message: 'Not a member of this team' });

    const events = await prisma.maintenanceEvent.findMany({
      where: { carId },
      orderBy: { date: 'desc' },
    });
    res.json(events);
  } catch (error) {
    next(error);
  }
});

// GET /api/teams/:teamId/cars/:carId/maintenance/:eventId
router.get('/:eventId', async (req, res, next) => {
  try {
    const { teamId, carId, eventId } = req.params as { teamId: string; carId: string; eventId: string };
    const membership = await requireMembership(req.user.id, teamId);
    if (!membership) return res.status(403).json({ message: 'Not a member of this team' });

    const event = await prisma.maintenanceEvent.findFirst({ where: { id: eventId, carId } });
    if (!event) return res.status(404).json({ message: 'Maintenance event not found' });
    res.json(event);
  } catch (error) {
    next(error);
  }
});

// POST /api/teams/:teamId/cars/:carId/maintenance
router.post(
  '/',
  hasRole([Role.OWNER, Role.PIT_BOSS]),
  validate(createMaintenanceSchema),
  async (req, res, next) => {
    try {
      const { carId } = req.params;
      const { type, date, notes, lapInterval } = req.body;
      const event = await prisma.maintenanceEvent.create({
        data: { carId, type, date, notes, lapInterval },
      });
      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/teams/:teamId/cars/:carId/maintenance/:eventId
router.put(
  '/:eventId',
  hasRole([Role.OWNER, Role.PIT_BOSS]),
  validate(updateMaintenanceSchema),
  async (req, res, next) => {
    try {
      const { carId, eventId } = req.params;
      const { type, date, notes, lapInterval } = req.body;
      const updated = await prisma.maintenanceEvent.updateMany({
        where: { id: eventId, carId },
        data: { type, date, notes, lapInterval },
      });
      if (updated.count === 0) return res.status(404).json({ message: 'Maintenance event not found' });
      const event = await prisma.maintenanceEvent.findFirst({ where: { id: eventId } });
      res.json(event);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/teams/:teamId/cars/:carId/maintenance/:eventId
router.delete('/:eventId', hasRole([Role.OWNER, Role.PIT_BOSS]), async (req, res, next) => {
  try {
    const { carId, eventId } = req.params;
    const deleted = await prisma.maintenanceEvent.deleteMany({ where: { id: eventId, carId } });
    if (deleted.count === 0) return res.status(404).json({ message: 'Maintenance event not found' });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
