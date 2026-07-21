import { Settings, Moon, User, Mic } from "lucide-react";

export default function Navbar() {
  return (
    <div className="sticky top-0 z-50 flex justify-between items-center px-10 py-4 
    backdrop-blur-xl bg-black/40 border-b border-white/10">

      {/* LOGO */}
      <h1 className="text-xl font-bold tracking-widest text-white">
        SKYSEARCH
      </h1>

      {/* NAV LINKS */}
      <div className="flex gap-6 text-sm text-gray-400">
        <span className="hover:text-white cursor-pointer">Home</span>
        <span className="hover:text-white cursor-pointer">Explore</span>
        <span className="hover:text-white cursor-pointer">Collections</span>
      </div>

      {/* ICONS */}
      <div className="flex items-center gap-4 text-gray-400">

        <button className="hover:text-white transition">
          <Mic size={18} />
        </button>

        <button className="hover:text-white transition">
          <Settings size={18} />
        </button>

        <button className="hover:text-white transition">
          <Moon size={18} />
        </button>

        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-black text-sm font-bold">
          A
        </div>

      </div>
    </div>
  );
}