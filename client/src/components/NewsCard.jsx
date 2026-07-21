import { Link, useNavigate } from 'react-router-dom';
import { useTimeAgo } from '../utils/timeAgo';

function CardDate({ date }) {
  const label = useTimeAgo(date);
  return (
    <span className="news-card-date" title={date ? new Date(date).toLocaleString('es-AR') : ''}>
      {label}
    </span>
  );
}

export default function NewsCard({ news }) {
  const navigate = useNavigate();

  return (
    <Link to={`/noticias/${news._id}`} className="card card-hover news-card">
      <img
        src={news.thumbnail || '/placeholder-noticia.svg'}
        alt={news.title}
        className="news-card-img"
        onError={e => { e.target.src = '/placeholder-noticia.svg'; }}
      />
      <div className="card-body">
        {news.tags?.length > 0 && (
          <div className="news-tags">
            {news.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="news-tag news-tag--clickable"
                onClick={e => { e.preventDefault(); navigate(`/noticias/tag/${encodeURIComponent(tag)}`); }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <h3 className="news-card-title">{news.title}</h3>
        <p className="news-card-summary">{news.summary}</p>
        {news.publishedAt && <CardDate date={news.publishedAt} />}
      </div>
    </Link>
  );
}
