import { Router } from 'express';
import prisma from '../prisma';
import { validate } from '../middleware/validate';
import { addMemberSchema, updateMemberRoleSchema } from '../schemas/memberSchemas';
import { hasRole } from '../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router({ mergeParams: true });

// GET /api/teams/:teamId/members - List all team members
router.get('/', async (req, res, next) => {
  try {
    const { teamId } = req.params as { teamId: string };

    // Verify the requesting user is a member of this team
    const requestingMembership = await prisma.teamMembership.findFirst({
      where: { teamId, userId: req.user.id },
    });
    if (!requestingMembership) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const memberships = await prisma.teamMembership.findMany({
      where: { teamId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.json(memberships);
  } catch (error) {
    next(error);
  }
});

// POST /api/teams/:teamId/members - Add a member by email
router.post('/', hasRole([Role.OWNER]), validate(addMemberSchema), async (req, res, next) => {
  try {
    const { teamId } = req.params as { teamId: string };
    const { email, role } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existing = await prisma.teamMembership.findFirst({
      where: { teamId, userId: user.id },
    });
    if (existing) {
      return res.status(409).json({ message: 'User is already a member of this team' });
    }

    const membership = await prisma.teamMembership.create({
      data: { teamId, userId: user.id, role, isPrimary: false },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.status(201).json(membership);
  } catch (error) {
    next(error);
  }
});

// PUT /api/teams/:teamId/members/:membershipId - Update a member's role
router.put('/:membershipId', hasRole([Role.OWNER]), validate(updateMemberRoleSchema), async (req, res, next) => {
  try {
    const { teamId, membershipId } = req.params as { teamId: string; membershipId: string };
    const { role } = req.body;

    const membership = await prisma.teamMembership.findFirst({
      where: { id: membershipId, teamId },
    });
    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }
    if (membership.isPrimary && membership.role === Role.OWNER) {
      return res.status(400).json({ message: 'Cannot change the role of the primary owner' });
    }

    const updated = await prisma.teamMembership.update({
      where: { id: membershipId },
      data: { role },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/teams/:teamId/members/:membershipId - Remove a member
router.delete('/:membershipId', hasRole([Role.OWNER]), async (req, res, next) => {
  try {
    const { teamId, membershipId } = req.params as { teamId: string; membershipId: string };

    const membership = await prisma.teamMembership.findFirst({
      where: { id: membershipId, teamId },
    });
    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }
    if (membership.isPrimary && membership.role === Role.OWNER) {
      return res.status(400).json({ message: 'Cannot remove the primary owner from the team' });
    }

    await prisma.teamMembership.delete({ where: { id: membershipId } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
