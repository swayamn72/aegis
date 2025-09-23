import React from "react";
import CommunitySidebar from "../components/CommunitySidebar";
import CommunityInfo from "../components/CommunityInfo";
import { useParams } from "react-router-dom";

export default function CommunityPage() {

const {communityId} = useParams();

  return (
    <div className="flex bg-black min-h-screen text-white">
      {/* Left Sidebar - Channels */}
      <CommunitySidebar />

      {/* Main Feed */}
      <main className="flex-1 max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Community Name</h1>
        
        {/* Placeholder for posts */}
        <div className="space-y-6">
          <div className="bg-zinc-900 rounded-xl p-4 shadow">
            <p className="text-gray-300">Post 1 (placeholder)</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 shadow">
            <p className="text-gray-300">Post 2 (placeholder)</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 shadow">
            <p className="text-gray-300">Post 3 (placeholder)</p>
          </div>
        </div>
      </main>

      {/* Right Sidebar - Community Info */}
      <CommunityInfo />
    </div>
  );
}
