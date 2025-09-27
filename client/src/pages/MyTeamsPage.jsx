import React from 'react';
import Navbar from '../components/Navbar';
import MyTeams from '../components/MyTeams';

const MyTeamsPage = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <MyTeams />
    </div>
  );
};

export default MyTeamsPage;
