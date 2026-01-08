import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AddExpenseForm from '../AddExpenseForm';
import { describe, it, expect } from 'vitest';

describe('AddExpenseForm', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <AddExpenseForm />
      </BrowserRouter>
    );
    expect(screen.getByText(/Add Expense/i)).toBeInTheDocument();
  });
});
