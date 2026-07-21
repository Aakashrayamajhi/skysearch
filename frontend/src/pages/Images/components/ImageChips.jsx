export default function ImageChips() {
  const chips = [
    "Nature",
    "Nature pictures",
    "High resolution",
    "Nature photos",
    "Background",
    "White",
    "Unsplash",
  ];

  return (
    <div className="flex gap-3 overflow-x-auto py-4 scrollbar-hide">
      {chips.map((chip, i) => (
        <div
          key={i}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full cursor-pointer hover:bg-white/10 transition"
        >
          <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-400 to-blue-500" />
          <span className="text-sm text-gray-300 whitespace-nowrap">
            {chip}
          </span>
        </div>
      ))}
    </div>
  );
}