import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { getNewsItem, toggleNewsLike, addNewsComment, hideNewsComment, unhideNewsComment } from '../api/news';
import { useAuth } from '../context/AuthContext';
import GoogleLoginBtn from '../components/GoogleLoginBtn';
import ShareBtn from '../components/ShareBtn';
import NewsCarousel from '../components/NewsCarousel';
import { useTimeAgo } from '../utils/timeAgo';

function TimeAgo({ date }) {
  const label = useTimeAgo(date);
  return <span title={date ? new Date(date).toLocaleString('es-AR') : ''}>{label}</span>;
}

export default function NoticiaDetalle() {
  const { id } = useParams();
  const { publicUser, user } = useAuth();
  const canModerate = user?.role === 'admin' || user?.role === 'supervisor';
  const [news, setNews] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNewsItem(id)
      .then(data => setNews(data.news))
      .catch(() => setError('No se pudo cargar la noticia.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    try {
      const { liked, likes } = await toggleNewsLike(id);
      setNews(n => ({ ...n, likes }));
      setError('');
    } catch {
      setError('Iniciá sesión con Google para dar like.');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const { comments } = await addNewsComment(id, comment.trim());
      setNews(n => ({ ...n, comments }));
      setComment('');
      setError('');
    } catch {
      setError('Iniciá sesión con Google para comentar.');
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!news) return <p className="empty-state">{error || 'Noticia no encontrada.'}</p>;

  return (
    <div className="section container detalle">
      <Helmet>
        <title>{news.title} | Noticias — DBP San Juan</title>
        <meta name="description" content={news.content ? news.content.replace(/<[^>]+>/g, '').slice(0, 155) : `Noticia de las Bibliotecas Populares de San Juan.`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://bpsanjuan.vercel.app" },
            { "@type": "ListItem", "position": 2, "name": "Noticias", "item": "https://bpsanjuan.vercel.app/noticias" },
            { "@type": "ListItem", "position": 3, "name": news.title, "item": `https://bpsanjuan.vercel.app/noticias/${id}` }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": news.title,
          "url": `https://bpsanjuan.vercel.app/noticias/${id}`,
          ...(news.publishedAt && { "datePublished": news.publishedAt }),
          ...(news.thumbnail && { "image": news.thumbnail }),
          "publisher": {
            "@type": "GovernmentOrganization",
            "name": "Dirección de Bibliotecas Populares y Actividades Literarias de San Juan",
            "url": "https://bpsanjuan.vercel.app",
            "logo": {
              "@type": "ImageObject",
              "url": "https://bpsanjuan.vercel.app/favicon.png"
            }
          }
        })}</script>
      </Helmet>
      <nav aria-label="Ruta de navegación" className="breadcrumb">
        <ol className="breadcrumb-list">
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/noticias">Noticias</Link></li>
          <li aria-current="page">{news.title}</li>
        </ol>
      </nav>
      <h1>{news.title}</h1>
      <p className="detalle-meta">
        {news.publishedAt && <TimeAgo date={news.publishedAt} />}
        {news.publishedAt && <span className="detalle-meta-full"> · {new Date(news.publishedAt).toLocaleDateString('es-AR', { day:'2-digit', month:'long', year:'numeric' })}</span>}
        {news.relatedDepartment && <> · {news.relatedDepartment.name}</>}
      </p>

      {news.thumbnail && <img src={news.thumbnail} alt={news.title} className="detalle-img" />}

      <div className="detalle-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(news.content) }} />

      {news.images?.length > 0 && (
        <NewsCarousel images={news.images} />
      )}

      <div className="detalle-actions">
        <button className="btn btn-outline" onClick={handleLike}>❤ Me gusta ({news.likes ?? 0})</button>
        <ShareBtn title={news.title} />
        {!publicUser && <GoogleLoginBtn />}
      </div>

      {error && <p className="alert alert-error">{error}</p>}

      <h3>Comentarios ({news.comments?.filter(c => !c.hidden).length ?? 0})</h3>
      <form onSubmit={handleComment} className="comment-form">
        <label htmlFor="noticia-comment" className="visually-hidden">Tu comentario</label>
        <textarea
          id="noticia-comment"
          rows={3}
          placeholder={publicUser ? 'Escribí un comentario...' : 'Iniciá sesión con Google para comentar'}
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-sm">Comentar</button>
      </form>

      <ul className="comment-list">
        {news.comments?.map(c => (
          <li key={c._id} style={c.hidden ? { opacity: 0.5, background: 'var(--bg-soft, #f5f5f5)' } : {}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div>
                <strong>{c.publicUser?.name || 'Usuario'}</strong>
                {c.hidden && (
                  <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--danger, #D64545)', fontStyle: 'italic' }}>
                    Oculto por {c.hiddenBy?.name || 'moderación'}
                  </span>
                )}
                <p>{c.text}</p>
              </div>
              {canModerate && (
                <button
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: 11, padding: '2px 8px', flexShrink: 0 }}
                  onClick={async () => {
                    try {
                      if (c.hidden) {
                        await unhideNewsComment(id, c._id);
                      } else {
                        await hideNewsComment(id, c._id);
                      }
                      const data = await getNewsItem(id);
                      setNews(data.news);
                    } catch { /* silencioso */ }
                  }}
                >
                  {c.hidden ? 'Restaurar' : 'Ocultar'}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
