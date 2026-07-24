import { useState, useEffect, useRef } from 'react';
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
  const { page, totalPages, setPage, performSearch, loading, totalResults, query: storeQuery, results } = useSearchStore();
  const hasSearchedRef = useRef(false);
  const lastQueryRef = useRef('');
  const [inputValue, setInputValue] = useState('');

  const queryFromUrl = searchParams.get('q') || '';

  useEffect(() => {
    if (!queryFromUrl) return;

    const trimmed = queryFromUrl.trim();
    const isSameQuery = storeQuery === trimmed && results.length > 0 && !loading;

    if (isSameQuery) {
      return;
    }

    if (lastQueryRef.current !== trimmed) {
      lastQueryRef.current = trimmed;
      setInputValue(trimmed);
    }

    if (!hasSearchedRef.current) {
      hasSearchedRef.current = true;
      performSearch({ query: trimmed, page: 1 });
    }
  }, [queryFromUrl, storeQuery, results.length, loading, performSearch]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    performSearch({ query: queryFromUrl || storeQuery, page: newPage });
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
              <button className="hover:text-cyan-400 transition">Sort: Relevance</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8">
            {queryFromUrl && (
              <p className="text-xs text-gray-500 mb-4">
                Showing results for <span className="text-cyan-400">"{queryFromUrl}"</span>
              </p>
            )}
            <ResultList />
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
