import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { ImageGridSkeleton } from '../../components/skeleton/ImageGridSkeleton';
import { useSearchStore } from '../../store/searchStore';
import { sanitizeText } from '../../utils/sanitize';

export default function Images() {
  const [searchParams] = useSearchParams();
  const { results, loading, error, performSearch, setFilters } = useSearchStore();

  const queryFromUrl = searchParams.get('q') || '';

  useEffect(() => {
    if (!queryFromUrl.trim()) {
      useSearchStore.getState().setResults([]);
      useSearchStore.getState().setTotalResults(0);
      return;
    }
    setFilters({ contentType: 'image' });
    performSearch({ query: queryFromUrl, page: 1 });
  }, [queryFromUrl, performSearch, setFilters]);

  return (
    <div className="bg-[#020617] min-h-screen text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-6">
        {loading && <ImageGridSkeleton />}
        {error && (
          <div className="mt-6 p-8 rounded-2xl border border-red-500/20 bg-red-500/5 text-center">
            <p className="text-red-400 text-sm">Failed to load images</p>
            <p className="text-gray-500 text-xs mt-2">{error}</p>
          </div>
        )}
        {!loading && queryFromUrl && (
          <p className="text-xs text-gray-500 mb-4">
            Images for <span className="text-cyan-400">"{queryFromUrl}"</span>
          </p>
        )}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {results.map((img, i) => (
            <div
              key={i}
              className="break-inside-avoid rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-cyan-400/20 transition group cursor-pointer"
              onClick={() => {
                if (img.url) {
                  window.open(img.url, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              {img.image ? (
                <img
                  src={img.image}
                  alt={sanitizeText(img.title || 'image')}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full bg-white/5 flex items-center justify-center py-12">
                  <span className="text-4xl text-gray-600">🖼️</span>
                </div>
              )}
              {img.title && (
                <div className="p-3">
                  <p className="text-xs text-gray-400 truncate">{sanitizeText(img.title)}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        {!loading && results.length === 0 && queryFromUrl && (
          <div className="mt-12 text-center">
            <p className="text-gray-400 text-sm">No images found</p>
            <p className="text-gray-600 text-xs mt-2">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
