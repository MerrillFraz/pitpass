import { render, screen } from '@testing-library/react';
import AddTripForm from '../AddTripForm';
import axios from 'axios';
import { vi } from 'vitest';

vi.mock('axios');
const mockedAxios = axios as vi.Mocked<typeof axios>;

describe('AddTripForm', () => {
  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({ data: [] });
  });

  it('renders without crashing', () => {
    render(<AddTripForm />);
    expect(screen.getByText(/Add New Trip/i)).toBeInTheDocument();
  });
});
