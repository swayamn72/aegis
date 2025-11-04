import React from 'react';
import Navbar from '../components/Navbar';
import DetailedTeamInfo from '../components/DetailedTeamInfo';

const TeamDetailsPage = () => {
    return (
        <div className="min-h-screen bg-slate-900">
            <Navbar />
            <DetailedTeamInfo />
        </div>
    );
};

export default TeamDetailsPage;
