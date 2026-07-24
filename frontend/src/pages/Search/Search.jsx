import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Filters from './components/Filters';
import ResultList from './components/ResultList';
import AISidebar from './components/AISidebar';
import SearchBar from './components/SearchBar';
import Pagination from './components/Pagination';
import { useSearchStore } from '../../store/searchStore';

export default function Search() {
  const [searchParams] = useSearchParams();
  const {
    page,
    totalPages,
    setPage,
    performSearch,
    loading,
    totalResults,
    query: storeQuery,
    setFilters,
  } = useSearchStore();

  const queryFromUrl = searchParams.get('q') || '';
  const typeFromUrl = searchParams.get('type') || '';
  const [inputValue, setInputValue] = useState(queryFromUrl);

  const trimmedUrlQuery = useMemo(() => queryFromUrl.trim(), [queryFromUrl]);

  useEffect(() => {
    if (!trimmedUrlQuery) return;

    // Sync search bar with URL query when navigating to search results
    // This is intentional state synchronization between URL and input
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputValue(trimmedUrlQuery);

    if (typeFromUrl) {
      setFilters({ contentType: typeFromUrl });
    } else {
      setFilters({});
    }

    performSearch({ query: trimmedUrlQuery, page: 1 });
  }, [trimmedUrlQuery, typeFromUrl, setInputValue, setFilters, performSearch]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    performSearch({ query: trimmedUrlQuery || storeQuery, page: newPage });
  };

  return (
    <div className="bg-[#020617] min-h-screen text-white">
      <Navbar />

      <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#020617]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <SearchBar value={inputValue} onChange={setInputValue} />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pb-3">
          <div className="flex items-center justify-between">
            <Filters />
            <div className="hidden md:flex items-center gap-4 text-xs text-gray-400">
              <span>
                {loading ? 'Searching...' : `About ${totalResults.toLocaleString()} results`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8">
            {trimmedUrlQuery && (
              <p className="text-xs text-gray-500 mb-4">
                Showing results for <span className="text-cyan-400">"{trimmedUrlQuery}"</span>
              </p>
            )}
            <ResultList viewType={typeFromUrl || 'all'} />
            {totalPages > 1 && !loading && (
              <div className="mt-8">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            )}
          </div>
          <div className="hidden lg:block col-span-4">
            <div className="sticky top-28">
              <AISidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
