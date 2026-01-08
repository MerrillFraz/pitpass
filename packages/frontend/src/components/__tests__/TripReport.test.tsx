import { render, screen, waitFor } from '@testing-library/react';
import TripReport from '../TripReport';
import { vi } from 'vitest';

describe('TripReport', () => {
  beforeEach(() => {
    vi.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    vi.spyOn(window, 'fetch').mockReturnValue(new Promise(() => {}));
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