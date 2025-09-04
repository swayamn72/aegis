import React from 'react';
import Navbar from '../components/Navbar';
import AegisMyProfile from '../components/AegisMyProfile'
import Footer from '../components/Footer';

function MyProfilePage() {
  return (
    <>
      <Navbar />
      <main>
        <AegisMyProfile />
      </main>
      <Footer />
    </>
  );
}

export default MyProfilePage;
