// src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
import CompleteProfilePage from './pages/CompleteProfilePage';
import MyProfilePage from './pages/MyProfilePage';
import SettingsPage from './pages/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
function App() {
  return (
    <AuthProvider>
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
          <Route path='/complete-profile' element={<ProtectedRoute><CompleteProfilePage/></ProtectedRoute>} />
          <Route path='/my-profile' element={<ProtectedRoute><MyProfilePage/></ProtectedRoute>} />
          <Route path='/settings' element={<ProtectedRoute><SettingsPage/></ProtectedRoute>} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
