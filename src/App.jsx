import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import CreateRoom from './components/CreateRoom';
import Room from './components/Room';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<CreateRoom />} />
          <Route path="/room/:roomID" element={<Room />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
