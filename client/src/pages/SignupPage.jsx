import React from 'react';
import Navbar from '../components/Navbar';
import AegisSignup from '../components/AegisSignup';
import Footer from '../components/Footer';

function SignupPage() {
  return (
    <>
      <Navbar />
      <main>
        <AegisSignup />
      </main>
      <Footer />
    </>
  );
}

export default SignupPage;
