import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getDepartments } from '../api/departments';
import LibrarySearch from '../components/LibrarySearch';
import InstagramGallery from '../components/InstagramGallery';

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

  useEffect(() => {
    getDepartments()
      .then(data => setDepartments(data.departments))
      .catch(() => setError('No se pudieron cargar los departamentos.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Helmet>
        <title>Bibliotecas Populares de San Juan | DBP</title>
        <meta name="description" content="Explorá la red de 56 bibliotecas populares distribuidas en los 19 departamentos de la provincia de San Juan, Argentina. Dirección de Bibliotecas Populares y Actividades Literarias." />
      </Helmet>
      <section className="hero">
        <div className="container">
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

      <InstagramGallery />
    </div>
  );
}
