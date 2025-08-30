import React from 'react';
import Navbar from '../components/Navbar';
import DetailedPlayerProfile from '../components/DetailedPlayerProfile';
import Footer from '../components/Footer';

function DetailedPlayerProfileDN() {
  return (
    <>
      <Navbar />
      <main>
        <DetailedPlayerProfile />
      </main>
      <Footer />
    </>
  );
}

export default DetailedPlayerProfileDN;
