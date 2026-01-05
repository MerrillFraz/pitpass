import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import TripList from './components/TripList';
import TripDetails from './components/TripDetails';
import TripReport from './components/TripReport';
import './App.css';

function App() {
  return (
    <Router>
      <div className="container mt-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Racing Expenses</h1>
        <nav className="mb-4">
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="text-blue-600 hover:underline">Home</Link>
            </li>
            <li>
              <Link to="/reports" className="text-blue-600 hover:underline">Reports</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<TripList />} />
          <Route path="/trip/:id" element={<TripDetails />} />
          <Route path="/reports" element={<TripReport />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
