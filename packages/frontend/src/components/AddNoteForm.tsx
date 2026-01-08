import { useState } from 'react';
import axios from 'axios';

interface AddNoteFormProps {
  tripId: string;
}

function AddNoteForm({ tripId }: AddNoteFormProps) {
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');

  const handleSetToday = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
    setDate(formattedDate);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    axios.post(`/api/${tripId}/notes`, { content, date })
      .then(() => {
        window.location.reload();
      })
      .catch(error => {
        console.error('Error adding note:', error);
      });
  };

  return (
    <div className="card mt-4">
      <div className="card-body">
        <h5 className="card-title">Add New Note</h5>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="content" className="form-label">Content</label>
            <textarea className="form-control" id="content" value={content} onChange={e => setContent(e.target.value)} />
          </div>
          <div className="mb-3">
            <label htmlFor="date" className="form-label">Date</label>
            <div className="input-group">
              <input type="date" className="form-control" id="date" value={date} onChange={e => setDate(e.target.value)} />
              <button className="btn btn-outline-secondary" type="button" onClick={handleSetToday}>Today</button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Add Note</button>
        </form>
      </div>
    </div>
  );
}

export default AddNoteForm;
