import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// GET all expenses for a trip
router.get('/:tripId/expenses', async (req, res) => {
  const { tripId } = req.params;
  const expenses = await prisma.expense.findMany({
    where: { tripId },
  });
  res.json(expenses);
});

// POST a new expense for a trip
router.post('/:tripId/expenses', async (req, res) => {
  const { tripId } = req.params;
  const { type, amount, date } = req.body;
  const isoDate = new Date(date).toISOString();
  const expense = await prisma.expense.create({
    data: {
      tripId,
      type,
      amount,
      date: isoDate,
    },
  });
  res.json(expense);
});

// DELETE an expense
router.delete('/expenses/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.expense.delete({
    where: { id },
  });
  res.json({ message: 'Expense deleted' });
});

export default router;
