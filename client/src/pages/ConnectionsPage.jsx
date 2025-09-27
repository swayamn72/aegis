import React from 'react';
import Navbar from '../components/Navbar';
import Connections from '../components/Connections'
import Footer from '../components/Footer';

function ConnectionsPage() {
  return (
    <>
      <Navbar />
      <main>
        <Connections />
      </main>
      <Footer />
    </>
  );
}

export default ConnectionsPage;
