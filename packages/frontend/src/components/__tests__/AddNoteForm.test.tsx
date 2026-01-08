import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AddNoteForm from '../AddNoteForm';
import { describe, it, expect } from 'vitest';

describe('AddNoteForm', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <AddNoteForm />
      </BrowserRouter>
    );
    expect(screen.getByText(/Add Note/i)).toBeInTheDocument();
  });
});
