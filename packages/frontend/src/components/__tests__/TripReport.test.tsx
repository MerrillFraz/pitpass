import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TripReport from '../TripReport';
import { describe, it, expect, vi } from 'vitest';

describe('TripReport', () => {
  // Mock the global fetch function
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  it('renders loading state initially and then trip reports', async () => {
    const mockTrips = [
      {
        id: '1',
        name: 'Summer Race Series',
        date: '2026-07-10T00:00:00Z',
        location: 'Local Track',
        expenses: [{ id: 'e1', tripId: '1', type: 'RACE_GAS', amount: 150, date: '2026-07-10T00:00:00Z' }],
        notes: [{ id: 'n1', tripId: '1', content: 'Engine felt strong', date: '2026-07-10T00:00:00Z' }],
      },
      {
        id: '2',
        name: 'Winter Testing',
        date: '2026-01-05T00:00:00Z',
        location: 'Desert Track',
        expenses: [{ id: 'e2', tripId: '2', type: 'DIESEL', amount: 50, date: '2026-01-05T00:00:00Z' }],
        notes: [],
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTrips),
    });

    render(
      <BrowserRouter>
        <TripReport />
      </BrowserRouter>
    );

    // Should show loading state initially
    expect(screen.getByText(/Loading trip data.../i)).toBeInTheDocument();

    // Wait for data to load and components to render
    await waitFor(() => {
      expect(screen.getByText(/Trip Reports/i)).toBeInTheDocument();
      expect(screen.getByText(/Grand Total: \$200.00/i)).toBeInTheDocument();
      expect(screen.getByText(/Summer Race Series/i)).toBeInTheDocument();
      expect(screen.getByText(/Local Track/i)).toBeInTheDocument();
      expect(screen.getByText(/RACE_GAS: \$150.00/i)).toBeInTheDocument();
      expect(screen.getByText(/Engine felt strong/i)).toBeInTheDocument();
      expect(screen.getByText(/Winter Testing/i)).toBeInTheDocument();
      expect(screen.getByText(/DIESEL: \$50.00/i)).toBeInTheDocument();
    });
  });

  it('renders message when no trips are found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(
      <BrowserRouter>
        <TripReport />
      </BrowserRouter>
    );

    expect(screen.getByText(/Loading trip data.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/No trips found. Add some trips to see reports!/i)).toBeInTheDocument();
    });
  });

  it('renders error message when API call fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <BrowserRouter>
        <TripReport />
      </BrowserRouter>
    );

    expect(screen.getByText(/Loading trip data.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Error: Network error/i)).toBeInTheDocument();
    });
  });
});
