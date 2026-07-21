export default function ResultCard({
  title,
  description,
  url,
  image,
  source,
  tag,
}) {
  return (
    <div className="group flex gap-5 hover:bg-white/[0.04] p-5 rounded-2xl transition-all duration-300 border border-transparent hover:border-white/10">

      {/* Thumbnail */}
      <div className="w-32 h-28 rounded-xl overflow-hidden flex-shrink-0">
        <img
          src={image}
          alt="preview"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col">

        {/* URL */}
        <p className="text-xs text-gray-500">
          {url}
        </p>

        {/* Title */}
        <h2 className="text-lg text-blue-400 group-hover:underline cursor-pointer mt-1 leading-snug">
          {title}
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-400 mt-2 leading-relaxed max-w-xl">
          {description}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">

          <span className="bg-white/5 px-2 py-1 rounded-md">
            {source}
          </span>

          <span className="bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded-md">
            {tag}
          </span>

        </div>

      </div>
    </div>
  );
}