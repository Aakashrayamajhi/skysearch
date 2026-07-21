export default function HeroSearch() {
  return (
    <div className="flex flex-col items-center justify-center mt-24 px-4">
      
      <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        SKYSEARCH
      </h1>

      <p className="text-gray-400 mt-2">
        Atmospheric Precision Intelligence
      </p>

      {/* Search Box */}
      <div className="mt-10 w-full max-w-2xl">
        <div className="flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-lg">
          
          <input
            type="text"
            placeholder="Ask the sky anything..."
            className="bg-transparent flex-1 outline-none text-gray-200 placeholder-gray-500"
          />

          <button className="ml-4 px-4 py-1 rounded-full bg-cyan-500/20 text-cyan-300">
            AI ON
          </button>
        </div>
      </div>

      {/* Trending */}
      <div className="flex gap-3 mt-6 flex-wrap justify-center">
        {["Explain quantum physics", "Plan a Tokyo trip", "Latest AI trends 2024"].map((item, i) => (
          <span
            key={i}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 hover:bg-white/10 cursor-pointer"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}