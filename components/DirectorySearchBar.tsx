"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function DirectorySearchBar() {
  const [q, setQ] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed.length < 2) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 bg-white/10 backdrop-blur rounded-xl p-2 max-w-lg">
      <div className="flex-1 flex items-center gap-2 bg-white rounded-lg px-3">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search brands, categories..."
          className="w-full py-2.5 text-gray-900 text-sm outline-none"
        />
      </div>
      <button type="submit" className="btn-primary py-2 px-4 rounded-lg text-sm shrink-0">
        Search
      </button>
    </form>
  );
}
