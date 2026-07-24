export function SearchResultSkeleton() {
  return (
    <div className="space-y-6 mt-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-5 p-5 rounded-2xl border border-white/5 animate-pulse"
        >
          <div className="w-32 h-28 rounded-xl bg-white/10 flex-shrink-0" />
          <div className="flex flex-col flex-1 gap-3">
            <div className="h-3 w-48 bg-white/10 rounded" />
            <div className="h-5 w-full bg-white/10 rounded" />
            <div className="h-4 w-3/4 bg-white/10 rounded" />
            <div className="flex gap-3 mt-2">
              <div className="h-6 w-16 bg-white/10 rounded-md" />
              <div className="h-6 w-16 bg-white/10 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
