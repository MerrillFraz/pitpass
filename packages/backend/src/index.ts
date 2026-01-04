import express, { Express, Request, Response } from 'express';
import tripsRouter from './routes/trips';
import expensesRouter from './routes/expenses';
import notesRouter from './routes/notes';
import cors from 'cors';

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173'
}));

app.get('/', (req: Request, res: Response) => {
  res.send('Racing Expenses API');
});

app.use('/api/trips', tripsRouter);
app.use('/api', expensesRouter);
app.use('/api', notesRouter);


app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
