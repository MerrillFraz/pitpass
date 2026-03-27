import { render, screen } from '@testing-library/react';
import { MemoryRouter, useParams } from 'react-router-dom';
import TripStopDetail from '../TripStopDetail';
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

describe('TripStopDetail', () => {
  const mockStop = {
    id: 'stop-1',
    trackId: 'track-1',
    track: { name: 'Test Raceway', location: 'Springfield, IL' },
    startDate: '2026-06-01T00:00:00.000Z',
    endDate: '2026-06-02T00:00:00.000Z',
    raceResults: [],
  };

  const mockTrip = {
    id: 'trip-1',
    teamId: 'team-1',
    tripStops: [],
  };

  beforeEach(() => {
    (useParams as vi.Mock).mockReturnValue({ id: 'trip-1', stopId: 'stop-1' });
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/stops/')) return Promise.resolve({ data: mockStop });
      if (url.includes('/api/trips/')) return Promise.resolve({ data: mockTrip });
      if (url.includes('/cars')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
  });

  afterEach(() => {
    mockedAxios.get.mockReset();
  });

  it('renders loading state initially', () => {
    mockedAxios.get.mockReturnValue(new Promise(() => {}));
    render(
      <MemoryRouter>
        <TripStopDetail />
      </MemoryRouter>
    );
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it('renders track name after loading', async () => {
    render(
      <MemoryRouter>
        <TripStopDetail />
      </MemoryRouter>
    );
    expect(await screen.findByText(/Test Raceway/i)).toBeInTheDocument();
    expect(screen.getByText(/Springfield, IL/i)).toBeInTheDocument();
  });

  it('shows empty results state', async () => {
    render(
      <MemoryRouter>
        <TripStopDetail />
      </MemoryRouter>
    );
    expect(await screen.findByText(/No results logged yet/i)).toBeInTheDocument();
  });
});
