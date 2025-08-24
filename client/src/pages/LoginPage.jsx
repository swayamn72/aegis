import React from 'react';
import Navbar from '../components/Navbar';
import AegisLogin from '../components/AegisLogin';
import Footer from '../components/Footer';

function LoginPage() {
  return (
    <>
      <Navbar />
      <main>
        <AegisLogin />
      </main>
      <Footer />
    </>
  );
}

export default LoginPage;
