import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Team {
  id: string;
  name: string;
  memberships: { userId: string; role: string; isPrimary: boolean }[];
}

function TeamsPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [error, setError] = useState('');

  const fetchTeams = useCallback(() => {
    axios.get('/api/teams')
      .then(res => setTeams(res.data))
      .catch(() => setError('Failed to load teams'));
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    axios.post('/api/teams', { name: newTeamName })
      .then(() => {
        setNewTeamName('');
        fetchTeams();
      })
      .catch(() => setError('Failed to create team'));
  };

  const handleDelete = (teamId: string) => {
    if (!confirm('Delete this team? This cannot be undone.')) return;
    axios.delete(`/api/teams/${teamId}`)
      .then(() => fetchTeams())
      .catch(() => setError('Failed to delete team'));
  };

  const isOwner = (team: Team) =>
    team.memberships?.some(m => m.userId === user?.id && m.role === 'OWNER');

  return (
    <div>
      <h2>My Teams</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      {teams.length === 0 ? (
        <p className="text-muted">No teams yet. Create one below.</p>
      ) : (
        <ul className="list-group mb-4">
          {teams.map(team => (
            <li key={team.id} className="list-group-item d-flex justify-content-between align-items-center">
              <span>{team.name}</span>
              <div className="d-flex gap-2">
                <Link to={`/teams/${team.id}/roster`} className="btn btn-sm btn-outline-primary">
                  Manage Roster
                </Link>
                <Link to={`/teams/${team.id}/cars`} className="btn btn-sm btn-outline-secondary">
                  Cars
                </Link>
                {isOwner(team) && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(team.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Create New Team</h5>
          <form onSubmit={handleCreate} className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Team name"
              value={newTeamName}
              onChange={e => setNewTeamName(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Create</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TeamsPage;
