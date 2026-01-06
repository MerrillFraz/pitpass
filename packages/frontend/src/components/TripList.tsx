import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AddTripForm from './AddTripForm';

interface Trip {
  id: string;
  name: string;
  date: string;
  location: string;
}

function TripList() {
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    axios.get('/api/trips')
      .then(response => {
        const tripsData = response.data.data || response.data;
        setTrips(Array.isArray(tripsData) ? tripsData : []);
      })
      .catch(error => {
        console.error('Error fetching trips:', error);
      });
  }, []);

  return (
    <div>
      <h2>All Trips</h2>
      <ul className="list-group">
        {trips.map(trip => (
          <li key={trip.id} className="list-group-item">
            <Link to={`/trip/${trip.id}`}>{trip.name}</Link> - {new Date(trip.date).toLocaleDateString()} at {trip.location}
          </li>
        ))}
      </ul>
      <AddTripForm />
    </div>
  );
}

export default TripList;
