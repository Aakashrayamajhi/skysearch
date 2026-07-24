import { memo } from 'react';
import { sanitizeText } from '../../../utils/sanitize';

const ResultCard = memo(function ResultCard({
  title,
  description,
  url,
  image,
  source,
  tag,
  isLoading = false,
}) {
  if (isLoading) {
    return (
      <div className="flex gap-5 p-5 rounded-2xl border border-white/5 animate-pulse">
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
    );
  }

  const safeTitle = sanitizeText(title);
  const safeDescription = sanitizeText(description);
  const safeUrl = sanitizeText(url);

  return (
    <div className="group flex gap-5 hover:bg-white/[0.04] p-5 rounded-2xl transition-all duration-300 border border-transparent hover:border-white/10">
      {image && (
        <div className="w-32 h-28 rounded-xl overflow-hidden flex-shrink-0">
          <img
            src={image}
            alt={safeTitle}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </div>
      )}

      <div className="flex flex-col">
        <p className="text-xs text-gray-500 break-all">{safeUrl}</p>
        <h2 className="text-lg text-blue-400 group-hover:underline cursor-pointer mt-1 leading-snug">
          {safeTitle}
        </h2>
        <p className="text-sm text-gray-400 mt-2 leading-relaxed max-w-xl">
          {safeDescription}
        </p>
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
          {source && (
            <span className="bg-white/5 px-2 py-1 rounded-md">{sanitizeText(source)}</span>
          )}
          {tag && (
            <span className="bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded-md">
              {sanitizeText(tag)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

export default ResultCard;
