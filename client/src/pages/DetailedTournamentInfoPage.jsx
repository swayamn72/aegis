import React from 'react';
import Navbar from '../components/Navbar';
import DetailedTournamentInfo2 from '../components/DetailedTournamentInfo2';
import Footer from '../components/Footer';

function DetailedTournamentInfoPage() {
  return (
    <>
      <Navbar />
      <main>
        <DetailedTournamentInfo2 />
      </main>
      <Footer />
    </>
  );
}

export default DetailedTournamentInfoPage;
