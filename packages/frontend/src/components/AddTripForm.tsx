import { useState } from 'react';
import axios from 'axios';

function AddTripForm() {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    axios.post('/api/trips', { name, date, location })
      .then(() => {
        // Reload the page to see the new trip
        window.location.reload();
      })
      .catch(error => {
        console.error('Error adding trip:', error);
      });
  };

  return (
    <div className="card mt-4">
      <div className="card-body">
        <h5 className="card-title">Add New Trip</h5>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input type="text" className="form-control" id="name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="mb-3">
            <label htmlFor="date" className="form-label">Date</label>
            <input type="date" className="form-control" id="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="mb-3">
            <label htmlFor="location" className="form-label">Location</label>
            <input type="text" className="form-control" id="location" value={location} onChange={e => setLocation(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary">Add Trip</button>
        </form>
      </div>
    </div>
  );
}

export default AddTripForm;
