import React, { useState } from 'react';
import { ChevronRight, Mail, ExternalLink } from 'lucide-react';

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
    { name: 'Discord', icon: '💬', href: '#', color: 'hover:text-purple-400' },
    { name: 'Twitter', icon: '🐦', href: '#', color: 'hover:text-blue-400' },
    { name: 'YouTube', icon: '📺', href: '#', color: 'hover:text-red-400' },
    { name: 'Twitch', icon: '🎮', href: '#', color: 'hover:text-purple-500' },
    { name: 'Reddit', icon: '🔶', href: '#', color: 'hover:text-orange-400' }
  ];

  return (
    <footer className="relative bg-gradient-to-b from-zinc-950 to-black border-t border-zinc-800/50 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-1/4 w-32 h-32 border border-amber-500/20 rounded-full animate-pulse" />
        <div className="absolute bottom-20 right-1/3 w-24 h-24 border border-orange-500/15 rounded transform rotate-45 animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-br from-amber-500/10 to-red-500/10 rounded-lg transform -rotate-12" />
        
        {/* Circuit pattern overlay */}
        <svg className="absolute top-0 right-0 w-64 h-64 text-amber-500/5" viewBox="0 0 100 100">
          <defs>
            <pattern id="circuit" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M0 10 L20 10 M10 0 L10 20" stroke="currentColor" strokeWidth="0.5"/>
              <circle cx="10" cy="10" r="1" fill="currentColor"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#circuit)"/>
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                Aegis
              </h3>
            </div>
            
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
              The definitive platform for competitive esports. Build your career, prove your skill, and connect with top organizations through data-driven insights.
            </p>
            
            <div className="space-y-3">
              <p className="text-amber-400 font-semibold text-sm">Follow With Us:</p>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <button
                    key={social.name}
                    className={`
                      w-10 h-10 rounded-lg border border-zinc-700 bg-zinc-900/50 backdrop-blur-sm
                      flex items-center justify-center transition-all duration-300 group
                      hover:border-amber-500/50 hover:bg-amber-500/10 hover:transform hover:scale-110
                      ${social.color}
                    `}
                    onMouseEnter={() => setHoveredSocial(index)}
                    onMouseLeave={() => setHoveredSocial(null)}
                  >
                    <span className="text-lg group-hover:animate-bounce">{social.icon}</span>
                    {hoveredSocial === index && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-zinc-800 text-xs text-white rounded border border-amber-500/30">
                        {social.name}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div className="grid grid-cols-2 lg:grid-cols-4 lg:col-span-4 gap-8">
            
            {/* Platform Links */}
            <div className="space-y-4">
              <h4 className="text-amber-400 font-bold text-sm uppercase tracking-wide">Platform</h4>
              <ul className="space-y-3">
                {footerLinks.platform.map((link, index) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-zinc-400 text-sm hover:text-amber-400 transition-colors duration-200 flex items-center group"
                      onMouseEnter={() => setHoveredLink(`platform-${index}`)}
                      onMouseLeave={() => setHoveredLink(null)}
                    >
                      <ChevronRight className={`w-3 h-3 mr-1 transition-transform duration-200 ${hoveredLink === `platform-${index}` ? 'transform translate-x-1' : ''}`} />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Features Links */}
            <div className="space-y-4">
              <h4 className="text-amber-400 font-bold text-sm uppercase tracking-wide">Features</h4>
              <ul className="space-y-3">
                {footerLinks.features.map((link, index) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-zinc-400 text-sm hover:text-amber-400 transition-colors duration-200 flex items-center group"
                      onMouseEnter={() => setHoveredLink(`features-${index}`)}
                      onMouseLeave={() => setHoveredLink(null)}
                    >
                      <ChevronRight className={`w-3 h-3 mr-1 transition-transform duration-200 ${hoveredLink === `features-${index}` ? 'transform translate-x-1' : ''}`} />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div className="space-y-4">
              <h4 className="text-amber-400 font-bold text-sm uppercase tracking-wide">Support</h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link, index) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-zinc-400 text-sm hover:text-amber-400 transition-colors duration-200 flex items-center group"
                      onMouseEnter={() => setHoveredLink(`support-${index}`)}
                      onMouseLeave={() => setHoveredLink(null)}
                    >
                      <ChevronRight className={`w-3 h-3 mr-1 transition-transform duration-200 ${hoveredLink === `support-${index}` ? 'transform translate-x-1' : ''}`} />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="space-y-4">
              <h4 className="text-amber-400 font-bold text-sm uppercase tracking-wide">Newsletter</h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Subscribe to get the latest updates on tournaments, features, and esports insights.
              </p>
              
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:bg-zinc-900/70 transition-all duration-200"
                  />
                  <Mail className="absolute right-3 top-2.5 w-4 h-4 text-zinc-500" />
                </div>
                
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  Subscribe
                </button>
              </form>

              {/* App Store badges */}
              <div className="space-y-2">
                <p className="text-zinc-500 text-xs">Download Our App:</p>
                <div className="flex space-x-2">
                  <div className="px-3 py-1.5 bg-zinc-900/50 border border-zinc-700 rounded-md text-xs text-zinc-400 hover:border-amber-500/50 transition-colors cursor-pointer">
                    📱 iOS
                  </div>
                  <div className="px-3 py-1.5 bg-zinc-900/50 border border-zinc-700 rounded-md text-xs text-zinc-400 hover:border-amber-500/50 transition-colors cursor-pointer">
                    🤖 Android
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-zinc-800/50 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex flex-wrap items-center gap-6">
              <p className="text-zinc-500 text-sm">
                Copyright © 2025 <span className="text-amber-400 font-semibold">Aegis</span>. All Rights Reserved.
              </p>
              <div className="flex space-x-4">
                {footerLinks.legal.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-zinc-500 hover:text-amber-400 text-xs transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-zinc-500">
              <span>Powered by competitive data</span>
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterComponent;