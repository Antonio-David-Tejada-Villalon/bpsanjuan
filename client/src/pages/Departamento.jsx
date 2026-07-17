import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getDepartment } from '../api/departments';
import { getLibraries } from '../api/libraries';
import LibraryCard from '../components/LibraryCard';

export default function Departamento() {
  const { slug } = useParams();
  const [department, setDepartment] = useState(null);
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getDepartment(slug)
      .then(data => {
        setDepartment(data.department);
        return getLibraries({ department: data.department._id, limit: 50 });
      })
      .then(data => setLibraries(data.libraries))
      .catch(() => setError('No se pudo cargar el departamento.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (error || !department) return <p className="empty-state">{error || 'Departamento no encontrado.'}</p>;

  return (
    <div className="section container">
      <Helmet>
        <title>Bibliotecas de {department.name} | DBP San Juan</title>
        <meta name="description" content={`Bibliotecas populares del departamento ${department.name}, provincia de San Juan. ${libraries.length > 0 ? `${libraries.length} biblioteca${libraries.length > 1 ? 's' : ''} disponible${libraries.length > 1 ? 's' : ''}.` : ''}`} />
      </Helmet>
      <h1>Bibliotecas Populares de {department.name}</h1>
      {department.description && <p className="section-subtitle">{department.description}</p>}

      {libraries.length === 0 ? (
        <p className="empty-state">Todavía no hay bibliotecas registradas en este departamento.</p>
      ) : (
        <div className="grid grid-3">
          {libraries.map(lib => <LibraryCard key={lib._id} library={lib} />)}
        </div>
      )}
    </div>
  );
}
