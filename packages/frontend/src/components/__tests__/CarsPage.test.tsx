import { render, screen } from '@testing-library/react';
import { MemoryRouter, useParams } from 'react-router-dom';
import CarsPage from '../CarsPage';
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

describe('CarsPage', () => {
  beforeEach(() => {
    (useParams as vi.Mock).mockReturnValue({ teamId: 'team-1' });
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/members')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
  });

  afterEach(() => {
    mockedAxios.get.mockReset();
  });

  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <CarsPage />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /Cars/i })).toBeInTheDocument();
  });

  it('renders empty state when no cars', async () => {
    render(
      <MemoryRouter>
        <CarsPage />
      </MemoryRouter>
    );
    expect(await screen.findByText(/No cars yet/i)).toBeInTheDocument();
  });

  it('renders cars in a table when API returns data', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/members')) return Promise.resolve({ data: [] });
      return Promise.resolve({
        data: [
          { id: 'car-1', make: 'Chevrolet', model: 'Monte Carlo', year: 2003, color: 'Blue' },
        ],
      });
    });

    render(
      <MemoryRouter>
        <CarsPage />
      </MemoryRouter>
    );
    expect(await screen.findByText('Chevrolet')).toBeInTheDocument();
    expect(screen.getByText('Monte Carlo')).toBeInTheDocument();
    expect(screen.getByText('2003')).toBeInTheDocument();
  });
});
