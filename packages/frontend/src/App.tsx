import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/LoginPage';
import TripList from './components/TripList';
import TripDetails from './components/TripDetails';
import TripReport from './components/TripReport';
import TeamsPage from './components/TeamsPage';
import TeamRoster from './components/TeamRoster';
import CarsPage from './components/CarsPage';
import CarMaintenancePage from './components/CarMaintenancePage';
import './App.css';

function NavBar() {
  const { user, logout } = useAuth();
  return (
    <nav className="mb-4 d-flex align-items-center">
      <ul className="flex space-x-4 mb-0 list-unstyled d-flex gap-3">
        <li>
          <Link to="/" className="text-blue-600 hover:underline">Home</Link>
        </li>
        <li>
          <Link to="/teams" className="text-blue-600 hover:underline">Teams</Link>
        </li>
        <li>
          <Link to="/reports" className="text-blue-600 hover:underline">Reports</Link>
        </li>
      </ul>
      {user && (
        <div className="ms-auto d-flex align-items-center gap-2">
          <span className="text-muted">{user.firstName} {user.lastName}</span>
          <button onClick={logout} className="btn btn-sm btn-outline-secondary">Logout</button>
        </div>
      )}
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="container mt-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Racing Expenses</h1>
          <NavBar />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><TripList /></ProtectedRoute>} />
            <Route path="/trip/:id" element={<ProtectedRoute><TripDetails /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><TripReport /></ProtectedRoute>} />
            <Route path="/teams" element={<ProtectedRoute><TeamsPage /></ProtectedRoute>} />
            <Route path="/teams/:teamId/roster" element={<ProtectedRoute><TeamRoster /></ProtectedRoute>} />
            <Route path="/teams/:teamId/cars" element={<ProtectedRoute><CarsPage /></ProtectedRoute>} />
            <Route path="/teams/:teamId/cars/:carId/maintenance" element={<ProtectedRoute><CarMaintenancePage /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
