import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getNews } from '@/features/news/api/news';
import NewsCard from '@/features/news/components/NewsCard';

export default function NoticiasPorTag() {
  const { tag } = useParams();
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Reset page when tag changes
  useEffect(() => {
    setPage(1);
  }, [tag]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getNews({ tag, page, limit: 6 }, controller.signal)
      .then(data => {
        setNews(data.news);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [tag, page]);

  return (
    <div className="section container">
      <Helmet>
        <title>{tag} — Noticias | DBP San Juan</title>
        <meta name="description" content={`Noticias sobre "${tag}" de las Bibliotecas Populares de San Juan.`} />
      </Helmet>

      <nav aria-label="Ruta de navegación" className="breadcrumb">
        <ol className="breadcrumb-list">
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/noticias">Noticias</Link></li>
          <li aria-current="page">{tag}</li>
        </ol>
      </nav>

      <h1 className="section-title">
        Noticias sobre <span className="news-tag">{tag}</span>
      </h1>
      <p className="section-subtitle">
        <Link to="/noticias" className="news-tag-back">← Ver todas las noticias</Link>
      </p>

      {loading && <div className="page-loading"><div className="spinner" /></div>}

      {!loading && news.length === 0 && (
        <p className="empty-state">No hay noticias con esta etiqueta.</p>
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
