import { render, screen } from '@testing-library/react';
import AddExpenseForm from '../AddExpenseForm';

describe('AddExpenseForm', () => {
  it('renders without crashing', () => {
    render(<AddExpenseForm tripId="test-trip-id" />);
    expect(screen.getByText(/Add New Expense/i)).toBeInTheDocument();
  });
});