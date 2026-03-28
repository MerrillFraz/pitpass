import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Track {
  name: string;
}

interface TripStop {
  track: Track;
  startDate: string;
}

interface CarSetup {
  id: string;
  tireCompound?: string;
  tireSizeFront?: string;
  tireSizeRear?: string;
  offset?: number;
  springRateFront?: number;
  springRateRear?: number;
  rideHeightFront?: number;
  rideHeightRear?: number;
  shockRateFront?: string;
  shockRateRear?: string;
  gearRatio?: string;
  notes?: string;
  tripStop?: TripStop;
  createdAt: string;
}

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
}

interface Membership {
  userId: string;
  role: string;
}

const emptyForm = {
  tireCompound: '',
  tireSizeFront: '',
  tireSizeRear: '',
  offset: '',
  springRateFront: '',
  springRateRear: '',
  rideHeightFront: '',
  rideHeightRear: '',
  shockRateFront: '',
  shockRateRear: '',
  gearRatio: '',
  notes: '',
};

type FormState = typeof emptyForm;

function CarSetupPage() {
  const { teamId, carId } = useParams<{ teamId: string; carId: string }>();
  const { user } = useAuth();
  const [car, setCar] = useState<Car | null>(null);
  const [setups, setSetups] = useState<CarSetup[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [error, setError] = useState('');
  const [editingSetup, setEditingSetup] = useState<CarSetup | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const fetchSetups = useCallback(() => {
    axios.get(`/api/teams/${teamId}/cars/${carId}/setups`)
      .then(res => setSetups(res.data))
      .catch(() => setError('Failed to load setups'));
  }, [teamId, carId]);

  useEffect(() => {
    axios.get(`/api/teams/${teamId}/cars/${carId}`)
      .then(res => setCar(res.data))
      .catch(() => {});

    fetchSetups();

    axios.get(`/api/teams/${teamId}/members`)
      .then(res => setMemberships(res.data.map((m: { userId?: string; user?: { id: string }; role: string }) => ({
        userId: m.userId ?? m.user?.id,
        role: m.role,
      }))))
      .catch(() => {});
  }, [teamId, carId, fetchSetups]);

  const currentMembership = memberships.find(m => m.userId === user?.id);
  const canEdit = currentMembership?.role === 'OWNER' || currentMembership?.role === 'PIT_BOSS';

  const setField = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingSetup(null);
    setShowForm(false);
  };

  const startEdit = (setup: CarSetup) => {
    setEditingSetup(setup);
    setForm({
      tireCompound: setup.tireCompound ?? '',
      tireSizeFront: setup.tireSizeFront ?? '',
      tireSizeRear: setup.tireSizeRear ?? '',
      offset: setup.offset != null ? String(setup.offset) : '',
      springRateFront: setup.springRateFront != null ? String(setup.springRateFront) : '',
      springRateRear: setup.springRateRear != null ? String(setup.springRateRear) : '',
      rideHeightFront: setup.rideHeightFront != null ? String(setup.rideHeightFront) : '',
      rideHeightRear: setup.rideHeightRear != null ? String(setup.rideHeightRear) : '',
      shockRateFront: setup.shockRateFront ?? '',
      shockRateRear: setup.shockRateRear ?? '',
      gearRatio: setup.gearRatio ?? '',
      notes: setup.notes ?? '',
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Record<string, string | number | undefined> = {};
    if (form.tireCompound) data.tireCompound = form.tireCompound;
    if (form.tireSizeFront) data.tireSizeFront = form.tireSizeFront;
    if (form.tireSizeRear) data.tireSizeRear = form.tireSizeRear;
    if (form.offset) data.offset = Number(form.offset);
    if (form.springRateFront) data.springRateFront = Number(form.springRateFront);
    if (form.springRateRear) data.springRateRear = Number(form.springRateRear);
    if (form.rideHeightFront) data.rideHeightFront = Number(form.rideHeightFront);
    if (form.rideHeightRear) data.rideHeightRear = Number(form.rideHeightRear);
    if (form.shockRateFront) data.shockRateFront = form.shockRateFront;
    if (form.shockRateRear) data.shockRateRear = form.shockRateRear;
    if (form.gearRatio) data.gearRatio = form.gearRatio;
    if (form.notes) data.notes = form.notes;

    const request = editingSetup
      ? axios.put(`/api/teams/${teamId}/cars/${carId}/setups/${editingSetup.id}`, data)
      : axios.post(`/api/teams/${teamId}/cars/${carId}/setups`, data);

    request
      .then(() => {
        resetForm();
        fetchSetups();
      })
      .catch(err => {
        const msg = err.response?.data?.message || 'Failed to save setup';
        setError(msg);
      });
  };

  const handleDelete = (setupId: string) => {
    if (!confirm('Delete this setup?')) return;
    axios.delete(`/api/teams/${teamId}/cars/${carId}/setups/${setupId}`)
      .then(() => fetchSetups())
      .catch(() => setError('Failed to delete setup'));
  };

  const renderSetupCard = (setup: CarSetup) => {
    const fields: { label: string; value: string | number | undefined }[] = [
      { label: 'Tire Compound', value: setup.tireCompound },
      { label: 'Tire Front', value: setup.tireSizeFront },
      { label: 'Tire Rear', value: setup.tireSizeRear },
      { label: 'Offset', value: setup.offset },
      { label: 'Spring Front', value: setup.springRateFront },
      { label: 'Spring Rear', value: setup.springRateRear },
      { label: 'Ride Height Front', value: setup.rideHeightFront },
      { label: 'Ride Height Rear', value: setup.rideHeightRear },
      { label: 'Shock Front', value: setup.shockRateFront },
      { label: 'Shock Rear', value: setup.shockRateRear },
      { label: 'Gear Ratio', value: setup.gearRatio },
    ].filter(f => f.value != null && f.value !== '');

    return (
      <div key={setup.id} className="card mb-3">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h6 className="card-subtitle mb-1 text-muted">
                {setup.tripStop
                  ? `${setup.tripStop.track.name} — ${new Date(setup.tripStop.startDate).toLocaleDateString()}`
                  : `Setup from ${new Date(setup.createdAt).toLocaleDateString()}`}
              </h6>
            </div>
            {canEdit && (
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(setup)}>Edit</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(setup.id)}>Delete</button>
              </div>
            )}
          </div>
          <div className="row row-cols-2 row-cols-md-4 g-2">
            {fields.map(f => (
              <div key={f.label} className="col">
                <small className="text-muted d-block">{f.label}</small>
                <span>{f.value}</span>
              </div>
            ))}
          </div>
          {setup.notes && <p className="mt-2 mb-0 text-muted"><em>{setup.notes}</em></p>}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Link to={`/teams/${teamId}/cars`} className="btn btn-link ps-0 mb-2">← Back to Cars</Link>
      <h2>
        Car Setups
        {car && <span className="text-muted fw-normal fs-5 ms-2">— {car.year} {car.make} {car.model}</span>}
      </h2>

      {error && (
        <div className="alert alert-danger alert-dismissible">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')} />
        </div>
      )}

      {canEdit && !showForm && (
        <button className="btn btn-primary mb-3" onClick={() => setShowForm(true)}>
          + Add Setup
        </button>
      )}

      {setups.length === 0 && !showForm && (
        <p className="text-muted">No setups recorded yet.</p>
      )}

      {setups.map(renderSetupCard)}

      {showForm && (
        <div className="card mt-3">
          <div className="card-body">
            <h5 className="card-title">{editingSetup ? 'Edit Setup' : 'New Setup'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-2 mb-2">
                <div className="col-md-4">
                  <label className="form-label">Tire Compound</label>
                  <input type="text" className="form-control" value={form.tireCompound} onChange={e => setField('tireCompound', e.target.value)} placeholder="Hoosier D55" />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Tire Size Front</label>
                  <input type="text" className="form-control" value={form.tireSizeFront} onChange={e => setField('tireSizeFront', e.target.value)} placeholder="27.5 x 8-15" />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Tire Size Rear</label>
                  <input type="text" className="form-control" value={form.tireSizeRear} onChange={e => setField('tireSizeRear', e.target.value)} placeholder="90/14-15" />
                </div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-2">
                  <label className="form-label">Offset</label>
                  <input type="number" step="0.1" className="form-control" value={form.offset} onChange={e => setField('offset', e.target.value)} />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Spring Rate Front</label>
                  <input type="number" step="1" className="form-control" value={form.springRateFront} onChange={e => setField('springRateFront', e.target.value)} placeholder="750" />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Spring Rate Rear</label>
                  <input type="number" step="1" className="form-control" value={form.springRateRear} onChange={e => setField('springRateRear', e.target.value)} placeholder="225" />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Ride Height Front</label>
                  <input type="number" step="0.1" className="form-control" value={form.rideHeightFront} onChange={e => setField('rideHeightFront', e.target.value)} placeholder="3.5" />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Ride Height Rear</label>
                  <input type="number" step="0.1" className="form-control" value={form.rideHeightRear} onChange={e => setField('rideHeightRear', e.target.value)} placeholder="5.0" />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Gear Ratio</label>
                  <input type="text" className="form-control" value={form.gearRatio} onChange={e => setField('gearRatio', e.target.value)} placeholder="5.14" />
                </div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-3">
                  <label className="form-label">Shock Rate Front</label>
                  <input type="text" className="form-control" value={form.shockRateFront} onChange={e => setField('shockRateFront', e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Shock Rate Rear</label>
                  <input type="text" className="form-control" value={form.shockRateRear} onChange={e => setField('shockRateRear', e.target.value)} />
                </div>
              </div>
              <div className="mb-2">
                <label className="form-label">Notes</label>
                <textarea className="form-control" rows={2} value={form.notes} onChange={e => setField('notes', e.target.value)} placeholder="Baseline setup for flat tracks..." />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">{editingSetup ? 'Save Changes' : 'Add Setup'}</button>
                <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CarSetupPage;
