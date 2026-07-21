import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getDepartments } from '../api/departments';
import { getNews } from '../api/news';
import LibrarySearch from '../components/LibrarySearch';
import InstagramGallery from '../components/InstagramGallery';

const newsFallback = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="170" viewBox="0 0 400 170"><rect width="400" height="170" fill="#FA7506"/><text x="200" y="95" text-anchor="middle" dominant-baseline="middle" font-family="system-ui,sans-serif" font-size="64" font-weight="700" fill="rgba(255,255,255,0.15)">DBP</text></svg>'
)}`;

function deptPlaceholder(name) {
  const initials = name
    .split(' ')
    .filter(w => w.length > 2)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || name.slice(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180"><rect width="300" height="180" fill="#FA7506"/><text x="150" y="95" text-anchor="middle" dominant-baseline="middle" font-family="system-ui,sans-serif" font-size="54" font-weight="700" fill="rgba(255,255,255,0.9)">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export default function Home() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [latestNews, setLatestNews] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    getDepartments(controller.signal)
      .then(data => setDepartments(data.departments))
      .catch(err => { if (err.name !== 'CanceledError') setError('No se pudieron cargar los departamentos.'); })
      .finally(() => setLoading(false));
    getNews({ limit: 3 }, controller.signal)
      .then(data => setLatestNews(data.news || []))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return (
    <div>
      <Helmet>
        <title>Bibliotecas Populares de San Juan | DBP</title>
        <meta name="description" content="Explorá la red de 56 bibliotecas populares distribuidas en los 19 departamentos de la provincia de San Juan, Argentina. Dirección de Bibliotecas Populares y Actividades Literarias." />
      </Helmet>
      <section className="hero">
        <div className="container">
          <div className="hero-layout">
            <div className="hero-text">
              <h1>Bibliotecas Populares de San Juan</h1>
              <p className="hero-subtitle">
                Explorá la red de bibliotecas populares distribuidas en los 19 departamentos de la provincia.
              </p>
              <LibrarySearch departments={departments} />
              <a href="#departamentos" className="hero-cta-scroll">
                Explorá por departamento
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
              </a>
            </div>
            <div className="hero-visual" aria-hidden="true">
              <img src="/hero-bibliotecas.svg" alt="" width="400" height="300" />
            </div>
          </div>
        </div>
      </section>

      <section id="departamentos" className="section container">
        <h2 className="section-title">Departamentos</h2>
        <p className="section-subtitle">Elegí un departamento para ver sus bibliotecas populares.</p>

        {loading && <div className="page-loading"><div className="spinner" /></div>}
        {error && <p className="alert alert-error">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-4">
            {departments.map(dept => (
              <Link to={`/departamentos/${dept.slug}`} key={dept._id} className="card card-hover dept-card">
                <img
                  src={dept.thumbnail || deptPlaceholder(dept.name)}
                  alt={dept.name}
                  className="dept-card-img"
                  onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = deptPlaceholder(dept.name); }}
                />
                <div className="card-body">
                  <h3 className="dept-card-title">{dept.name}</h3>
                  <span className="badge">{dept.libraryCount ?? 0} bibliotecas</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {latestNews.length > 0 && (
        <section className="section container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Últimas Noticias</h2>
              <p className="section-subtitle">Lo más reciente de la red de bibliotecas.</p>
            </div>
            <Link to="/noticias" className="btn btn-outline btn-sm">Ver todas →</Link>
          </div>
          <div className="grid grid-3">
            {latestNews.map(item => (
              <Link to={`/noticias/${item._id}`} key={item._id} className="card card-hover news-card">
                <img
                  src={item.thumbnail || newsFallback}
                  alt={item.title}
                  className="news-card-img"
                  onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = newsFallback; }}
                />
                <div className="card-body">
                  {(item.tags?.[0] || item.relatedDepartment?.name) && (
                    <p style={{ fontSize: 12, color: 'var(--primary-text)', fontWeight: 600, marginBottom: 4 }}>
                      {item.tags?.[0] || item.relatedDepartment.name}
                    </p>
                  )}
                  <h3 className="news-card-title">{item.title}</h3>
                  {item.publishedAt && (
                    <p className="news-card-date">
                      {new Date(item.publishedAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <InstagramGallery />
    </div>
  );
}
