// src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TournamentsPage from './pages/TournamentsPage'; // 1. Import the new page

function App() {
  return (
    <div className="bg-slate-900 font-sans min-h-screen">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tournaments" element={<TournamentsPage />} /> {/* 2. Add the new route */}
      </Routes>
    </div>
  );
}

export default App;