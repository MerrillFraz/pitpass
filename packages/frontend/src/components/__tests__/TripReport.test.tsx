import { render, screen, waitFor } from '@testing-library/react';
import TripReport from '../TripReport';
import { vi } from 'vitest';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TripReport', () => {
  beforeEach(() => {
    mockedAxios.get = vi.fn().mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    mockedAxios.get = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<TripReport />);
    expect(screen.getByText(/Loading trip data.../i)).toBeInTheDocument();
  });

  it('renders no trips message when no data', async () => {
    render(<TripReport />);
    await waitFor(() => {
      expect(screen.getByText(/No trips found. Add some trips to see reports!/i)).toBeInTheDocument();
    });
  });
});
