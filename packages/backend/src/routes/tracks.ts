import { Router } from 'express';
import prisma from '../prisma';
import { protect } from '../middleware/auth';

const router = Router();
router.use(protect);

// GET /api/tracks - List all tracks (read-only, for populating selectors)
router.get('/', async (req, res, next) => {
  try {
    const tracks = await prisma.track.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(tracks);
  } catch (error) {
    next(error);
  }
});

export default router;
