export default function ResultCard() {
  return (
    <div className="hover:bg-white/5 p-4 rounded-xl transition">

      <p className="text-xs text-gray-500">
        https://aerospace-tech.com
      </p>

      <h2 className="text-lg text-blue-400 hover:underline cursor-pointer mt-1">
        Next-Gen Quantum Algorithms for Aerospace Structural Analysis
      </h2>

      <p className="text-sm text-gray-400 mt-2 leading-relaxed">
        Exploring how quantum systems are revolutionizing simulations,
        fluid dynamics, and aerospace optimization...
      </p>

    </div>
  );
}