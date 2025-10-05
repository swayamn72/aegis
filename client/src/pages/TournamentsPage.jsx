import React from 'react';
import Navbar from '../components/Navbar';
import Tournaments from '../components/Tournaments'; 
import Footer from '../components/Footer';

function TournamentsPage() {
  return (
    <>
      <Navbar />
      <main>
        <Tournaments />
      </main>
      <Footer />
    </>
  );
}

export default TournamentsPage;