import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDepartments } from '../api/departments';

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
      <section className="hero">
        <div className="container">
          <h1>Bibliotecas Populares de San Juan</h1>
          <p className="hero-subtitle">
            Explorá la red de bibliotecas populares distribuidas en los 19 departamentos de la provincia.
          </p>
        </div>
      </section>

      <section className="section container">
        <h2 className="section-title">Departamentos</h2>
        <p className="section-subtitle">Elegí un departamento para ver sus bibliotecas populares.</p>

        {loading && <div className="page-loading"><div className="spinner" /></div>}
        {error && <p className="alert alert-error">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-4">
            {departments.map(dept => (
              <Link to={`/departamentos/${dept.slug}`} key={dept._id} className="card card-hover dept-card">
                <img
                  src={dept.thumbnail || 'https://placehold.co/300x180?text=' + dept.name}
                  alt={dept.name}
                  className="dept-card-img"
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
    </div>
  );
}
