import { Router } from 'express';
import prisma from '../prisma';
import { validate } from '../middleware/validate';
import { createTeamSchema, updateTeamSchema } from '../schemas/teamSchemas';
import { protect } from '../middleware/auth';
import { hasRole } from '../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router();
router.use(protect);

// POST /api/teams - Create a new team
router.post('/', validate(createTeamSchema), async (req, res, next) => {
  try {
    const { name } = req.body;
    const team = await prisma.team.create({
      data: {
        name,
        memberships: {
          create: {
            userId: req.user.id,
            role: Role.OWNER,
            isPrimary: true,
          },
        },
      },
    });
    res.status(201).json(team);
  } catch (error) {
    next(error);
  }
});

// GET /api/teams - Get all teams for the authenticated user
router.get('/', async (req, res, next) => {
  try {
    const teams = await prisma.team.findMany({
      where: {
        memberships: {
          some: {
            userId: req.user.id,
          },
        },
      },
    });
    res.json(teams);
  } catch (error) {
    next(error);
  }
});

// GET /api/teams/:teamId - Get a single team by id
router.get('/:teamId', async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        memberships: {
          some: {
            userId: req.user.id,
          },
        },
      },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      }
    });
    res.json(team);
  } catch (error) {
    next(error);
  }
});

// PUT /api/teams/:teamId - Update a team
router.put(
  '/:teamId',
  validate(updateTeamSchema),
  hasRole([Role.OWNER]),
  async (req, res, next) => {
    try {
      const { teamId } = req.params;
      const { name } = req.body;
      const team = await prisma.team.update({
        where: {
          id: teamId,
        },
        data: {
          name,
        },
      });
      res.json(team);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/teams/:teamId - Delete a team
router.delete('/:teamId', hasRole([Role.OWNER]), async (req, res, next) => {
  try {
    const { teamId } = req.params;

    await prisma.team.delete({
      where: {
        id: teamId,
      },
    });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
