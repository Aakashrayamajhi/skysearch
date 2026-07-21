export default function Navbar() {
  return (
    <div className="sticky top-0 z-50 flex justify-between items-center px-10 py-4 backdrop-blur-md bg-white/5 border-b border-white/10">
      <h1 className="text-xl font-bold tracking-widest">SKYSEARCH</h1>

      <div className="flex gap-6 text-sm text-gray-300">
        <span className="hover:text-white cursor-pointer">Home</span>
        <span className="hover:text-white cursor-pointer">Explore</span>
        <span className="hover:text-white cursor-pointer">Collections</span>
      </div>

      <div className="flex gap-4">
        <span>⚙️</span>
        <span>🌙</span>
        <span>👤</span>
      </div>
    </div>
  );
}