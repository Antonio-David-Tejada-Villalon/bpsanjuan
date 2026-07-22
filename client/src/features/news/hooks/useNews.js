import { useState, useEffect, useCallback } from 'react';
import { getNews } from '@/features/news/api/news';
import { PAGINATION } from '@/constants';

export function useNews({ search = '', tag = '', page = 1, limit = PAGINATION.DEFAULT_PAGE_SIZE, enabled = true } = {}) {
  const [news, setNews] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (tag) params.tag = tag;
      const data = await getNews(params);
      setNews(data.news ?? data);
      setTotal(data.total ?? 0);
      setTotalPages(data.pages ?? Math.ceil((data.total ?? 0) / limit));
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar noticias');
    } finally {
      setLoading(false);
    }
  }, [search, tag, page, limit, enabled]);

  useEffect(() => { fetch(); }, [fetch]);

  return { news, total, totalPages, loading, error, refresh: fetch };
}
