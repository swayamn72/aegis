import React from 'react';
import Navbar from '../components/Navbar';
import AegisOpportunities from '../components/AegisOpportunities';
import Footer from '../components/Footer';

function OpportunitiesPage() {
  return (
    <>
      <Navbar />
      <main>
        <AegisOpportunities />
      </main>
      <Footer />
    </>
  );
}

export default OpportunitiesPage;
