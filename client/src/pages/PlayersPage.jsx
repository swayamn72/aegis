import React from 'react';
import Navbar from '../components/Navbar';
import AegisPlayers from '../components/AegisPlayers';
import Footer from '../components/Footer';

function PlayersPage() {
  return (
    <>
      <Navbar />
      <main>
        <AegisPlayers />
      </main>
      <Footer />
    </>
  );
}

export default PlayersPage;
