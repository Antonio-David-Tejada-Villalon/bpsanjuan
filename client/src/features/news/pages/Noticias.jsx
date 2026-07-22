import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { getNews } from '@/features/news/api/news';
import NewsCard from '@/features/news/components/NewsCard';

export default function Noticias() {
  const [news, setNews] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getNews({ page, limit: 6, search: search || undefined }, controller.signal)
      .then(data => {
        setNews(data.news);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(e.target.elements.q.value.trim());
  };

  return (
    <div className="section container">
      <Helmet>
        <title>Noticias | Bibliotecas Populares de San Juan</title>
        <meta name="description" content="Novedades, eventos y actividades de las Bibliotecas Populares de San Juan. Dirección de Bibliotecas Populares y Actividades Literarias." />
      </Helmet>
      <h1 className="section-title">Noticias</h1>
      <p className="section-subtitle">Novedades y actividades de las Bibliotecas Populares.</p>

      <form className="news-search" onSubmit={handleSearch}>
        <label htmlFor="news-search" className="visually-hidden">Buscar noticias</label>
        <input id="news-search" name="q" type="text" placeholder="Buscar noticias..." defaultValue={search} />
        <button type="submit" className="btn btn-primary">Buscar</button>
      </form>

      {loading && <div className="page-loading"><div className="spinner" /></div>}

      {!loading && news.length === 0 && (
        <p className="empty-state">No se encontraron noticias.</p>
      )}

      {!loading && news.length > 0 && (
        <>
          <div className="grid grid-3">
            {news.map(item => <NewsCard key={item._id} news={item} />)}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                aria-label="Ir a la página anterior"
              >
                Anterior
              </button>
              <span aria-live="polite">Página {page} de {totalPages}</span>
              <button
                className="btn btn-outline btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                aria-label="Ir a la página siguiente"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
