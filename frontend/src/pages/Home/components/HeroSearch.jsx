import { Mic, Camera, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function HeroSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (!query.trim()) return;
    navigate("/search"); // static for now
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="flex flex-col items-center justify-center mt-24 px-4">
      
      {/* Logo */}
      <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        SKYSEARCH
      </h1>

      <p className="text-gray-500 mt-2">
        Atmospheric Precision Intelligence
      </p>

      {/* Search Box */}
      <div className="mt-10 w-full max-w-2xl">
        <div className="flex items-center bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-2xl hover:border-cyan-400/30 transition">

          <Search className="text-gray-400 w-5 h-5" />

          <input
            type="text"
            placeholder="Search anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent flex-1 px-4 outline-none text-gray-200 placeholder-gray-500"
          />

          {/* Mic */}
          <Mic className="w-5 h-5 text-gray-400 cursor-pointer hover:text-cyan-400 transition" />

          {/* Camera */}
          <Camera className="w-5 h-5 text-gray-400 cursor-pointer ml-3 hover:text-cyan-400 transition" />

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="ml-4 p-2 rounded-full bg-cyan-500/20 hover:bg-cyan-500/40 transition"
          >
            <Search className="w-4 h-4 text-cyan-300" />
          </button>
        </div>
      </div>

      {/* Trending */}
      <div className="flex gap-3 mt-6 flex-wrap justify-center">
        {[
          "Explain quantum physics",
          "Plan a Tokyo trip",
          "Latest AI trends 2024",
        ].map((item, i) => (
          <span
            key={i}
            onClick={() => navigate("/search")}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 hover:bg-white/10 cursor-pointer"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}