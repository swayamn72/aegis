import React, { useState } from 'react';
import { ChevronRight, Mail, ExternalLink, Zap } from 'lucide-react';

const FooterComponent = () => {
  const [email, setEmail] = useState('');
  const [hoveredSocial, setHoveredSocial] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Subscribing email:', email);
    setEmail('');
  };

  const footerLinks = {
    platform: [
      { name: 'Players', href: '#' },
      { name: 'Organizations', href: '#' },
      { name: 'Tournaments', href: '#' },
      { name: 'Leaderboards', href: '#' },
      { name: 'Analytics', href: '#' }
    ],
    features: [
      { name: 'Verified Profiles', href: '#' },
      { name: 'Aegis Rating', href: '#' },
      { name: 'Recruitment Hub', href: '#' },
      { name: 'Scrim Finder', href: '#' },
      { name: 'Tournament Tracker', href: '#' }
    ],
    support: [
      { name: 'Help Center', href: '#' },
      { name: 'Contact Us', href: '#' },
      { name: 'API Documentation', href: '#' },
      { name: 'Status Page', href: '#' },
      { name: 'Bug Reports', href: '#' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'DMCA', href: '#' }
    ]
  };

  const socialLinks = [
    { name: 'Discord', icon: '💬', href: '#', color: 'hover:border-purple-500/50 hover:text-purple-400' },
    { name: 'Twitter', icon: '🐦', href: '#', color: 'hover:border-cyan-500/50 hover:text-cyan-400' },
    { name: 'YouTube', icon: '📺', href: '#', color: 'hover:border-red-500/50 hover:text-red-400' },
    { name: 'Twitch', icon: '🎮', href: '#', color: 'hover:border-purple-500/50 hover:text-purple-400' },
    { name: 'Reddit', icon: '🔶', href: '#', color: 'hover:border-[#FF4500]/50 hover:text-[#FF4500]' }
  ];

  return (
    <footer className="relative bg-black border-t border-zinc-900 overflow-hidden">
      {/* Grid Pattern Background - matching homepage */}
      <div className="absolute inset-0 z-0 opacity-[0.08]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="footer-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#27272a" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-grid)" />
        </svg>
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none"></div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF4500] to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h3 className="text-2xl font-black text-white">
                Aegis
              </h3>
            </div>
            
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              The definitive platform for competitive esports. Build your career, prove your skill, and connect with top organizations through data-driven insights.
            </p>
            
            <div className="space-y-3">
              <p className="text-zinc-600 text-xs uppercase tracking-[0.2em] font-medium">CONNECT WITH US</p>
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => (
                  <button
                    key={social.name}
                    className={`
                      w-10 h-10 rounded-md border border-zinc-900 bg-zinc-950
                      flex items-center justify-center transition-all duration-300 group
                      ${social.color}
                    `}
                    onMouseEnter={() => setHoveredSocial(index)}
                    onMouseLeave={() => setHoveredSocial(null)}
                    aria-label={social.name}
                  >
                    <span className="text-lg text-zinc-600 group-hover:scale-110 transition-transform">{social.icon}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div className="grid grid-cols-2 lg:grid-cols-4 lg:col-span-4 gap-8">
            
            {/* Platform Links */}
            <div className="space-y-4">
              <h4 className="text-zinc-600 font-bold text-xs uppercase tracking-[0.2em]">Platform</h4>
              <ul className="space-y-2">
                {footerLinks.platform.map((link, index) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-zinc-500 text-sm hover:text-[#FF4500] transition-colors duration-200 flex items-center group"
                      onMouseEnter={() => setHoveredLink(`platform-${index}`)}
                      onMouseLeave={() => setHoveredLink(null)}
                    >
                      <ChevronRight className={`w-3 h-3 mr-1 text-zinc-800 group-hover:text-[#FF4500] transition-all duration-200 ${hoveredLink === `platform-${index}` ? 'transform translate-x-1' : ''}`} />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Features Links */}
            <div className="space-y-4">
              <h4 className="text-zinc-600 font-bold text-xs uppercase tracking-[0.2em]">Features</h4>
              <ul className="space-y-2">
                {footerLinks.features.map((link, index) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-zinc-500 text-sm hover:text-[#FF4500] transition-colors duration-200 flex items-center group"
                      onMouseEnter={() => setHoveredLink(`features-${index}`)}
                      onMouseLeave={() => setHoveredLink(null)}
                    >
                      <ChevronRight className={`w-3 h-3 mr-1 text-zinc-800 group-hover:text-[#FF4500] transition-all duration-200 ${hoveredLink === `features-${index}` ? 'transform translate-x-1' : ''}`} />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div className="space-y-4">
              <h4 className="text-zinc-600 font-bold text-xs uppercase tracking-[0.2em]">Support</h4>
              <ul className="space-y-2">
                {footerLinks.support.map((link, index) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-zinc-500 text-sm hover:text-[#FF4500] transition-colors duration-200 flex items-center group"
                      onMouseEnter={() => setHoveredLink(`support-${index}`)}
                      onMouseLeave={() => setHoveredLink(null)}
                    >
                      <ChevronRight className={`w-3 h-3 mr-1 text-zinc-800 group-hover:text-[#FF4500] transition-all duration-200 ${hoveredLink === `support-${index}` ? 'transform translate-x-1' : ''}`} />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="space-y-4">
              <h4 className="text-zinc-600 font-bold text-xs uppercase tracking-[0.2em]">Newsletter</h4>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Subscribe to get the latest updates on tournaments, features, and esports insights.
              </p>
              
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-900 rounded-md text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#FF4500]/50 transition-all duration-200"
                  />
                  <Mail className="absolute right-3 top-3 w-4 h-4 text-zinc-600" />
                </div>
                
                <button
                  type="submit"
                  className="w-full px-4 py-2.5 bg-[#FF4500] hover:bg-[#FF4500]/90 text-white text-sm font-semibold rounded-md transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  SUBSCRIBE
                </button>
              </form>

              {/* App Store badges */}
              <div className="space-y-2">
                <p className="text-zinc-600 text-xs uppercase tracking-[0.2em] font-medium">Download App</p>
                <div className="flex space-x-2">
                  <button className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-md text-xs text-zinc-500 hover:border-zinc-800 hover:text-zinc-400 transition-colors">
                    📱 iOS
                  </button>
                  <button className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-md text-xs text-zinc-500 hover:border-zinc-800 hover:text-zinc-400 transition-colors">
                    🤖 Android
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-zinc-900 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <p className="text-zinc-600 text-sm">
                Copyright © 2025 <span className="text-[#FF4500] font-semibold">Aegis</span>. All Rights Reserved.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {footerLinks.legal.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-zinc-600 hover:text-[#FF4500] text-xs transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-zinc-600 font-mono">
              <span className="uppercase tracking-wider">POWERED BY COMPETITIVE DATA</span>
              <div className="w-2 h-2 bg-[#FF4500] rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterComponent;