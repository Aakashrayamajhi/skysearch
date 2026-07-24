import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const searchApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

searchApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject({ ...error, isCancel: true });
    }
    return Promise.reject(error);
  }
);

export async function search(queryParams, signal) {
  const response = await searchApi.get('/search', {
    params: queryParams,
    signal,
  });
  return response.data;
}

export async function fetchImageSearch(query, signal) {
  const response = await searchApi.get('/search/images', {
    params: { q: query },
    signal,
  });
  return response.data;
}
