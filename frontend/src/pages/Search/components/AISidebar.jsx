import React from "react";

export default function AISidebar() {
  return (
    <div className="w-full max-w-sm bg-[#0B0F19] border border-white/5 rounded-2xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-white text-[15px] font-medium tracking-wide">
          AI Insight
        </h2>
        <span className="text-[11px] text-gray-500">
          Quantum Analysis
        </span>
      </div>

      {/* Image (Hero Insight) */}
      <div className="mt-4 rounded-xl overflow-hidden border border-white/5">
        <img
          src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb"
          alt="Quantum computing visualization"
          className="w-full h-40 object-cover"
        />
      </div>

      {/* Description */}
      <p className="mt-4 text-sm text-gray-400 leading-relaxed">
        Quantum computing introduces a fundamentally new model of computation,
        enabling exponential acceleration in aerospace simulations, optimization,
        and material discovery.
      </p>

      {/* Key Areas */}
      <div className="mt-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Material Modeling</span>
          <span className="text-gray-300">High Impact</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Fluid Dynamics</span>
          <span className="text-gray-300">Advanced</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Trajectory Optimization</span>
          <span className="text-gray-300">Critical</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5 my-5"></div>

      {/* Input */}
      <input
        placeholder="Ask AI a follow-up..."
        className="w-full bg-[#05070D] border border-white/5 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-white/20 transition"
      />

    </div>
  );
}