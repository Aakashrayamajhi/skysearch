import { memo } from 'react';
import { sanitizeText } from '../../../utils/sanitize';

const ResultCard = memo(function ResultCard({
  title,
  description,
  url,
  image,
  source,
  score,
}) {
  const safeTitle = sanitizeText(title);
  const safeDescription = sanitizeText(description);
  const safeUrl = sanitizeText(url);
  const displaySource = sanitizeText(source);

  return (
    <div className="group flex gap-5 hover:bg-white/[0.04] p-5 rounded-2xl transition-all duration-300 border border-transparent hover:border-white/10">
      {image ? (
        <div className="w-32 h-28 rounded-xl overflow-hidden flex-shrink-0">
          <img
            src={image}
            alt={safeTitle}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </div>
      ) : (
        <div className="w-32 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-white/5 flex items-center justify-center">
          <span className="text-2xl text-gray-600">🌐</span>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0">
        <p className="text-xs text-gray-500 truncate">{safeUrl}</p>
        <h2 className="text-lg text-blue-400 group-hover:underline cursor-pointer mt-1 leading-snug line-clamp-1">
          {safeTitle}
        </h2>
        <p className="text-sm text-gray-400 mt-2 leading-relaxed line-clamp-2">
          {safeDescription}
        </p>
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
          {displaySource && (
            <span className="bg-white/5 px-2 py-1 rounded-md truncate max-w-[120px]">
              {displaySource}
            </span>
          )}
          {typeof score === 'number' && (
            <span className="bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded-md">
              {score.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

export default ResultCard;
