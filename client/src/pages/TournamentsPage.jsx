// src/pages/TournamentsPage.jsx

import React from 'react';
import Navbar from '../components/Navbar';
import Tournaments from '../components/Tournaments'; // Import your existing component
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