import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getPublicProfile } from '../api/users';
import NewsCard from '../components/NewsCard';

const ROLE_LABELS = {
  admin:        'Dirección',
  supervisor:   'Coordinación',
  bibliotecario: 'Bibliotecario/a',
};

export default function EquipoMiembro() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    getPublicProfile(id, controller.signal)
      .then(res => setData(res))
      .catch(err => {
        if (err.name !== 'CanceledError') setError('Perfil no encontrado.');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [id]);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (error || !data) return (
    <div className="section container">
      <p className="empty-state">{error || 'Perfil no encontrado.'}</p>
      <Link to="/noticias" className="btn btn-outline" style={{ marginTop: 16 }}>← Volver a noticias</Link>
    </div>
  );

  const { member, articles } = data;
  const roleLabel = ROLE_LABELS[member.role] || member.role;

  return (
    <div className="section container">
      <Helmet>
        <title>{member.name} — {roleLabel} | Bibliotecas Populares San Juan</title>
        <meta name="description" content={`Artículos publicados por ${member.name}, ${roleLabel} de la Dirección de Bibliotecas Populares de San Juan.`} />
      </Helmet>

      <nav aria-label="Ruta de navegación" className="breadcrumb">
        <ol className="breadcrumb-list">
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/noticias">Noticias</Link></li>
          <li aria-current="page">{member.name}</li>
        </ol>
      </nav>

      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.35rem' }}>
          {roleLabel}
        </p>
        <h1 style={{ margin: 0 }}>{member.name}</h1>
        <p style={{ marginTop: '0.5rem', color: 'var(--text-soft)' }}>
          Dirección de Bibliotecas Populares y Actividades Literarias — San Juan
        </p>
      </div>

      {articles.length > 0 ? (
        <>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>
            Artículos publicados ({articles.length})
          </h2>
          <div className="grid grid-3">
            {articles.map(article => (
              <NewsCard key={article._id} news={article} />
            ))}
          </div>
        </>
      ) : (
        <p className="empty-state">Este autor aún no tiene artículos publicados.</p>
      )}
    </div>
  );
}
