import { render, screen } from '@testing-library/react';
import { MemoryRouter, useParams } from 'react-router-dom';
import CarMaintenancePage from '../CarMaintenancePage';
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

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1', email: 'test@example.com', firstName: 'Test', lastName: 'User' } }),
}));

describe('CarMaintenancePage', () => {
  beforeEach(() => {
    (useParams as vi.Mock).mockReturnValue({ teamId: 'team-1', carId: 'car-1' });
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/laps-since-maintenance')) {
        return Promise.resolve({ data: { lapsSinceMaintenance: 42, lastMaintenanceDate: '2026-01-01T00:00:00.000Z' } });
      }
      if (url.includes('/members')) return Promise.resolve({ data: [] });
      if (url.includes('/maintenance')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: { id: 'car-1', make: 'Chevrolet', model: 'Monte Carlo', year: 2003 } });
    });
  });

  afterEach(() => {
    mockedAxios.get.mockReset();
  });

  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <CarMaintenancePage />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /Maintenance Log/i })).toBeInTheDocument();
  });

  it('displays laps-since-maintenance banner', async () => {
    render(
      <MemoryRouter>
        <CarMaintenancePage />
      </MemoryRouter>
    );
    expect(await screen.findByText(/Laps under power since last maintenance/i)).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('shows empty state when no events', async () => {
    render(
      <MemoryRouter>
        <CarMaintenancePage />
      </MemoryRouter>
    );
    expect(await screen.findByText(/No maintenance events recorded/i)).toBeInTheDocument();
  });
});
