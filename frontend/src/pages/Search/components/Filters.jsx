export default function Filters() {
  const tabs = ["ALL", "IMAGES", "VIDEOS", "NEWS", "MAPS"];

  return (
    <div className="flex gap-6 mt-4 border-b border-white/10 pb-2">
      {tabs.map((t, i) => (
        <span
          key={i}
          className={`cursor-pointer text-sm ${
            i === 0 ? "text-cyan-400" : "text-gray-400"
          }`}
        >
          {t}
        </span>
      ))}
    </div>
  );
}