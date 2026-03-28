import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  vin?: string;
}

interface Membership {
  userId: string;
  role: string;
  isPrimary: boolean;
}

const currentYear = new Date().getFullYear();

function CarsPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const { user } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [error, setError] = useState('');
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  // Form state
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(currentYear);
  const [color, setColor] = useState('');
  const [vin, setVin] = useState('');

  const fetchCars = useCallback(() => {
    axios.get(`/api/teams/${teamId}/cars`)
      .then(res => setCars(res.data))
      .catch(() => setError('Failed to load cars'));
  }, [teamId]);

  useEffect(() => {
    fetchCars();
    axios.get(`/api/teams/${teamId}/members`)
      .then(res => setMemberships(res.data.map((m: { userId: string; role: string; isPrimary: boolean; user?: { id: string } }) => ({
        userId: m.userId ?? m.user?.id,
        role: m.role,
        isPrimary: m.isPrimary,
      })))
      )
      .catch(() => {});
  }, [teamId, fetchCars]);

  const currentMembership = memberships.find(m => m.userId === user?.id);
  const canEdit = currentMembership?.role === 'OWNER' || currentMembership?.role === 'PIT_BOSS';

  const resetForm = () => {
    setMake('');
    setModel('');
    setYear(currentYear);
    setColor('');
    setVin('');
    setEditingCar(null);
  };

  const startEdit = (car: Car) => {
    setEditingCar(car);
    setMake(car.make);
    setModel(car.model);
    setYear(car.year);
    setColor(car.color ?? '');
    setVin(car.vin ?? '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      make,
      model,
      year: Number(year),
      color: color || undefined,
      vin: vin || undefined,
    };

    const request = editingCar
      ? axios.put(`/api/teams/${teamId}/cars/${editingCar.id}`, data)
      : axios.post(`/api/teams/${teamId}/cars`, data);

    request
      .then(() => {
        resetForm();
        fetchCars();
      })
      .catch(err => {
        const msg = err.response?.data?.message || 'Failed to save car';
        setError(msg);
      });
  };

  const handleDelete = (carId: string) => {
    if (!confirm('Delete this car? This cannot be undone.')) return;
    axios.delete(`/api/teams/${teamId}/cars/${carId}`)
      .then(() => fetchCars())
      .catch(() => setError('Failed to delete car'));
  };

  return (
    <div>
      <Link to="/teams" className="btn btn-link ps-0 mb-2">← Back to Teams</Link>
      <h2>Cars</h2>
      {error && (
        <div className="alert alert-danger alert-dismissible">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')} />
        </div>
      )}

      {cars.length === 0 ? (
        <p className="text-muted">No cars yet. {canEdit ? 'Add one below.' : ''}</p>
      ) : (
        <table className="table table-bordered mt-3">
          <thead>
            <tr>
              <th>Year</th>
              <th>Make</th>
              <th>Model</th>
              <th>Color</th>
              <th>VIN</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.map(car => (
              <tr key={car.id}>
                <td>{car.year}</td>
                <td>{car.make}</td>
                <td>{car.model}</td>
                <td>{car.color ?? '—'}</td>
                <td>{car.vin ?? '—'}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Link
                      to={`/teams/${teamId}/cars/${car.id}/maintenance`}
                      className="btn btn-sm btn-outline-info"
                    >
                      Maintenance
                    </Link>
                    <Link
                      to={`/teams/${teamId}/cars/${car.id}/setups`}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      Setups
                    </Link>
                    {canEdit && (
                      <>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => startEdit(car)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(car.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {canEdit && (
        <div className="card mt-3">
          <div className="card-body">
            <h5 className="card-title">{editingCar ? 'Edit Car' : 'Add Car'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-2">
                <div className="col-md-2">
                  <label className="form-label">Year</label>
                  <input
                    type="number"
                    className="form-control"
                    value={year}
                    onChange={e => setYear(Number(e.target.value))}
                    min={1900}
                    max={currentYear + 1}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Make</label>
                  <input
                    type="text"
                    className="form-control"
                    value={make}
                    onChange={e => setMake(e.target.value)}
                    placeholder="Chevrolet"
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Model</label>
                  <input
                    type="text"
                    className="form-control"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    placeholder="Monte Carlo"
                    required
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Color</label>
                  <input
                    type="text"
                    className="form-control"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">VIN</label>
                  <input
                    type="text"
                    className="form-control"
                    value={vin}
                    onChange={e => setVin(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="mt-3 d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  {editingCar ? 'Save Changes' : 'Add Car'}
                </button>
                {editingCar && (
                  <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CarsPage;
