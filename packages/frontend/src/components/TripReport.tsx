import React, { useEffect, useState } from 'react';

interface Expense {
  id: string;
  tripId: string;
  type: string;
  amount: number;
  date: string;
}

interface Note {
  id: string;
  tripId: string;
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

const TripReport: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch('/api/trips');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('API Response Data:', data);
        if (Array.isArray(data)) {
          setTrips(data);
        } else {
          console.warn('API did not return an array for trips:', data);
          setTrips([]); // Ensure it's always an array
        }
      } catch (e: any) {
        console.error('Error fetching trips:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading trip data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500 text-center">Error: {error}</div>;
  }

const sortedTrips = [...trips].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const grandTotal = trips.reduce((total, trip) => total + (trip.expenses ?? []).reduce((tripTotal, expense) => tripTotal + expense.amount, 0), 0);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Trip Reports</h1>
      <div className="mb-4 text-xl font-bold">
        Grand Total: ${grandTotal.toFixed(2)}
      </div>
      {sortedTrips.length === 0 ? (
        <p className="text-center">No trips found. Add some trips to see reports!</p>
      ) : (
        <div className="space-y-8">
          {sortedTrips
            .map((trip) => {
            console.log('Processing Trip:', trip);
            console.log('Trip Expenses:', trip.expenses);
            console.log('Trip Notes:', trip.notes);
            
            const sortedExpenses = [...(trip.expenses ?? [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const sortedNotes = [...(trip.notes ?? [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const tripTotal = (trip.expenses ?? []).reduce((total, expense) => total + expense.amount, 0);

            return (
              <div key={trip.id} className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-2">{trip.name}</h2>
                <p className="text-gray-600 mb-1"><strong>Date:</strong> {new Date(trip.date).toLocaleDateString()}</p>
                <p className="text-gray-600 mb-4"><strong>Location:</strong> {trip.location}</p>

                {sortedExpenses.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">Expenses:</h3>
                    <ul className="list-disc list-inside ml-4">
                      {sortedExpenses.map((expense) => (
                        <li key={expense.id} className="text-gray-700">
                          {new Date(expense.date).toLocaleDateString()} - {expense.type}: ${expense.amount.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 font-bold">
                      Trip Total: ${tripTotal.toFixed(2)}
                    </div>
                  </div>
                )}

                {sortedNotes.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">Notes:</h3>
                    <ul className="list-disc list-inside ml-4">
                      {sortedNotes.map((note) => (
                        <li key={note.id} className="text-gray-700">
                          {new Date(note.date).toLocaleDateString()} - {note.content}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {sortedExpenses.length === 0 && sortedNotes.length === 0 && (
                  <p className="text-gray-500 mt-4">No expenses or notes for this trip.</p>
                )}
              </div>
            );
          })}

        </div>
      )}
    </div>
  );
};

export default TripReport;
