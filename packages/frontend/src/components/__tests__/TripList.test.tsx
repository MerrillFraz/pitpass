import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TripList from '../TripList';
import axios from 'axios';
import { vi } from 'vitest';

vi.mock('axios');
const mockedAxios = axios as vi.Mocked<typeof axios>;

describe('TripList', () => {
  const mockTrips = [
    { id: '1', name: 'Trip 1', date: '2026-01-01', location: 'Location A' },
    { id: '2', name: 'Trip 2', date: '2026-01-02', location: 'Location B' },
  ];

  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({ data: { data: mockTrips } });
  });

  afterEach(() => {
    mockedAxios.get.mockRestore();
  });

  it('renders loading state initially (if any) and then lists trips', async () => {
    render(
      <MemoryRouter>
        <TripList />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Trip 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Trip 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Add New Trip/i)).toBeInTheDocument();
  });

  it('renders no trips message if API returns empty', async () => {
    mockedAxios.get.mockResolvedValue({ data: { data: [] } });
    render(
      <MemoryRouter>
        <TripList />
      </MemoryRouter>
    );

    expect(await screen.findByText(/All Trips/i)).toBeInTheDocument();
    expect(screen.queryByText(/Trip 1/i)).not.toBeInTheDocument();
  });
});