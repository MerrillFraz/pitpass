import { Router } from 'express';
import prisma from '../prisma';
import { validate } from '../middleware/validate';
import { createExpenseSchema, updateExpenseSchema } from '../schemas/expenseSchemas';

const router = Router({ mergeParams: true });

// GET all expenses for a trip
router.get('/', async (req, res) => {
  const tripId = req.tripId; // Access tripId from merged params
  const expenses = await prisma.expense.findMany({
    where: { tripId },
  });
  res.json(expenses);
});

// POST a new expense for a trip
router.post('/', validate(createExpenseSchema), async (req, res) => {
  const tripId = req.tripId; // Access tripId from merged params
  const { type, amount, date } = req.body;
  const expense = await prisma.expense.create({
    data: {
      tripId,
      type,
      amount,
      date,
    },
  });
  res.status(201).json(expense);
});

// PUT (update) an expense
router.put('/:id', validate(updateExpenseSchema), async (req, res) => {
  const { id } = req.params;
  const tripId = req.tripId; // Access tripId from merged params
  const { type, amount, date } = req.body;
  const expense = await prisma.expense.update({
    where: { id, tripId }, // Ensure expense belongs to the trip
    data: {
      type,
      amount,
      date,
    },
  });
  res.json(expense);
});

// DELETE an expense
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const tripId = req.tripId; // Access tripId from merged params
  await prisma.expense.delete({
    where: { id, tripId }, // Ensure expense belongs to the trip
  });
  res.status(204).json({ message: 'Expense deleted' });
});

export default router;
