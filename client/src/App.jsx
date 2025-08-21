import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AegisProfileCard from './components/AegisProfileCard';
import AegisProfileCard2 from './components/AegisProfileCard2';
import AegisProfileCard3 from './components/AegisProfileCard3';
import AegisProfileCard4 from './components/AegisProfileCard4';
import Carousel from './components/Carousel';
import { Features } from 'tailwindcss';
import Features1 from './components/Features1'
import './index.css';
import FooterComponent from './components/Footer';
import TournamentsPage from './components/Tournaments';

function App() {
  return (
    <div className=''>
      <Navbar />
      <Hero />
      <Features1 />
      <Carousel/>
      <FooterComponent/>
      
      <AegisProfileCard/>
      <AegisProfileCard2/>
      <AegisProfileCard3/>
      <AegisProfileCard4/>

      {/* <TournamentsPage/> */}
      
      
    </div>
  );
}

export default App;
