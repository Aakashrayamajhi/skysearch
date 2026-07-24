import { Settings, Moon, Mic, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Explore', path: '/search' },
    { label: 'Collections', path: '/search/images' },
  ];

  return (
    <div className="sticky top-0 z-50 flex justify-between items-center px-6 md:px-10 py-4 backdrop-blur-xl bg-black/40 border-b border-white/10">
      <div className="flex items-center gap-4">
        <h1
          className="text-xl font-bold tracking-widest text-white cursor-pointer"
          onClick={() => navigate('/')}
        >
          SKYSEARCH
        </h1>
      </div>

      <div className="hidden md:flex gap-6 text-sm text-gray-400">
        {navLinks.map((link) => (
          <span
            key={link.path}
            onClick={() => navigate(link.path)}
            className="hover:text-white cursor-pointer transition"
          >
            {link.label}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 text-gray-400">
        <button className="hidden sm:block hover:text-white transition">
          <Mic size={18} />
        </button>
        <button className="hidden sm:block hover:text-white transition">
          <Settings size={18} />
        </button>
        <button className="hidden sm:block hover:text-white transition">
          <Moon size={18} />
        </button>

        <button
          className="md:hidden hover:text-white transition"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="hidden md:flex w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 items-center justify-center text-black text-sm font-bold">
          A
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#020617]/95 backdrop-blur-xl border-b border-white/10 md:hidden">
          <div className="flex flex-col px-6 py-4 gap-4">
            {navLinks.map((link) => (
              <span
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setMobileMenuOpen(false);
                }}
                className="text-sm text-gray-400 hover:text-white cursor-pointer transition"
              >
                {link.label}
              </span>
            ))}
            <div className="flex items-center gap-4 pt-2 border-t border-white/10">
              <button className="hover:text-white transition">
                <Mic size={18} />
              </button>
              <button className="hover:text-white transition">
                <Settings size={18} />
              </button>
              <button className="hover:text-white transition">
                <Moon size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
