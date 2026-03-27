import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
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

interface Track {
  id: string;
  name: string;
  location: string;
}

interface TripStop {
  id: string;
  trackId: string;
  track: Track;
  startDate: string;
  endDate: string;
}

interface Trip {
  id: string;
  name: string;
  date: string;
  location: string;
  expenses: Expense[];
  notes: Note[];
  tripStops: TripStop[];
}

function TripDetails() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);

  // Add stop form state
  const [trackId, setTrackId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchTrip = useCallback(() => {
    axios.get(`/api/trips/${id}`)
      .then(response => {
        setTrip(response.data);
      })
      .catch(error => {
        console.error('Error fetching trip details:', error);
      });
  }, [id]);

  useEffect(() => {
    fetchTrip();
    axios.get('/api/tracks')
      .then(res => {
        setTracks(res.data);
        if (res.data.length > 0) setTrackId(res.data[0].id);
      })
      .catch(() => {});
  }, [fetchTrip]);

  const handleAddStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackId) return;
    axios.post(`/api/trips/${id}/stops`, {
      trackId,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
    })
      .then(() => {
        setStartDate('');
        setEndDate('');
        if (tracks.length > 0) setTrackId(tracks[0].id);
        fetchTrip();
      })
      .catch(error => console.error('Error adding stop:', error));
  };

  if (!trip) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Link to="/" className="btn btn-link">Back to Trips</Link>
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
              <AddExpenseForm tripId={trip.id} onSuccess={fetchTrip} />
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
              <AddNoteForm tripId={trip.id} onSuccess={fetchTrip} />
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-body">
          <h5 className="card-title">Trip Stops</h5>
          {trip.tripStops.length === 0 ? (
            <p className="text-muted">No stops yet. Add one below.</p>
          ) : (
            <ul className="list-group mb-3">
              {trip.tripStops.map(stop => (
                <li key={stop.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{stop.track.name}</strong>
                    <span className="text-muted ms-2">{stop.track.location}</span>
                    <span className="text-muted ms-3 small">
                      {new Date(stop.startDate).toLocaleDateString()} – {new Date(stop.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <Link
                    to={`/trip/${id}/stops/${stop.id}`}
                    className="btn btn-sm btn-outline-primary"
                  >
                    Results
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {tracks.length > 0 && (
            <form onSubmit={handleAddStop} className="row g-2 align-items-end mt-2">
              <div className="col-md-4">
                <label className="form-label">Track</label>
                <select
                  className="form-select"
                  value={trackId}
                  onChange={e => setTrackId(e.target.value)}
                  required
                >
                  {tracks.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-primary w-100">Add Stop</button>
              </div>
            </form>
          )}
          {tracks.length === 0 && (
            <p className="text-muted small">No tracks in the system yet — tracks are added via the seed or admin.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TripDetails;
