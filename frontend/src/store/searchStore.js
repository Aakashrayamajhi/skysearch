import { create } from 'zustand';
import { search, fetchImageSearch } from '../services/api/search.api';
import { stripHtml } from '../utils/sanitize';

let searchAbortController = null;

export const useSearchStore = create((set, get) => ({
  query: '',
  results: [],
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
    const { page, size, filters } = get();
    const searchQuery = params.query || '';
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
        const total = Number(data.total) || 0;
        const pageSize = Number(data.size) || searchSize;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));

        const normalizedResults = Array.isArray(data.results)
          ? data.results.map((item) => {
              const rawTitle = typeof item.title === 'string' ? item.title.trim() : '';
              const fallbackTitle = rawTitle || (typeof item.url === 'string' ? new URL(item.url).hostname : 'Result');
              const rawSnippet = typeof item.snippet === 'string' ? item.snippet : '';
              const description = stripHtml(rawSnippet);
              const url = typeof item.url === 'string' ? item.url : '';
              const image = typeof item.image === 'string' && item.image ? item.image : null;
              const source = extractSource(url);

              return {
                id: url || fallbackTitle,
                title: fallbackTitle,
                description: description || 'No description available',
                url,
                image,
                source,
                score: typeof item.score === 'number' ? item.score : null,
              };
            })
          : [];

        set({
          results: normalizedResults,
          totalResults: total,
          totalPages,
          page: Number(data.page) || searchPage,
          size: pageSize,
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
        const total = Number(data.total) || 0;
        const normalizedResults = Array.isArray(data.results)
          ? data.results.map((item, index) => {
              const url = typeof item.url === 'string' ? item.url : (typeof item.src === 'string' ? item.src : '');
              const title = typeof item.title === 'string' && item.title.trim() ? item.title.trim() : (url ? new URL(url).hostname : `Image ${index + 1}`);
              const image = url || (typeof item.image === 'string' ? item.image : '');
              return {
                id: url || title || index,
                url,
                title,
                image,
              };
            })
          : [];

        set({
          results: normalizedResults,
          totalResults: total,
          totalPages: 1,
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
      totalResults: 0,
      totalPages: 1,
      error: null,
    }),
}));

function extractSource(url) {
  if (!url || typeof url !== 'string') return 'Web';
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    return hostname.split('.')[0] || 'Web';
  } catch {
    return 'Web';
  }
}
