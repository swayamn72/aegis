import React from 'react';
import Navbar from '../components/Navbar';
import AegisScrims from '../components/AegisScrims';
import Footer from '../components/Footer';

function ScrimsPage() {
  return (
    <>
      <Navbar />
      <main>
        <AegisScrims />
      </main>
      <Footer />
    </>
  );
}

export default ScrimsPage;
