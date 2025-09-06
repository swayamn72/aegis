import React from 'react';
import Navbar from '../components/Navbar';
import SettingsComponent from '../components/SettingsComponent';
import Footer from '../components/Footer';

function SettingsPage() {
  return (
    <>
      <Navbar />
      <main>
        <SettingsComponent />
      </main>
      <Footer />
    </>
  );
}

export default SettingsPage;
