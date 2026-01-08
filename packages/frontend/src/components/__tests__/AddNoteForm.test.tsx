import { render, screen } from '@testing-library/react';
import AddNoteForm from '../AddNoteForm';

describe('AddNoteForm', () => {
  it('renders without crashing', () => {
    render(<AddNoteForm tripId="test-trip-id" />);
    expect(screen.getByText(/Add New Note/i)).toBeInTheDocument();
  });
});