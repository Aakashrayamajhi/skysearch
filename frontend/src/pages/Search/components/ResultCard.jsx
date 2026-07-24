import { memo } from 'react';
import { sanitizeText } from '../../../utils/sanitize';

function getFaviconUrl(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch {
    return null;
  }
}

function getPreviewImageUrl(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const hostname = new URL(url).hostname;
    return `https://image.thum.io/get/width/200/crop/100/allowJPG/https://${hostname}`;
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
  source,
}) {
  const safeTitle = sanitizeText(title);
  const safeDescription = sanitizeText(description);
  const safeUrl = sanitizeText(url);
  const displayTitle = safeTitle || extractHostname(url);
  const displaySource = source ? sanitizeText(source) : extractHostname(url);
  const faviconUrl = getFaviconUrl(url);
  const previewImage = getPreviewImageUrl(url);
  const cardUrl = typeof url === 'string' && url ? url : '#';

  const handleClick = () => {
    if (cardUrl !== '#') {
      window.open(cardUrl, '_blank', 'noopener,noreferrer');
    }
  };

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

      {previewImage && (
        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-white/5 hidden sm:block">
          <img
            src={previewImage}
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
