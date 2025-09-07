import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Carousel from '../components/Carousel';
import Footer from '../components/Footer';
import DetailedPlayerProfile from '../components/DetailedPlayerProfile';
import DetailedMatchInfo from '../components/DetailedMatchInfo';
import DetailedOrgInfo from '../components/DetailedOrgInfo';
import AegisProfileCardBGMI from '../components/AegisProfileCardBGMI';


function HomePage() {
  return (
    <>
      <Navbar />
      <main className="">
        <Hero />
        <Features />
        <Carousel/>
      </main>
      <Footer />
      <AegisProfileCardBGMI/>l
      
    </>
  );
}

export default HomePage;