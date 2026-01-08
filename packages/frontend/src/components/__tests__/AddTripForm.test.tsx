import { render, screen } from '@testing-library/react';
import AddTripForm from '../AddTripForm';

describe('AddTripForm', () => {
  it('renders without crashing', () => {
    render(<AddTripForm />);
    expect(screen.getByText(/Add New Trip/i)).toBeInTheDocument();
  });
});