import { render, screen } from '@testing-library/react';
import { MemoryRouter, useParams } from 'react-router-dom';
import CarSetupPage from '../CarSetupPage';
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

describe('CarSetupPage', () => {
  beforeEach(() => {
    (useParams as vi.Mock).mockReturnValue({ teamId: 'team-1', carId: 'car-1' });
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/members')) return Promise.resolve({ data: [] });
      if (url.includes('/setups')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: { id: 'car-1', make: 'Chevrolet', model: 'Monte Carlo', year: 2003 } });
    });
  });

  afterEach(() => {
    mockedAxios.get.mockReset();
  });

  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <CarSetupPage />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /Car Setups/i })).toBeInTheDocument();
  });

  it('shows empty state when no setups', async () => {
    render(
      <MemoryRouter>
        <CarSetupPage />
      </MemoryRouter>
    );
    expect(await screen.findByText(/No setups recorded yet/i)).toBeInTheDocument();
  });

  it('renders setup cards when API returns data', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/members')) return Promise.resolve({ data: [] });
      if (url.includes('/setups')) {
        return Promise.resolve({
          data: [{
            id: 'setup-1',
            tireCompound: 'Hoosier D55',
            springRateFront: 750,
            gearRatio: '5.14',
            createdAt: '2026-01-01T00:00:00.000Z',
          }],
        });
      }
      return Promise.resolve({ data: { id: 'car-1', make: 'Chevrolet', model: 'Monte Carlo', year: 2003 } });
    });

    render(
      <MemoryRouter>
        <CarSetupPage />
      </MemoryRouter>
    );
    expect(await screen.findByText('Hoosier D55')).toBeInTheDocument();
    expect(screen.getByText('5.14')).toBeInTheDocument();
  });
});
