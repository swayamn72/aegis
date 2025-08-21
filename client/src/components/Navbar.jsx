import React from 'react';
import { Menu, X } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const navLinks = [
    { href: "#", text: "Players" },
    { href: "#", text: "Opportunities" },
    { href: "#", text: "Tournaments" },
    { href: "#", text: "Scrims" },
  ];

  const NavLink = ({ href, text }) => (
    <a href={href} className="relative text-gray-300 hover:text-white transition-colors duration-300 text-lg font-bold group">
      {text}
      <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 ease-out group-hover:w-full group-hover:left-0"></span>
    </a>
  );
  
  const MobileNavLink = ({ href, text }) => (
     <a href={href} className="block text-gray-300 hover:text-white transition-colors duration-300 text-xl font-bold py-3 text-center">
      {text}
    </a>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#120E0E] border-b border-zinc-800/50">
      <div className="container mx-auto flex items-center justify-between h-24 px-6">
        
        {/* Left Side: Logo */}
        <a href="#">
          {/* <div className="text-white text-3xl font-black tracking-wider">
            Aegis
          </div> */}
          <img src={logo} alt="Aegis Logo" className="h-35 mt-3 mr-15" />
        </a>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-12">
          {navLinks.map(link => <NavLink key={link.text} {...link} />)}
        </nav>

        {/* Right Side: Desktop Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button className="font-bold text-white text-lg px-6 py-2 rounded-lg border-2 border-[#FF4500] hover:bg-[#FF4500] transition-colors duration-300">
            Login
          </button>
          <button className="font-bold text-white text-lg px-6 py-2 rounded-lg bg-[#FF4500] hover:bg-orange-600 transition-colors duration-300">
            Sign Up
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#120E0E] absolute top-24 left-0 w-full border-t border-zinc-800/50">
          <nav className="flex flex-col items-center gap-4 py-6">
            {navLinks.map(link => <MobileNavLink key={link.text} {...link} />)}
            <div className="flex flex-col items-center gap-4 mt-4 w-full px-6">
              <button className="w-full font-bold text-white text-lg px-6 py-3 rounded-lg border-2 border-[#FF4500] hover:bg-[#FF4500] transition-colors duration-300">
                Login
              </button>
              <button className="w-full font-bold text-white text-lg px-6 py-3 rounded-lg bg-[#FF4500] hover:bg-orange-600 transition-colors duration-300">
                Sign Up
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
