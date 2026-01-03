import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import AddExpenseForm from './AddExpenseForm';
import AddNoteForm from './AddNoteForm';

interface Expense {
  id: string;
  type: string;
  amount: number;
  date: string;
}

interface Note {
  id: string;
  content: string;
  date: string;
}

interface Trip {
  id: string;
  name: string;
  date: string;
  location: string;
  expenses: Expense[];
  notes: Note[];
}

function TripDetails() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
    axios.get(`/api/trips/${id}`)
      .then(response => {
        setTrip(response.data);
      })
      .catch(error => {
        console.error('Error fetching trip details:', error);
      });
  }, [id]);

  if (!trip) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{trip.name}</h2>
      <p>{new Date(trip.date).toLocaleDateString()} at {trip.location}</p>

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Expenses</h5>
              <ul className="list-group">
                {trip.expenses && trip.expenses.map(expense => (
                  <li key={expense.id} className="list-group-item">
                    {expense.type}: ${expense.amount} on {new Date(expense.date).toLocaleDateString()}
                  </li>
                ))}
              </ul>
              <AddExpenseForm tripId={trip.id} />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Notes</h5>
              <ul className="list-group">
                {trip.notes && trip.notes.map(note => (
                  <li key={note.id} className="list-group-item">
                    {note.content} - {new Date(note.date).toLocaleDateString()}
                  </li>
                ))}
              </ul>
              <AddNoteForm tripId={trip.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TripDetails;
