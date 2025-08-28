import React from 'react';
import Navbar from '../components/Navbar';
import DetailedMatchInfo from '../components/DetailedMatchInfo';
import Footer from '../components/Footer';

function DetailedMatchInfoDN() {
  return (
    <>
      <Navbar />
      <main>
        <DetailedMatchInfo />
      </main>
      <Footer />
    </>
  );
}

export default DetailedMatchInfoDN;
