import { useState, useEffect } from 'react';
import axios from 'axios';

interface Team {
  id: string;
  name: string;
}

interface AddTripFormProps {
  onSuccess?: () => void;
}

function AddTripForm({ onSuccess }: AddTripFormProps) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState('');

  useEffect(() => {
    axios.get('/api/teams')
      .then(res => {
        setTeams(res.data);
        if (res.data.length > 0) setTeamId(res.data[0].id);
      })
      .catch(err => console.error('Error fetching teams:', err));
  }, []);

  const handleSetToday = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
    setDate(formattedDate);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    axios.post('/api/trips', { name, date: new Date(date).toISOString(), location, teamId })
      .then(() => {
        setName('');
        setDate('');
        setLocation('');
        onSuccess?.();
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
            <div className="input-group">
              <input type="date" className="form-control" id="date" value={date} onChange={e => setDate(e.target.value)} />
              <button className="btn btn-outline-secondary" type="button" onClick={handleSetToday}>Today</button>
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="location" className="form-label">Location</label>
            <input type="text" className="form-control" id="location" value={location} onChange={e => setLocation(e.target.value)} />
          </div>
          {teams.length > 1 && (
            <div className="mb-3">
              <label htmlFor="teamId" className="form-label">Team</label>
              <select className="form-select" id="teamId" value={teamId} onChange={e => setTeamId(e.target.value)}>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
          )}
          <button type="submit" className="btn btn-primary">Add Trip</button>
        </form>
      </div>
    </div>
  );
}

export default AddTripForm;
