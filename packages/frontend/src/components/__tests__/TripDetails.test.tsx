import { render, screen } from '@testing-library/react';
import { MemoryRouter, useParams } from 'react-router-dom';
import TripDetails from '../TripDetails';
import axios from 'axios';
import { vi } from 'vitest';

vi.mock('axios');
const mockedAxios = axios as vi.Mocked<typeof axios>;

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useParams: vi.fn(),
  };
});

describe('TripDetails', () => {
  const mockTrip = {
    id: 'trip-1',
    name: 'Test Trip',
    date: '2026-01-01',
    location: 'Test Location',
    expenses: [],
    notes: [],
  };

  beforeEach(() => {
    (useParams as vi.Mock).mockReturnValue({ id: 'trip-1' });
    mockedAxios.get.mockResolvedValue({ data: mockTrip });
  });

  it('renders loading state initially', () => {
    (useParams as vi.Mock).mockReturnValue({ id: 'loading-trip' });
    mockedAxios.get.mockReturnValue(new Promise(() => {}));
    render(
      <MemoryRouter>
        <TripDetails />
      </MemoryRouter>
    );
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it('renders trip details after loading', async () => {
    render(
      <MemoryRouter>
        <TripDetails />
      </MemoryRouter>
    );
    expect(await screen.findByText(/Test Trip/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Location/i)).toBeInTheDocument();
  });
});