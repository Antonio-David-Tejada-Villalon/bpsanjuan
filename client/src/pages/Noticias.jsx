import { useEffect, useState } from 'react';
import { getNews } from '../api/news';
import NewsCard from '../components/NewsCard';

export default function Noticias() {
  const [news, setNews] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getNews({ page, limit: 6, search: search || undefined })
      .then(data => {
        setNews(data.news);
        setTotalPages(data.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(e.target.elements.q.value.trim());
  };

  return (
    <div className="section container">
      <h1 className="section-title">Noticias</h1>
      <p className="section-subtitle">Novedades y actividades de las Bibliotecas Populares.</p>

      <form className="news-search" onSubmit={handleSearch}>
        <input name="q" type="text" placeholder="Buscar noticias..." defaultValue={search} />
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
              >
                Anterior
              </button>
              <span>Página {page} de {totalPages}</span>
              <button
                className="btn btn-outline btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
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
