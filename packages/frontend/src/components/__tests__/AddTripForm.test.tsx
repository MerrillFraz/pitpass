import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AddTripForm from '../AddTripForm';
import { describe, it, expect } from 'vitest';

describe('AddTripForm', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <AddTripForm />
      </BrowserRouter>
    );
    expect(screen.getByText(/Add Trip/i)).toBeInTheDocument();
  });
});
