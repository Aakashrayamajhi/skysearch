export default function CardsSection() {
  return (
    <div className="mt-20 px-10 grid grid-cols-1 md:grid-cols-3 gap-6">

      {/* LEFT BIG CARD (IMAGE) */}
      <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
        
        <img
          src="https://cdn.discovermagazine.com/assets/image/57457/darker-earth-x.jpg"
          alt="earth"
          className="w-full h-64 object-cover opacity-80"
        />

        <div className="p-6">
          <p className="text-cyan-400 text-sm mb-2">PRECISION IMAGERY</p>

          <h2 className="text-2xl font-semibold">
            Atmospheric World View
          </h2>

          <p className="text-gray-400 mt-2 text-sm">
            Access ultra-high resolution satellite data integrated with real-time AI atmospheric modeling for unmatched clarity.
          </p>
        </div>
      </div>

      {/* RIGHT SMALL CARD */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col justify-center">
        
        <div className="mb-4 text-cyan-400 text-xl">✨</div>

        <h2 className="text-xl font-semibold">
          Neural Answer
        </h2>

        <p className="text-gray-400 mt-2 text-sm">
          Instant synthesis of the world's knowledge powered by advanced LLM intelligence.
        </p>
      </div>

      {/* BOTTOM FULL WIDTH CARD */}
      <div className="md:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex justify-between items-center">
        
        <div>
          <h2 className="text-lg font-semibold">Interactive Maps</h2>
          <p className="text-gray-400 text-sm">
            Dynamic vector mapping with atmospheric overlays.
          </p>
        </div>

        <button className="px-6 py-2 bg-cyan-500/20 text-cyan-300 rounded-full">
          TRY NOW
        </button>
      </div>

    </div>
  );
}