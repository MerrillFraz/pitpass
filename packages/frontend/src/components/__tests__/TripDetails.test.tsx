import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TripDetails from '../TripDetails';
import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import * as router from 'react-router-dom';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock useParams
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useParams: () => ({
      id: 'mock-trip-id',
    }),
  };
});

describe('TripDetails', () => {
  it('renders trip details, expenses, and notes after data loads', async () => {
    const mockTrip = {
      id: 'mock-trip-id',
      name: 'Test Trip to Track',
      date: '2026-06-01T00:00:00Z',
      location: 'Test Track',
      expenses: [
        { id: 'exp1', type: 'RACE_GAS', amount: 100, date: '2026-06-01T10:00:00Z' },
      ],
      notes: [
        { id: 'note1', content: 'Checked tire pressures', date: '2026-06-01T09:00:00Z' },
      ],
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockTrip });

    render(
      <BrowserRouter>
        <TripDetails tripId="mock-trip-id" />
      </BrowserRouter>
    );

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(mockTrip.name)).toBeInTheDocument();
      expect(screen.getByText(/Test Track/i)).toBeInTheDocument();
      expect(screen.getByText(/RACE_GAS: \$100/i)).toBeInTheDocument();
      expect(screen.getByText(/Checked tire pressures/i)).toBeInTheDocument();
    });

    // Ensure forms are present
    expect(screen.getByText(/Add Expense/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Note/i)).toBeInTheDocument();
  });

  it('renders loading state initially and handles API error', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(
      <BrowserRouter>
        <TripDetails tripId="mock-trip-id" />
      </BrowserRouter>
    );

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    await waitFor(() => {
      // Expect no trip details to be rendered
      expect(screen.queryByText(/Test Trip to Track/i)).not.toBeInTheDocument();
    });
    // The AddExpenseForm and AddNoteForm are not rendered if trip data fails to load.
  });
});
