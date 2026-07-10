import { Link } from 'react-router-dom';

export default function LibraryCard({ library }) {
  return (
    <Link to={`/bibliotecas/${library._id}`} className="card card-hover library-card">
      <img
        src={library.thumbnail || library.images?.[0] || 'https://placehold.co/400x220?text=Biblioteca'}
        alt={library.name}
        className="library-card-img"
      />
      <div className="card-body">
        <h3 className="library-card-title">{library.name}</h3>
        <p className="library-card-dept">{library.department?.name}</p>
        {library.address?.street && (
          <p className="library-card-address">📍 {library.address.street}</p>
        )}
        <span className="badge">❤ {library.likes ?? 0}</span>
      </div>
    </Link>
  );
}
