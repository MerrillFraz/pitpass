import { useState } from 'react';
import axios from 'axios';

interface AddExpenseFormProps {
  tripId: string;
}

function AddExpenseForm({ tripId }: AddExpenseFormProps) {
  const [type, setType] = useState('DIESEL');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    axios.post(`/api/${tripId}/expenses`, { type, amount: parseFloat(amount), date })
      .then(() => {
        window.location.reload();
      })
      .catch(error => {
        console.error('Error adding expense:', error);
      });
  };

  return (
    <div className="card mt-4">
      <div className="card-body">
        <h5 className="card-title">Add New Expense</h5>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="type" className="form-label">Type</label>
            <select className="form-select" id="type" value={type} onChange={e => setType(e.target.value)}>
              <option value="DIESEL">Diesel</option>
              <option value="TOLLS">Tolls</option>
              <option value="PIT_PASSES">Pit Passes</option>
              <option value="RACE_GAS">Race Gas</option>
              <option value="REPAIRS">Repairs</option>
              <option value="FOOD_BEVERAGE">Food/Beverage</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="amount" className="form-label">Amount</label>
            <input type="number" className="form-control" id="amount" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div className="mb-3">
            <label htmlFor="date" className="form-label">Date</label>
            <input type="date" className="form-control" id="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary">Add Expense</button>
        </form>
      </div>
    </div>
  );
}

export default AddExpenseForm;
