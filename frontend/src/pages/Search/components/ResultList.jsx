import ResultCard from './ResultCard';
import { SearchResultSkeleton } from '../../../components/skeleton/SearchResultSkeleton';
import { useSearchStore } from '../../../store/searchStore';

export default function ResultList({ viewType = 'all' }) {
  const { results, loading, error } = useSearchStore();

  if (error) {
    return (
      <div className="mt-6 p-8 rounded-2xl border border-red-500/20 bg-red-500/5 text-center">
        <p className="text-red-400 text-sm">Failed to load results</p>
        <p className="text-gray-500 text-xs mt-2">{error}</p>
      </div>
    );
  }

  if (loading) {
    return <SearchResultSkeleton />;
  }

  if (!results.length) {
    return (
      <div className="mt-6 p-8 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
        <p className="text-gray-400 text-sm">No results found</p>
        <p className="text-gray-600 text-xs mt-2">Try adjusting your search or filters</p>
      </div>
    );
  }

  if (viewType === 'image') {
    return (
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 mt-6">
        {results.map((item, index) => (
          <ResultCard key={item.id || index} {...item} viewType={viewType} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      {results.map((item, index) => (
        <ResultCard key={item.id || index} {...item} viewType={viewType} />
      ))}
    </div>
  );
}
