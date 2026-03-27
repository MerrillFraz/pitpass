import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const SESSION_TYPES = ['HOT_LAPS', 'QUALIFYING', 'HEAT_RACE', 'FEATURE'] as const;
type SessionType = typeof SESSION_TYPES[number];

const SESSION_LABELS: Record<SessionType, string> = {
  HOT_LAPS: 'Hot Laps',
  QUALIFYING: 'Qualifying',
  HEAT_RACE: 'Heat Race',
  FEATURE: 'Feature',
};

const SESSION_BADGE: Record<SessionType, string> = {
  HOT_LAPS: 'bg-secondary',
  QUALIFYING: 'bg-info text-dark',
  HEAT_RACE: 'bg-warning text-dark',
  FEATURE: 'bg-success',
};

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
}

interface RaceResult {
  id: string;
  carId: string;
  car?: Car;
  sessionType?: SessionType;
  startPosition?: number;
  laps?: number;
  bestLapTime?: number;
  position?: number;
  notes?: string;
}

interface Track {
  name: string;
  location: string;
}

interface TripStop {
  id: string;
  trackId: string;
  track: Track;
  startDate: string;
  endDate: string;
  raceResults: RaceResult[];
}

interface Trip {
  id: string;
  teamId: string;
}

function TripStopDetail() {
  const { id: tripId, stopId } = useParams<{ id: string; stopId: string }>();
  const [stop, setStop] = useState<TripStop | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [error, setError] = useState('');

  // Form state
  const [sessionType, setSessionType] = useState<SessionType>('FEATURE');
  const [carId, setCarId] = useState('');
  const [startPosition, setStartPosition] = useState('');
  const [laps, setLaps] = useState('');
  const [bestLapTime, setBestLapTime] = useState('');
  const [position, setPosition] = useState('');
  const [notes, setNotes] = useState('');

  const fetchStop = useCallback(() => {
    axios.get(`/api/trips/${tripId}/stops/${stopId}`)
      .then(res => setStop(res.data))
      .catch(() => setError('Failed to load trip stop'));
  }, [tripId, stopId]);

  useEffect(() => {
    fetchStop();
    axios.get(`/api/trips/${tripId}`)
      .then(res => {
        setTrip(res.data);
        return axios.get(`/api/teams/${res.data.teamId}/cars`);
      })
      .then(res => {
        setCars(res.data);
        if (res.data.length > 0) setCarId(res.data[0].id);
      })
      .catch(() => {});
  }, [tripId, fetchStop]);

  const showPosition = sessionType === 'QUALIFYING' || sessionType === 'HEAT_RACE' || sessionType === 'FEATURE';
  const showStartPosition = sessionType === 'HEAT_RACE' || sessionType === 'FEATURE';

  const resetForm = () => {
    setSessionType('FEATURE');
    setStartPosition('');
    setLaps('');
    setBestLapTime('');
    setPosition('');
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!carId) return;

    const data: Record<string, string | number | undefined> = {
      carId,
      sessionType,
      laps: laps ? Number(laps) : undefined,
      bestLapTime: bestLapTime ? Number(bestLapTime) : undefined,
      position: position ? Number(position) : undefined,
      startPosition: startPosition ? Number(startPosition) : undefined,
      notes: notes || undefined,
    };

    axios.post(`/api/trips/${tripId}/stops/${stopId}/results`, data)
      .then(() => {
        resetForm();
        if (cars.length > 0) setCarId(cars[0].id);
        fetchStop();
      })
      .catch(err => {
        const msg = err.response?.data?.message || 'Failed to add result';
        setError(msg);
      });
  };

  const handleDelete = (resultId: string) => {
    if (!confirm('Delete this result?')) return;
    axios.delete(`/api/trips/${tripId}/stops/${stopId}/results/${resultId}`)
      .then(() => fetchStop())
      .catch(() => setError('Failed to delete result'));
  };

  if (!stop) return <div>Loading...</div>;

  return (
    <div>
      <Link to={`/trip/${tripId}`} className="btn btn-link ps-0 mb-2">← Back to Trip</Link>
      <h2>{stop.track.name}</h2>
      <p className="text-muted">
        {stop.track.location} &middot;{' '}
        {new Date(stop.startDate).toLocaleDateString()} – {new Date(stop.endDate).toLocaleDateString()}
      </p>

      {error && (
        <div className="alert alert-danger alert-dismissible">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')} />
        </div>
      )}

      <h5>Race Results</h5>
      {stop.raceResults.length === 0 ? (
        <p className="text-muted">No results logged yet.</p>
      ) : (
        <table className="table table-bordered mb-4">
          <thead>
            <tr>
              <th>Session</th>
              <th>Car</th>
              <th>Start</th>
              <th>Finish</th>
              <th>Laps</th>
              <th>Best Lap</th>
              <th>Notes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {stop.raceResults.map(r => (
              <tr key={r.id}>
                <td>
                  {r.sessionType ? (
                    <span className={`badge ${SESSION_BADGE[r.sessionType]}`}>
                      {SESSION_LABELS[r.sessionType]}
                    </span>
                  ) : '—'}
                </td>
                <td>
                  {r.car ? `${r.car.year} ${r.car.make} ${r.car.model}` : r.carId}
                </td>
                <td>{r.startPosition != null ? `P${r.startPosition}` : '—'}</td>
                <td>{r.position != null ? `P${r.position}` : '—'}</td>
                <td>{r.laps ?? '—'}</td>
                <td>{r.bestLapTime != null ? `${r.bestLapTime.toFixed(3)}s` : '—'}</td>
                <td>{r.notes ?? '—'}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(r.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Log Result</h5>
          <form onSubmit={handleSubmit}>
            <div className="row g-2 mb-2">
              <div className="col-md-3">
                <label className="form-label">Session</label>
                <select
                  className="form-select"
                  value={sessionType}
                  onChange={e => setSessionType(e.target.value as SessionType)}
                >
                  {SESSION_TYPES.map(s => (
                    <option key={s} value={s}>{SESSION_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Car</label>
                <select
                  className="form-select"
                  value={carId}
                  onChange={e => setCarId(e.target.value)}
                  required
                >
                  {cars.length === 0 && <option value="">No cars — add one first</option>}
                  {cars.map(c => (
                    <option key={c.id} value={c.id}>{c.year} {c.make} {c.model}</option>
                  ))}
                </select>
              </div>
              {showStartPosition && (
                <div className="col-md-2">
                  <label className="form-label">Start Position</label>
                  <input
                    type="number"
                    className="form-control"
                    value={startPosition}
                    onChange={e => setStartPosition(e.target.value)}
                    min={1}
                    placeholder="P#"
                  />
                </div>
              )}
              {showPosition && (
                <div className="col-md-2">
                  <label className="form-label">Finish Position</label>
                  <input
                    type="number"
                    className="form-control"
                    value={position}
                    onChange={e => setPosition(e.target.value)}
                    min={1}
                    placeholder="P#"
                  />
                </div>
              )}
            </div>
            <div className="row g-2 mb-2">
              <div className="col-md-2">
                <label className="form-label">Laps</label>
                <input
                  type="number"
                  className="form-control"
                  value={laps}
                  onChange={e => setLaps(e.target.value)}
                  min={1}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Best Lap Time (s)</label>
                <input
                  type="number"
                  step="0.001"
                  className="form-control"
                  value={bestLapTime}
                  onChange={e => setBestLapTime(e.target.value)}
                  placeholder="14.523"
                />
              </div>
              <div className="col-md-7">
                <label className="form-label">Notes</label>
                <input
                  type="text"
                  className="form-control"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Optional notes..."
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={cars.length === 0}>
              Log Result
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TripStopDetail;
