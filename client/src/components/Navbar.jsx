import React from 'react';
import logo from '../assets/logo.png';

function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#120E0E]">
      <div className="w-full mx-auto flex items-center justify-between h-[100px] px-6">
        
        {/* Left Side: Logo */}
        <a href="#">
          <img src={logo} alt="Aegis Logo" className="h-[150px] mt-[10px]" />
        </a>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-20">
          <a href="#" className="text-gray-300 hover:text-white text-xl font-bold transition-colors font-['Inter']">Players</a>
          <a href="#" className="text-gray-300 hover:text-white text-xl font-bold transition-colors font-['Inter']">Opportunities</a>
          <a href="#" className="text-gray-300 hover:text-white text-xl font-bold transition-colors font-['Inter']">Tournaments</a>
          <a href="#" className="text-gray-300 hover:text-white text-xl font-bold transition-colors font-['Inter']">Scrims</a>
        </nav>

        {/* Right Side: Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {/* Secondary Button (Login) */}
          <button className="font-['Judson'] font-bold text-white text-xl px-6 py-3 rounded-lg bg-[#FF4500] hover:bg-[#120E0E] transition-colors hover:cursor-pointer">
            Sign Up
          </button>
          {/* Primary Button (Sign Up) */}
          <button className="font-['Judson'] font-bold text-white text-xl px-6 py-3 rounded-lg border-2 border-[#FF4500] hover:bg-[#FF4500] transition-colors hover:cursor-pointer">
            Login
          </button>
        </div>

      </div>
    </header>
  );
}

export default Navbar;