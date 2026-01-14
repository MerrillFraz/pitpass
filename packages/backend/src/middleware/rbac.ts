import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { Role } from '@prisma/client';

export const hasRole = (roles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { teamId } = req.params;
    const membership = await prisma.teamMembership.findFirst({
      where: {
        userId: req.user.id,
        teamId,
      },
    });

    if (!membership || !roles.includes(membership.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
};
