import { create } from 'zustand';
import { search, fetchImageSearch } from '../services/api/search.api';

let searchAbortController = null;

export const useSearchStore = create((set, get) => ({
  query: '',
  results: [],
  aiInsight: null,
  loading: false,
  error: null,
  page: 1,
  size: 10,
  totalResults: 0,
  totalPages: 1,
  filters: {},
  recentSearches: JSON.parse(localStorage.getItem('recentSearches') || '[]'),

  setQuery: (query) => set({ query }),
  setPage: (page) => set({ page }),
  setSize: (size) => set({ size }),
  setFilters: (filters) => set({ filters }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setResults: (results) => set({ results }),
  setTotalResults: (totalResults) => set({ totalResults }),

  addRecentSearch: (query) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const recent = get().recentSearches.filter((s) => s !== trimmed);
    const updated = [trimmed, ...recent].slice(0, 10);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    set({ recentSearches: updated });
  },

  performSearch: async (params = {}) => {
    const { query, page, size, filters } = get();
    const searchQuery = params.query || query;
    const searchPage = params.page ?? page;
    const searchSize = params.size ?? size;

    if (!searchQuery.trim()) {
      set({ results: [], error: null, totalResults: 0, totalPages: 1 });
      return;
    }

    if (searchAbortController) {
      searchAbortController.abort();
    }
    const controller = new AbortController();
    searchAbortController = controller;

    set({ loading: true, error: null });

    try {
      const data = await search(
        {
          q: searchQuery,
          page: searchPage,
          size: searchSize,
          ...filters,
        },
        controller.signal
      );

      if (!controller.signal.aborted) {
        set({
          results: data.results || [],
          aiInsight: data.aiInsight || null,
          totalResults: data.totalResults || 0,
          totalPages: data.totalPages || 1,
          page: searchPage,
          loading: false,
        });

        get().addRecentSearch(searchQuery);
      }
    } catch (err) {
      if (!controller.signal.aborted && !err.isCancel) {
        set({
          error: err.message || 'Search failed',
          loading: false,
        });
      }
    }
  },

  performImageSearch: async (query) => {
    if (searchAbortController) {
      searchAbortController.abort();
    }
    const controller = new AbortController();
    searchAbortController = controller;

    set({ loading: true, error: null });

    try {
      const data = await fetchImageSearch({ q: query, size: 20 }, controller.signal);
      if (!controller.signal.aborted) {
        set({
          results: data.results || [],
          totalResults: data.totalResults || 0,
          loading: false,
        });
      }
    } catch (err) {
      if (!controller.signal.aborted && !err.isCancel) {
        set({
          error: err.message || 'Failed to load images',
          loading: false,
        });
      }
    }
  },

  clearResults: () =>
    set({
      results: [],
      aiInsight: null,
      totalResults: 0,
      totalPages: 1,
      error: null,
    }),
}));
