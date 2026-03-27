import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = ['OWNER', 'DRIVER', 'PIT_BOSS', 'CREW', 'GUEST'] as const;
type Role = typeof ROLES[number];

interface MemberUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Membership {
  id: string;
  role: Role;
  isPrimary: boolean;
  user: MemberUser;
}

function TeamRoster() {
  const { teamId } = useParams<{ teamId: string }>();
  const { user } = useAuth();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [error, setError] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('CREW');

  const fetchRoster = useCallback(() => {
    axios.get(`/api/teams/${teamId}/members`)
      .then(res => setMemberships(res.data))
      .catch(() => setError('Failed to load roster'));
  }, [teamId]);

  useEffect(() => {
    fetchRoster();
  }, [fetchRoster]);

  const currentUserMembership = memberships.find(m => m.user.id === user?.id);
  const isOwner = currentUserMembership?.role === 'OWNER';

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    axios.post(`/api/teams/${teamId}/members`, { email: newEmail, role: newRole })
      .then(() => {
        setNewEmail('');
        setNewRole('CREW');
        fetchRoster();
      })
      .catch(err => {
        const msg = err.response?.data?.message || 'Failed to add member';
        setError(msg);
      });
  };

  const handleRoleChange = (membershipId: string, role: Role) => {
    axios.put(`/api/teams/${teamId}/members/${membershipId}`, { role })
      .then(() => fetchRoster())
      .catch(err => {
        const msg = err.response?.data?.message || 'Failed to update role';
        setError(msg);
      });
  };

  const handleRemove = (membershipId: string) => {
    if (!confirm('Remove this member from the team?')) return;
    axios.delete(`/api/teams/${teamId}/members/${membershipId}`)
      .then(() => fetchRoster())
      .catch(err => {
        const msg = err.response?.data?.message || 'Failed to remove member';
        setError(msg);
      });
  };

  const isPrimaryOwner = (m: Membership) => m.isPrimary && m.role === 'OWNER';

  return (
    <div>
      <Link to="/teams" className="btn btn-link ps-0 mb-2">← Back to Teams</Link>
      <h2>Team Roster</h2>
      {error && <div className="alert alert-danger alert-dismissible">
        {error}
        <button type="button" className="btn-close" onClick={() => setError('')} />
      </div>}

      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            {isOwner && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {memberships.map(m => (
            <tr key={m.id}>
              <td>{m.user.firstName} {m.user.lastName}</td>
              <td>{m.user.email}</td>
              <td>
                {isOwner && !isPrimaryOwner(m) ? (
                  <select
                    className="form-select form-select-sm"
                    value={m.role}
                    onChange={e => handleRoleChange(m.id, e.target.value as Role)}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                ) : (
                  <span className="badge bg-secondary">{m.role}</span>
                )}
              </td>
              {isOwner && (
                <td>
                  {!isPrimaryOwner(m) && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleRemove(m.id)}
                    >
                      Remove
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {isOwner && (
        <div className="card mt-3">
          <div className="card-body">
            <h5 className="card-title">Add Member</h5>
            <form onSubmit={handleAddMember} className="row g-2 align-items-end">
              <div className="col-md-5">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as Role)}
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <button type="submit" className="btn btn-primary w-100">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamRoster;
