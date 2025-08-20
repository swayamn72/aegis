import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturePage from './components/FeaturePage';
import AegisProfileCard from './components/AegisProfileCard';
import { Features } from 'tailwindcss';
import Features1 from './components/features1'
import './index.css';
import FooterComponent from './components/Footer';

function App() {
  return (
    <div className=''>
      <Navbar />
      <Hero />
      <Features1 />
      <FooterComponent/>
    </div>
  );
}

export default App;
