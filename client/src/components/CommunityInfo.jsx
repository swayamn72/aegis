import React from "react";

export default function CommunityInfo() {
  return (
    <aside className="hidden lg:flex flex-col w-72 bg-[#120E0E] border-l border-zinc-800/50 p-6">
      <h2 className="text-xl font-bold mb-4">About</h2>
      <p className="text-gray-400 text-sm mb-4">
        This is a placeholder description for the community. It can include info about what the community is for.
      </p>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Members</h3>
        <p className="text-gray-300">12,345</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Top Contributors</h3>
        <ul className="space-y-1 text-gray-300 text-sm">
          <li>@player1</li>
          <li>@player2</li>
          <li>@player3</li>
        </ul>
      </div>
    </aside>
  );
}
