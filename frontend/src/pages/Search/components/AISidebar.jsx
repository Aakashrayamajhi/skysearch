export default function AISidebar() {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">

      <h2 className="text-cyan-400 font-semibold text-lg">
        ✦ AI Insight
      </h2>

      <p className="text-sm text-gray-400 mt-3">
        Quantum computing is transforming aerospace engineering across materials,
        fluid dynamics, and mission optimization.
      </p>

      <ul className="mt-4 space-y-2 text-sm text-gray-300">
        <li>• Material Discovery</li>
        <li>• CFD Simulations</li>
        <li>• Trajectory Planning</li>
      </ul>

      <input
        placeholder="Ask follow-up..."
        className="mt-5 w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
      />

    </div>
  );
}