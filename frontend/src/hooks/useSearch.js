import { useState, useCallback } from 'react';
import { useSearchStore } from '../store/searchStore';

export function useSearch() {
  const [inputValue, setInputValue] = useState('');

  const {
    query,
    results,
    loading,
    error,
    page,
    size,
    totalPages,
    totalResults,
    filters,
    recentSearches,
    setQuery,
    setPage,
    setSize,
    setFilters,
    performSearch,
    addRecentSearch,
    clearResults,
  } = useSearchStore();

  const handleSearch = useCallback(
    (searchQuery) => {
      const q = typeof searchQuery === 'string' ? searchQuery : inputValue;
      if (!q.trim()) return;
      setQuery(q);
      setPage(1);
      performSearch({ query: q, page: 1, size });
    },
    [inputValue, setQuery, setPage, performSearch, size]
  );

  return {
    inputValue,
    setInputValue,
    query,
    results,
    loading,
    error,
    page,
    size,
    totalPages,
    totalResults,
    filters,
    recentSearches,
    setPage,
    setSize,
    setFilters,
    handleSearch,
    addRecentSearch,
    clearResults,
  };
}
