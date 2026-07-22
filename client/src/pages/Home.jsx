import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getDepartments } from '@/features/departments/api/departments';
import { getNews } from '@/features/news/api/news';
import { subscribeNewsletter } from '@/features/newsletter/api/newsletter';
import LibrarySearch from '@/features/libraries/components/LibrarySearch';
import InstagramGallery from '@/shared/components/InstagramGallery';

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
  const [retryKey, setRetryKey] = useState(0);
  const [latestNews, setLatestNews] = useState([]);
  const [nlEmail, setNlEmail] = useState('');
  const [nlStatus, setNlStatus] = useState(null); // null | 'ok' | 'error'
  const [nlMsg, setNlMsg] = useState('');
  const [nlLoading, setNlLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    getDepartments(controller.signal)
      .then(data => setDepartments(data.departments))
      .catch(err => { if (err.name !== 'CanceledError') setError('No se pudieron cargar los departamentos.'); })
      .finally(() => setLoading(false));
    getNews({ limit: 3 }, controller.signal)
      .then(data => setLatestNews(data.news || []))
      .catch(() => {});
    return () => controller.abort();
  }, [retryKey]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!nlEmail.trim()) return;
    setNlLoading(true);
    try {
      const res = await subscribeNewsletter(nlEmail.trim());
      setNlStatus('ok');
      setNlMsg(res.message);
      setNlEmail('');
    } catch (err) {
      setNlStatus('error');
      setNlMsg(err?.response?.data?.message || 'Error al suscribirse. Intentá de nuevo.');
    } finally {
      setNlLoading(false);
    }
  };

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
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <p className="alert alert-error" style={{ margin: 0 }}>{error}</p>
            <button className="btn btn-outline btn-sm" onClick={() => setRetryKey(k => k + 1)}>Reintentar</button>
          </div>
        )}

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
                  {dept.libraryCount > 0 ? (
                    <span className="badge">{dept.libraryCount} biblioteca{dept.libraryCount > 1 ? 's' : ''}</span>
                  ) : (
                    <span className="badge badge-muted" title="Todavía no hay bibliotecas populares registradas en este departamento. Se agregarán próximamente.">
                      Aún sin bibliotecas
                    </span>
                  )}
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

      {/* ── Newsletter ── */}
      <section id="newsletter" className="newsletter-section">
        <div className="container newsletter-inner">
          <div className="newsletter-copy">
            <p className="newsletter-eyebrow">Novedades culturales</p>
            <h2 className="newsletter-title">Recibí noticias de las bibliotecas</h2>
            <p className="newsletter-sub">Enterate de actividades, ferias, talleres y eventos de la red de bibliotecas populares de San Juan.</p>
          </div>
          <div className="newsletter-form-wrap">
            {nlStatus === 'ok' ? (
              <p className="newsletter-success">{nlMsg}</p>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-form" noValidate>
                <label htmlFor="nl-email" className="visually-hidden">Tu dirección de email</label>
                <input
                  id="nl-email"
                  type="email"
                  className="newsletter-input"
                  placeholder="tu@email.com"
                  value={nlEmail}
                  onChange={e => setNlEmail(e.target.value)}
                  required
                  disabled={nlLoading}
                />
                <button type="submit" className="btn btn-primary newsletter-btn" disabled={nlLoading}>
                  {nlLoading ? 'Enviando…' : 'Suscribirme'}
                </button>
                {nlStatus === 'error' && <p className="newsletter-error">{nlMsg}</p>}
              </form>
            )}
            <p className="newsletter-legal">
              Tus datos se guardan de forma segura. Podés darte de baja escribiéndonos.
              Ley 25.326 de Protección de Datos Personales.
            </p>
          </div>
        </div>
      </section>

      <InstagramGallery />
    </div>
  );
}
