export function ImageGridSkeleton() {
  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="break-inside-avoid rounded-xl overflow-hidden bg-white/5 animate-pulse"
        >
          <div className="w-full bg-white/10" style={{ height: `${120 + (i % 4) * 40}px` }} />
        </div>
      ))}
    </div>
  );
}
