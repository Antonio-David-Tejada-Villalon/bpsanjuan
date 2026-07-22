import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { getNews, getNewsItem, toggleNewsLike, addNewsComment, hideNewsComment, unhideNewsComment } from '@/features/news/api/news';
import { useAuth } from '@/features/auth/context/AuthContext';
import GoogleLoginBtn from '@/features/auth/components/GoogleLoginBtn';
import ShareBtn from '@/shared/components/ShareBtn';
import Toast from '@/shared/components/Toast';
import NewsCarousel from '@/features/news/components/NewsCarousel';
import NewsCard from '@/features/news/components/NewsCard';
import { useTimeAgo } from '@/utils/timeAgo';

function TimeAgo({ date }) {
  const label = useTimeAgo(date);
  return <span title={date ? new Date(date).toLocaleString('es-AR') : ''}>{label}</span>;
}

export default function NoticiaDetalle() {
  const { id } = useParams();
  const { publicUser, user } = useAuth();
  const canModerate = user?.role === 'admin' || user?.role === 'supervisor';
  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [loading, setLoading] = useState(true);

  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => {
    const controller = new AbortController();
    getNewsItem(id, controller.signal)
      .then(data => {
        setNews(data.news);
        // Buscar relacionadas por primer tag
        const n = data.news;
        if (n.tags?.length > 0) {
          getNews({ tag: n.tags[0], limit: 4 }, controller.signal)
            .then(r => setRelatedNews((r.news || []).filter(a => a._id !== id).slice(0, 3)))
            .catch(() => {});
        }
      })
      .catch(err => { if (err.name !== 'CanceledError') setError('No se pudo cargar la noticia.'); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [id]);

  const handleLike = async () => {
    if (!publicUser) {
      setError(user
        ? 'El like es solo para usuarios con cuenta pública (Google).'
        : 'Iniciá sesión con Google para dar like.');
      return;
    }
    try {
      const { liked, likes } = await toggleNewsLike(id);
      setNews(n => ({ ...n, likes }));
      setError('');
      showToast('¡Like registrado!');
    } catch {
      setError('Error al procesar el like. Intentá de nuevo.');
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
      showToast('¡Comentario publicado!');
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
        {news.author?.name && (
          <> · Por <Link to={`/equipo/${news.author._id}`} className="detalle-author-link">{news.author.name}</Link></>
        )}
        {news.relatedDepartment && <> · {news.relatedDepartment.name}</>}
        {news.content && (() => {
          const words = news.content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
          const mins = Math.max(1, Math.ceil(words / 200));
          return <span className="reading-time"> · {mins} min de lectura</span>;
        })()}
      </p>

      {news.tags?.length > 0 && (
        <div className="news-tags" style={{ marginBottom: 16 }}>
          {news.tags.map(tag => (
            <Link key={tag} to={`/noticias/tag/${encodeURIComponent(tag)}`} className="news-tag news-tag--clickable">
              {tag}
            </Link>
          ))}
        </div>
      )}

      {news.thumbnail && <img src={news.thumbnail} alt={news.title} className="detalle-img" />}

      <div className="detalle-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(news.content) }} />

      {news.images?.length > 0 && (
        <NewsCarousel images={news.images} />
      )}

      <div className="detalle-actions">
        <button
          className="btn btn-outline"
          onClick={handleLike}
          aria-label={`Me gusta, ${news.likes ?? 0} likes`}
        >
          <span aria-hidden="true">❤</span> Me gusta (<span aria-hidden="true">{news.likes ?? 0}</span>)
        </button>
        <ShareBtn title={news.title} />
        {!publicUser && !user && <GoogleLoginBtn />}
      </div>

      {error && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <p className="alert alert-error" style={{ margin: 0 }}>{error}</p>
          {!publicUser && !user && <GoogleLoginBtn className="btn btn-sm btn-primary" />}
        </div>
      )}

      <h3>Comentarios ({news.comments?.filter(c => !c.hidden).length ?? 0})</h3>
      <form onSubmit={handleComment} className="comment-form">
        <label htmlFor="noticia-comment" className="visually-hidden">Tu comentario</label>
        <textarea
          id="noticia-comment"
          rows={3}
          placeholder={publicUser ? 'Escribí un comentario...' : 'Iniciá sesión con Google para comentar'}
          value={comment}
          onChange={e => setComment(e.target.value)}
          maxLength={500}
        />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
          <button type="submit" className="btn btn-primary btn-sm">Comentar</button>
          <span style={{ fontSize: 12, color: comment.length > 450 ? 'var(--primary)' : 'var(--text-soft)' }}
                aria-live="polite" aria-atomic="true">
            {comment.length}/500
          </span>
        </div>
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

      {/* ── Artículos relacionados ── */}
      {relatedNews.length > 0 && (
        <div className="related-news">
          <h3 className="related-news-title">También te puede interesar</h3>
          <div className="grid grid-3">
            {relatedNews.map(item => (
              <NewsCard key={item._id} news={item} />
            ))}
          </div>
        </div>
      )}
      <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(t => ({ ...t, message: '' }))} />
    </div>
  );
}
