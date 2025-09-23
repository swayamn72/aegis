import React from "react";

export default function CommunitySidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#120E0E] border-r border-zinc-800/50 p-4">
      <h2 className="text-lg font-bold mb-4">Channels</h2>
      <ul className="space-y-2 text-gray-300">
        <li className="px-3 py-2 rounded-lg hover:bg-zinc-800 cursor-pointer">General</li>
        <li className="px-3 py-2 rounded-lg hover:bg-zinc-800 cursor-pointer">News</li>
        <li className="px-3 py-2 rounded-lg hover:bg-zinc-800 cursor-pointer">Memes</li>
        <li className="px-3 py-2 rounded-lg hover:bg-zinc-800 cursor-pointer">Tournaments</li>
      </ul>
    </aside>
  );
}
