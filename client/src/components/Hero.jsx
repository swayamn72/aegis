// src/components/Hero.jsx

import React from 'react';
import stageImage from '../assets/esports_stage.png';

function Hero() {
  return (
    <div className='relative h-screen'>
      <img className='h-full w-full object-cover opacity-20' src={stageImage} alt="Esports Arena Background" />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">

        <h1 className="text-5xl font-extrabold uppercase tracking-wider md:text-7xl">
          ESPORTS ARENA IS CALLING
          <br />
          <span className="text-[#FF4500]">STEP IN AND RISE</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-300">
          The ultimate platform to showcase verified skills, find teams, and build a pro career.
        </p>

        <div className="mt-8 flex justify-center gap-20">
          <button id='blueButton' className='rounded-full p-5'>
            Create Profile
          </button>
          <button id='greenButton' className='rounded-full p-5'>
            Explore Aegis
          </button>

        </div>

      </div>
    </div>
  );
}

export default Hero;