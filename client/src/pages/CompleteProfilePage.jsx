import React from 'react';
import Navbar from '../components/Navbar';
import AegisProfileCompletion from '../components/AegisProfileCompletion'
import Footer from '../components/Footer';

function CompleteProfilePage() {
  return (
    <>
      <Navbar />
      <main>
        <AegisProfileCompletion />
      </main>
      <Footer />
    </>
  );
}

export default CompleteProfilePage;
