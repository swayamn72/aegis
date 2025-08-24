import React from 'react';
import { Link } from 'react-router-dom';
import { Hourglass, ArrowLeft } from 'lucide-react';

// Reusing the cool mascot you designed for the login page
const ScrimsMascot = () => (
    <div className="relative mb-8">
      <div className="w-16 h-20 bg-gradient-to-b from-blue-400 via-purple-500 to-indigo-600 rounded-t-full rounded-b-lg border-2 border-blue-300 relative overflow-hidden shadow-lg shadow-blue-500/50">
        <div className="absolute inset-0">
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-cyan-300/30 rounded-full" />
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-200/40 rounded-full" />
        </div>
        <div className="absolute inset-1 bg-gradient-to-b from-blue-300/20 to-purple-400/20 rounded-t-full rounded-b-lg border border-cyan-400/30" />
        <div className="absolute top-6 left-3 w-2 h-2 bg-cyan-300 rounded-full animate-pulse shadow-lg shadow-cyan-400/80" />
        <div className="absolute top-6 right-3 w-2 h-2 bg-cyan-300 rounded-full animate-pulse shadow-lg shadow-cyan-400/80" />
        <div className="absolute top-9 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-cyan-200/90 rounded-full shadow-sm shadow-cyan-300/60" />
      </div>
      <div className="absolute top-6 -left-2 w-3 h-6 bg-gradient-to-b from-blue-300 to-purple-400 rounded-full transform rotate-45 shadow-md shadow-blue-400/50" />
      <div className="absolute top-8 -right-2 w-3 h-6 bg-gradient-to-b from-blue-300 to-purple-400 rounded-full transform -rotate-12 shadow-md shadow-blue-400/50" />
      <div className="absolute inset-0 bg-blue-400/40 rounded-t-full rounded-b-lg blur-md -z-10 animate-pulse" />
    </div>
);

const ScrimsPage = () => {
    return (
        <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white flex items-center justify-center text-center p-6">
            <div className="container max-w-2xl">
                
                <div className="flex justify-center">
                    <ScrimsMascot />
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
                    Coming Soon
                </h1>

                <p className="text-2xl font-bold text-zinc-200 mb-4">
                    The Ultimate Scrim Finder is Being Built
                </p>
                
                <p className="text-lg text-zinc-400 mb-8">
                    We're working hard to create the best platform for you to find quality practice partners, build your team's reputation, and climb the ranks. Stay tuned for updates!
                </p>

                <div className="flex justify-center items-center gap-4">
                    <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center gap-2">
                        <Hourglass className="w-5 h-5" />
                        Notify Me When It's Ready
                    </button>
                    <Link to="/" className="px-6 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:bg-zinc-700 flex items-center gap-2">
                        <ArrowLeft className="w-5 h-5" />
                        Go Back Home
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default ScrimsPage;