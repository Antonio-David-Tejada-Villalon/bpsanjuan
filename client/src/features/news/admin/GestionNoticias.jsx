import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getAllNewsAdmin, updateNews, deleteNews } from '@/features/news/api/news';

export default function GestionNoticias() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canManage = user.role === 'admin' || user.permissions?.canManageNews;
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const newsRes = await getAllNewsAdmin();
      setNews(newsRes.news);
    } catch {
      setError('No se pudieron cargar las noticias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManage) load();
    else setLoading(false);
  }, []);

  const handleTogglePublished = async (item) => {
    await updateNews(item._id, { isPublished: !item.isPublished });
    load();
  };

  const handleDelete = async (item) => {
    if (!confirm(`¿Eliminar la noticia "${item.title}"? Esta acción no se puede deshacer.`)) return;
    await deleteNews(item._id);
    load();
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!canManage) return <p className="empty-state">No tenés permisos para gestionar noticias.</p>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="admin-toolbar">
        <h2>Noticias</h2>
        <button className="btn btn-primary" onClick={() => navigate('/admin/noticias/nueva')}>
          + Nueva noticia
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {news.map(n => (
              <tr key={n._id}>
                <td>{n.title}</td>
                <td>{n.author?.name || '—'}</td>
                <td>{n.isPublished ? 'Publicada' : 'Borrador'}</td>
                <td className="row-actions">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate(`/admin/noticias/editar/${n._id}`, { state: { item: n } })}
                  >
                    Editar
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleTogglePublished(n)}>
                    {n.isPublished ? 'Despublicar' : 'Publicar'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(n)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
