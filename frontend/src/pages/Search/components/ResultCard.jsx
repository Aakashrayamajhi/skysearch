import { memo } from 'react';
import { sanitizeText } from '../../../utils/sanitize';

function getFaviconUrl(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return null;
  }
}

function extractHostname(url) {
  if (!url || typeof url !== 'string') return 'Web';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'Web';
  }
}

const ResultCard = memo(function ResultCard({
  title,
  description,
  url,
  image,
  source,
  viewType = 'all',
}) {
  const safeTitle = sanitizeText(title);
  const safeDescription = sanitizeText(description);
  const safeUrl = sanitizeText(url);
  const displayTitle = safeTitle || extractHostname(url);
  const displaySource = source ? sanitizeText(source) : extractHostname(url);
  const faviconUrl = getFaviconUrl(url);
  const cardUrl = typeof url === 'string' && url ? url : '#';
  const hasImage = typeof image === 'string' && image.trim() !== '';
  const imageSrc = hasImage ? image : faviconUrl;

  const handleClick = () => {
    if (cardUrl !== '#') {
      window.open(cardUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (viewType === 'image') {
    return (
      <div
        onClick={handleClick}
        className="break-inside-avoid rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-cyan-400/20 transition group cursor-pointer"
      >
        <div className="w-full aspect-square bg-white/5 flex items-center justify-center">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={safeTitle || 'image'}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                if (hasImage && e.target.src !== faviconUrl) {
                  e.target.src = faviconUrl || '';
                }
              }}
            />
          ) : (
            <span className="text-6xl text-gray-600">🌐</span>
          )}
        </div>
        {(safeTitle || safeUrl) && (
          <div className="p-3">
            {safeTitle && (
              <p className="text-xs text-gray-400 truncate font-medium">{safeTitle}</p>
            )}
            {safeUrl && safeUrl !== '#' && (
              <p className="text-xs text-gray-600 mt-1 truncate">{safeUrl}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  if (viewType === 'video') {
    return (
      <div
        onClick={handleClick}
        className="group flex gap-5 hover:bg-white/[0.04] p-5 rounded-2xl transition-all duration-300 border border-transparent hover:border-white/10 cursor-pointer"
      >
        <div className="relative w-40 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
          {hasImage ? (
            <img
              src={image}
              alt={safeTitle}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/5">
              <span className="text-3xl text-gray-600">▶️</span>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition">
            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
              <span className="text-black text-lg ml-1">▶</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {faviconUrl && (
              <img src={faviconUrl} alt="" className="w-4 h-4 object-contain" />
            )}
            <span className="text-xs text-gray-500 truncate">{displaySource}</span>
          </div>
          <h2 className="text-lg text-blue-400 group-hover:underline leading-snug line-clamp-1">
            {safeTitle || 'Video'}
          </h2>
          <p className="text-sm text-gray-400 mt-1 leading-relaxed line-clamp-2">
            {safeDescription || 'Click to watch video'}
          </p>
          {safeUrl && safeUrl !== '#' && (
            <p className="text-xs text-gray-600 mt-2 truncate">{safeUrl}</p>
          )}
        </div>
      </div>
    );
  }

  if (viewType === 'news') {
    return (
      <div
        onClick={handleClick}
        className="group flex gap-5 hover:bg-white/[0.04] p-5 rounded-2xl transition-all duration-300 border border-transparent hover:border-white/10 cursor-pointer"
      >
        <div className="flex flex-col items-center gap-2 pt-1">
          {faviconUrl && (
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 flex items-center justify-center">
              <img
                src={faviconUrl}
                alt=""
                className="w-6 h-6 object-contain"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          <span className="text-2xl">📰</span>
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-cyan-400 truncate">{displaySource}</span>
          </div>
          <h2 className="text-lg text-blue-400 group-hover:underline leading-snug line-clamp-1">
            {displayTitle}
          </h2>
          <p className="text-sm text-gray-400 mt-1 leading-relaxed line-clamp-2">
            {safeDescription}
          </p>
          {safeUrl && safeUrl !== '#' && (
            <p className="text-xs text-gray-600 mt-2 truncate">{safeUrl}</p>
          )}
        </div>

        {hasImage && (
          <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-white/5 hidden sm:block">
            <img
              src={image}
              alt=""
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
              loading="lazy"
              onError={(e) => {
                e.target.parentElement.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
    );
  }

  if (viewType === 'map') {
    return (
      <div
        onClick={handleClick}
        className="group flex gap-5 hover:bg-white/[0.04] p-5 rounded-2xl transition-all duration-300 border border-transparent hover:border-white/10 cursor-pointer"
      >
        <div className="flex flex-col items-center gap-2 pt-1">
          {faviconUrl && (
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 flex items-center justify-center">
              <img
                src={faviconUrl}
                alt=""
                className="w-5 h-5 object-contain"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          <span className="text-2xl">📍</span>
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500 truncate">{displaySource}</span>
          </div>
          <h2 className="text-lg text-blue-400 group-hover:underline leading-snug line-clamp-1">
            {displayTitle}
          </h2>
          <p className="text-sm text-gray-400 mt-1 leading-relaxed line-clamp-2">
            {safeDescription || 'Click to view map'}
          </p>
          {safeUrl && safeUrl !== '#' && (
            <p className="text-xs text-gray-600 mt-2 truncate">{safeUrl}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="group flex gap-5 hover:bg-white/[0.04] p-5 rounded-2xl transition-all duration-300 border border-transparent hover:border-white/10 cursor-pointer"
    >
      <div className="flex flex-col items-center gap-2 pt-1">
        {faviconUrl && (
          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 flex items-center justify-center">
            <img
              src={faviconUrl}
              alt=""
              className="w-5 h-5 object-contain"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-500 truncate">{displaySource}</span>
        </div>
        <h2 className="text-lg text-blue-400 group-hover:underline leading-snug line-clamp-1">
          {displayTitle}
        </h2>
        <p className="text-sm text-gray-400 mt-1 leading-relaxed line-clamp-2">
          {safeDescription}
        </p>
        {safeUrl && safeUrl !== '#' && (
          <p className="text-xs text-gray-600 mt-2 truncate">{safeUrl}</p>
        )}
      </div>

      {hasImage && (
        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-white/5 hidden sm:block">
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
            loading="lazy"
            onError={(e) => {
              e.target.parentElement.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
});

export default ResultCard;
