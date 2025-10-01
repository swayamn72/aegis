import React from "react";

export default function CommunityInfo({ community }) {
  return (
    <aside className="hidden lg:flex flex-col w-72 bg-[#120E0E] border-l border-zinc-800/50 p-6">
      <h2 className="text-xl font-bold mb-4">About</h2>
      <p className="text-gray-400 text-sm mb-4">
        {community?.description || "No description available."}
      </p>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Members</h3>
        <p className="text-gray-300">{community?.membersCount || 0}</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Created</h3>
        <p className="text-gray-300 text-sm">
          {community?.createdAt ? new Date(community.createdAt).toLocaleDateString() : "Unknown"}
        </p>
      </div>
    </aside>
  );
}
