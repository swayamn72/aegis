import React from 'react';
import Navbar from '../components/Navbar';
import DetailedOrgInfo from '../components/DetailedOrgInfo';
import Footer from '../components/Footer';

function DetailedOrgInfoDN() {
  return (
    <>
      <Navbar />
      <main>
        <DetailedOrgInfo />
      </main>
      <Footer />
    </>
  );
}

export default DetailedOrgInfoDN;
