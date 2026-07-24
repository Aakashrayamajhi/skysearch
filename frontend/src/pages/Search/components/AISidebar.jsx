import { useSearchStore } from '../../../store/searchStore';
import { sanitizeText } from '../../../utils/sanitize';

export default function AISidebar() {
  const { aiInsight, loading, followUpQuestion, followUpResponse, followUpLoading, followUpError, setFollowUpQuestion, submitFollowUp } = useSearchStore();

  const isLoading = loading && !aiInsight;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!followUpQuestion.trim() || followUpLoading) return;
    submitFollowUp(followUpQuestion);
  };

  return (
    <div className="w-full max-w-sm bg-[#0B0F19] border border-white/5 rounded-2xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-[15px] font-medium tracking-wide">AI Insight</h2>
        <span className="text-[11px] text-gray-500">Summary</span>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-3 animate-pulse">
          <div className="w-full h-40 rounded-xl bg-white/10" />
          <div className="h-4 w-full bg-white/10 rounded" />
          <div className="h-4 w-3/4 bg-white/10 rounded" />
        </div>
      ) : aiInsight?.description ? (
        <div className="mt-4">
          <p className="text-sm text-gray-300 leading-relaxed">
            {sanitizeText(aiInsight.description)}
          </p>
        </div>
      ) : (
        <div className="mt-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
          <p className="text-sm text-gray-500">Search for something to get an AI-powered summary of the top results.</p>
        </div>
      )}

      {followUpLoading && (
        <div className="mt-4 space-y-3 animate-pulse">
          <div className="h-4 w-full bg-white/10 rounded" />
          <div className="h-4 w-3/4 bg-white/10 rounded" />
        </div>
      )}

      {!followUpLoading && followUpResponse && (
        <div className="mt-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
          <p className="text-sm text-gray-300 leading-relaxed">
            {sanitizeText(followUpResponse)}
          </p>
        </div>
      )}

      {!followUpLoading && followUpError && (
        <div className="mt-4 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
          <p className="text-sm text-red-400">
            {followUpError}
          </p>
        </div>
      )}

      <div className="h-px bg-white/5 my-5" />

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={followUpQuestion}
          onChange={(e) => setFollowUpQuestion(e.target.value)}
          placeholder="Ask AI a follow-up..."
          className="flex-1 bg-[#05070D] border border-white/5 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-white/20 transition min-w-0"
        />
        <button
          type="submit"
          disabled={followUpLoading || !followUpQuestion.trim()}
          className="bg-white text-black text-xs font-medium px-3 py-1.5 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0"
        >
          Send
        </button>
      </form>
    </div>
  );
}
