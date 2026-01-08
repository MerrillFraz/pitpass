import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TripList from '../TripList';
import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TripList', () => {
  it('renders without crashing and displays trips', async () => {
    // Mock successful API response
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        { id: '1', name: 'Trip to Spa', date: '2026-07-20T00:00:00Z', location: 'Spa-Francorchamps' },
        { id: '2', name: 'Trip to Monza', date: '2026-08-15T00:00:00Z', location: 'Monza' },
      ],
    });

    render(
      <BrowserRouter>
        <TripList />
      </BrowserRouter>
    );

    // Initial loading state (if any)
    expect(screen.getByText(/All Trips/i)).toBeInTheDocument();

    // Wait for the trips to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Trip to Spa/i)).toBeInTheDocument();
      expect(screen.getByText(/Trip to Monza/i)).toBeInTheDocument();
    });

    // Ensure the AddTripForm also renders
    expect(screen.getByText(/Add New Trip/i)).toBeInTheDocument();
  });

  it('renders without crashing and handles no trips', async () => {
    // Mock successful API response with no data
    mockedAxios.get.mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter>
        <TripList />
      </BrowserRouter>
    );

    // Initial loading state (if any)
    expect(screen.getByText(/All Trips/i)).toBeInTheDocument();

    // Wait for the API call to resolve
    await waitFor(() => {
      // Expect no trips to be displayed
      expect(screen.queryByText(/Trip to Spa/i)).not.toBeInTheDocument();
    });

    // Ensure the AddTripForm also renders
    expect(screen.getByText(/Add New Trip/i)).toBeInTheDocument();
  });

  it('renders without crashing and handles API error', async () => {
    // Mock API error
    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

    render(
      <BrowserRouter>
        <TripList />
      </BrowserRouter>
    );

    // Initial loading state (if any)
    expect(screen.getByText(/All Trips/i)).toBeInTheDocument();

    // Wait for the API call to resolve (and error to be logged)
    await waitFor(() => {
      // Expect no trips to be displayed due to error
      expect(screen.queryByText(/Trip to Spa/i)).not.toBeInTheDocument();
    });

    // Ensure the AddTripForm also renders
    expect(screen.getByText(/Add New Trip/i)).toBeInTheDocument();
  });
});
