import { Link } from 'react-router-dom';
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
  return (
    <Link to={`/noticias/${news._id}`} className="card card-hover news-card">
      <img
        src={news.thumbnail || 'https://placehold.co/400x220?text=Noticia'}
        alt={news.title}
        className="news-card-img"
      />
      <div className="card-body">
        <h3 className="news-card-title">{news.title}</h3>
        <p className="news-card-summary">{news.summary}</p>
        {news.publishedAt && <CardDate date={news.publishedAt} />}
      </div>
    </Link>
  );
}
