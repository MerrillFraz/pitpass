import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TripList from './components/TripList';
import TripDetails from './components/TripDetails';
import './App.css';

function App() {
  return (
    <Router>
      <div className="container mt-4">
        <h1>Racing Expenses</h1>
        <Routes>
          <Route path="/" element={<TripList />} />
          <Route path="/trip/:id" element={<TripDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
