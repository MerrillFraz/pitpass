import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
}

interface MaintenanceEvent {
  id: string;
  type: string;
  date: string;
  notes?: string;
  lapInterval?: number;
}

interface LapsSince {
  lapsSinceMaintenance: number;
  lastMaintenanceDate: string | null;
}

interface Membership {
  userId: string;
  role: string;
}

function CarMaintenancePage() {
  const { teamId, carId } = useParams<{ teamId: string; carId: string }>();
  const { user } = useAuth();
  const [car, setCar] = useState<Car | null>(null);
  const [events, setEvents] = useState<MaintenanceEvent[]>([]);
  const [lapsSince, setLapsSince] = useState<LapsSince | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [error, setError] = useState('');

  // Form state
  const [type, setType] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [lapInterval, setLapInterval] = useState('');

  const fetchData = useCallback(() => {
    axios.get(`/api/teams/${teamId}/cars/${carId}`)
      .then(res => setCar(res.data))
      .catch(() => setError('Failed to load car'));

    axios.get(`/api/teams/${teamId}/cars/${carId}/maintenance`)
      .then(res => setEvents(res.data))
      .catch(() => setError('Failed to load maintenance events'));

    axios.get(`/api/teams/${teamId}/cars/${carId}/laps-since-maintenance`)
      .then(res => setLapsSince(res.data))
      .catch(() => {});
  }, [teamId, carId]);

  useEffect(() => {
    fetchData();
    axios.get(`/api/teams/${teamId}/members`)
      .then(res => setMemberships(res.data.map((m: { userId?: string; user?: { id: string }; role: string }) => ({
        userId: m.userId ?? m.user?.id,
        role: m.role,
      }))))
      .catch(() => {});
  }, [teamId, fetchData]);

  const currentMembership = memberships.find(m => m.userId === user?.id);
  const canEdit = currentMembership?.role === 'OWNER' || currentMembership?.role === 'PIT_BOSS';

  const handleSetToday = () => {
    setDate(new Date().toISOString().split('T')[0]);
  };

  const resetForm = () => {
    setType('');
    setDate('');
    setNotes('');
    setLapInterval('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    axios.post(`/api/teams/${teamId}/cars/${carId}/maintenance`, {
      type,
      date: new Date(date).toISOString(),
      notes: notes || undefined,
      lapInterval: lapInterval ? Number(lapInterval) : undefined,
    })
      .then(() => {
        resetForm();
        fetchData();
      })
      .catch(err => {
        const msg = err.response?.data?.message || 'Failed to add maintenance event';
        setError(msg);
      });
  };

  const handleDelete = (eventId: string) => {
    if (!confirm('Delete this maintenance event?')) return;
    axios.delete(`/api/teams/${teamId}/cars/${carId}/maintenance/${eventId}`)
      .then(() => fetchData())
      .catch(() => setError('Failed to delete maintenance event'));
  };

  return (
    <div>
      <Link to={`/teams/${teamId}/cars`} className="btn btn-link ps-0 mb-2">← Back to Cars</Link>
      <h2>
        Maintenance Log
        {car && <span className="text-muted fw-normal fs-5 ms-2">— {car.year} {car.make} {car.model}</span>}
      </h2>

      {error && (
        <div className="alert alert-danger alert-dismissible">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')} />
        </div>
      )}

      {lapsSince && (
        <div className="alert alert-info">
          <strong>Laps under power since last maintenance:</strong> {lapsSince.lapsSinceMaintenance}
          {lapsSince.lastMaintenanceDate && (
            <span className="ms-2 text-muted">
              (since {new Date(lapsSince.lastMaintenanceDate).toLocaleDateString()})
            </span>
          )}
          {!lapsSince.lastMaintenanceDate && (
            <span className="ms-2 text-muted">(no maintenance events recorded)</span>
          )}
        </div>
      )}

      {events.length === 0 ? (
        <p className="text-muted">No maintenance events recorded.</p>
      ) : (
        <table className="table table-bordered mt-3">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Notes</th>
              <th>Lap Interval</th>
              {canEdit && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id}>
                <td>{new Date(event.date).toLocaleDateString()}</td>
                <td>{event.type}</td>
                <td>{event.notes ?? '—'}</td>
                <td>{event.lapInterval ?? '—'}</td>
                {canEdit && (
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(event.id)}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {canEdit && (
        <div className="card mt-3">
          <div className="card-body">
            <h5 className="card-title">Log Maintenance Event</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-2">
                <div className="col-md-4">
                  <label className="form-label">Type</label>
                  <input
                    type="text"
                    className="form-control"
                    value={type}
                    onChange={e => setType(e.target.value)}
                    placeholder="Motor Rebuild, Oil Change..."
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Date</label>
                  <div className="input-group">
                    <input
                      type="date"
                      className="form-control"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      required
                    />
                    <button type="button" className="btn btn-outline-secondary" onClick={handleSetToday}>
                      Today
                    </button>
                  </div>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Lap Interval</label>
                  <input
                    type="number"
                    className="form-control"
                    value={lapInterval}
                    onChange={e => setLapInterval(e.target.value)}
                    placeholder="Optional"
                    min={1}
                  />
                </div>
                <div className="col-md-12">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Optional notes..."
                  />
                </div>
              </div>
              <div className="mt-3">
                <button type="submit" className="btn btn-primary">Log Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CarMaintenancePage;
