import express, { Express, Request, Response } from 'express';
import tripsRouter from './routes/trips';
import authRouter from './routes/auth';
import teamsRouter from './routes/teams';
// import expensesRouter from './routes/expenses'; // Removed
// import notesRouter from './routes/notes';     // Removed
import cors from 'cors';
import errorHandler from './middleware/errorHandler'; // Import the error handler

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set');
  process.exit(1);
}

const app: Express = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));

app.get('/', (req: Request, res: Response) => {
  res.send('Racing Expenses API');
});

app.use('/api/auth', authRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/teams', teamsRouter);
// app.use('/api', expensesRouter); // Removed
// app.use('/api', notesRouter);     // Removed

app.use(errorHandler); // Use the centralized error handler

app.listen(port, '0.0.0.0', () => {
  console.log(`[server]: Server is running at http://0.0.0.0:${port}`);
});
