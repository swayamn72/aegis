// src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TournamentsPage from './pages/TournamentsPage'; 
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import PlayersPage from './pages/PlayersPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import ScrimsPage from './pages/ScrimsPage';
import ProfilePlayer from './pages/ProfilePlayer';
import DetailedPlayerProfileDN from './pages/DetailedPlayerProfileDN';
import DetailedMatchInfoDN from './pages/DetailedMatchInfoDN';
import DetailedOrgInfoDN from './pages/DetailedOrgInfoDN';
function App() {
  return (
    <div className="bg-slate-900 font-sans min-h-screen">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tournaments" element={<TournamentsPage />} /> 
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path='/players' element={<PlayersPage />} />
        <Route path='/opportunities' element={<OpportunitiesPage />} />
        <Route path='/scrims' element={<ScrimsPage />} />
        <Route path='/profile' element={<ProfilePlayer/>} />
        <Route path='/detailed' element={<DetailedPlayerProfileDN/>} />
        <Route path='/match' element={<DetailedMatchInfoDN/>} />
        <Route path='/org' element={<DetailedOrgInfoDN/>} />
      </Routes>
    </div>
  );
}

export default App;