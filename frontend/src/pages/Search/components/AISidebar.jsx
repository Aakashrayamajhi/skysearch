import { useSearchStore } from '../../../store/searchStore';
import { sanitizeText } from '../../../utils/sanitize';

export default function AISidebar() {
  const { aiInsight, loading } = useSearchStore();

  const isLoading = loading && !aiInsight;

  return (
    <div className="w-full max-w-sm bg-[#0B0F19] border border-white/5 rounded-2xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-[15px] font-medium tracking-wide">AI Insight</h2>
        <span className="text-[11px] text-gray-500">Quantum Analysis</span>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-3 animate-pulse">
          <div className="w-full h-40 rounded-xl bg-white/10" />
          <div className="h-4 w-full bg-white/10 rounded" />
          <div className="h-4 w-3/4 bg-white/10 rounded" />
        </div>
      ) : aiInsight ? (
        <>
          {aiInsight.image && (
            <div className="mt-4 rounded-xl overflow-hidden border border-white/5">
              <img
                src={aiInsight.image}
                alt="AI insight"
                className="w-full h-40 object-cover"
              />
            </div>
          )}
          <p className="mt-4 text-sm text-gray-400 leading-relaxed">
            {sanitizeText(aiInsight.description || aiInsight.summary || '')}
          </p>
          {aiInsight.keyAreas && (
            <div className="mt-5 space-y-3">
              {aiInsight.keyAreas.map((area, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-500">{sanitizeText(area.label)}</span>
                  <span className="text-gray-300">{sanitizeText(area.value)}</span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="mt-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
          <p className="text-sm text-gray-500">No AI insight available for this query.</p>
        </div>
      )}

      <div className="h-px bg-white/5 my-5" />

      <input
        placeholder="Ask AI a follow-up..."
        className="w-full bg-[#05070D] border border-white/5 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-white/20 transition"
      />
    </div>
  );
}
