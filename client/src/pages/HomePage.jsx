import React from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Carousel from '../components/Carousel';
import Footer from '../components/Footer';
import LoggedInHomepage from '../components/LoggedInHomepage';

function HomePage() {
  const { isAuthenticated } = useAuth();
  
  return (
    <>
      <Navbar />
      {isAuthenticated ? (
        <LoggedInHomepage />
      ) : (
        <>
          <main className="">
            <Hero />
            <Features />
            <Carousel />
          </main>
          <Footer />
        </>
      )}
    </>
  );
}

export default HomePage;