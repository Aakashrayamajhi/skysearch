import { Search, Mic, Camera } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function SearchBar() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [query, setQuery] = useState(params.get("q") || "");

  const handleSearch = () => {
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="w-full max-w-3xl">

      <div className="flex items-center bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2 shadow-xl hover:border-cyan-400/30 transition">

        {/* Icon */}
        <Search className="text-gray-400 w-4 h-4" />

        {/* Input */}
        <input
          type="text"
          value={query}
          placeholder="Search aerospace, quantum, AI..."
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="bg-transparent flex-1 px-3 outline-none text-sm text-gray-200 placeholder-gray-500"
        />

        {/* Actions */}
        <Mic className="w-4 h-4 text-gray-400 hover:text-cyan-400 cursor-pointer transition" />
        <Camera className="w-4 h-4 text-gray-400 hover:text-cyan-400 cursor-pointer ml-2 transition" />

        {/* Button */}
        <button
          onClick={handleSearch}
          className="ml-3 px-3 py-1 text-xs rounded-full bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/40 transition"
        >
          Search
        </button>

      </div>
    </div>
  );
}