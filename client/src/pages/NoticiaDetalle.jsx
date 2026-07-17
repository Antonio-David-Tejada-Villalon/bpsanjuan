import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getNewsItem, toggleNewsLike, addNewsComment } from '../api/news';
import { useAuth } from '../context/AuthContext';
import GoogleLoginBtn from '../components/GoogleLoginBtn';
import ShareBtn from '../components/ShareBtn';
import { useTimeAgo } from '../utils/timeAgo';

function TimeAgo({ date }) {
  const label = useTimeAgo(date);
  return <span title={date ? new Date(date).toLocaleString('es-AR') : ''}>{label}</span>;
}

export default function NoticiaDetalle() {
  const { id } = useParams();
  const { publicUser } = useAuth();
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
      <Link to="/noticias">← Volver a noticias</Link>
      <h1>{news.title}</h1>
      <p className="detalle-meta">
        {news.publishedAt && <TimeAgo date={news.publishedAt} />}
        {news.publishedAt && <span className="detalle-meta-full"> · {new Date(news.publishedAt).toLocaleDateString('es-AR', { day:'2-digit', month:'long', year:'numeric' })}</span>}
        {news.relatedDepartment && <> · {news.relatedDepartment.name}</>}
      </p>

      {news.thumbnail && <img src={news.thumbnail} alt={news.title} className="detalle-img" />}

      <div className="detalle-content" dangerouslySetInnerHTML={{ __html: news.content }} />

      <div className="detalle-actions">
        <button className="btn btn-outline" onClick={handleLike}>❤ Me gusta ({news.likes ?? 0})</button>
        <ShareBtn title={news.title} />
        {!publicUser && <GoogleLoginBtn />}
      </div>

      {error && <p className="alert alert-error">{error}</p>}

      <h3>Comentarios ({news.comments?.length ?? 0})</h3>
      <form onSubmit={handleComment} className="comment-form">
        <textarea
          rows={3}
          placeholder={publicUser ? 'Escribí un comentario...' : 'Iniciá sesión con Google para comentar'}
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-sm">Comentar</button>
      </form>

      <ul className="comment-list">
        {news.comments?.map(c => (
          <li key={c._id}>
            <strong>{c.publicUser?.name || 'Usuario'}</strong>
            <p>{c.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
