import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getLibraries, deleteLibrary, updateLibrary } from '../../api/libraries';
import { getDepartments } from '../../api/departments';
import { getUsers } from '../../api/users';
import CommentModeration from '../../components/CommentModeration';
import MessageThread from '../../components/MessageThread';

export default function GestionBibliotecas() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [libraries, setLibraries] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [librarianByLibrary, setLibrarianByLibrary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [moderatingLibrary, setModeratingLibrary] = useState(null);
  const [messagingLibrary, setMessagingLibrary] = useState(null);

  const canManage = user.role === 'admin' || user.permissions?.canManageLibraries;

  const load = async () => {
    setLoading(true);
    try {
      const [librariesRes, departmentsRes] = await Promise.all([
        getLibraries({ limit: 200 }),
        getDepartments()
      ]);
      setLibraries(librariesRes.libraries);
      setDepartments(departmentsRes.departments);

      if (user.role === 'admin') {
        const { users } = await getUsers();
        const map = {};
        users.filter(u => u.role === 'bibliotecario' && u.assignedLibrary).forEach(u => {
          map[u.assignedLibrary._id || u.assignedLibrary] = u.name;
        });
        setLibrarianByLibrary(map);
      }
    } catch {
      setError('No se pudieron cargar las bibliotecas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManage) load();
    else setLoading(false);
  }, []);

  const handleToggleActive = async (library) => {
    await updateLibrary(library._id, { isActive: !library.isActive });
    load();
  };

  const handleDelete = async (library) => {
    if (!confirm(`¿Eliminar definitivamente "${library.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteLibrary(library._id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar la biblioteca.');
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!canManage) return <p className="empty-state">No tenés permisos para gestionar bibliotecas.</p>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="admin-toolbar">
        <h2>Bibliotecas</h2>
        <button className="btn btn-primary" onClick={() => navigate('/admin/bibliotecas/nueva')}>
          + Nueva biblioteca
        </button>
      </div>

      {user.role === 'admin' && (
        <p className="section-subtitle" style={{ textAlign: 'left', marginBottom: 16 }}>
          Para asignar o cambiar el bibliotecario a cargo de una biblioteca, usá la pestaña "Usuarios".
        </p>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Departamento</th>
              <th>Localidad</th>
              {user.role === 'admin' && <th>Bibliotecario</th>}
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {libraries.map(l => (
              <tr key={l._id}>
                <td>{l.name}</td>
                <td>{l.department?.name || '—'}</td>
                <td>{l.address?.locality || '—'}</td>
                {user.role === 'admin' && <td>{librarianByLibrary[l._id] || '—'}</td>}
                <td>{l.isActive ? 'Activa' : 'Inactiva'}</td>
                <td className="row-actions">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate(`/admin/bibliotecas/editar/${l._id}`, { state: { library: l } })}
                  >
                    Editar
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => setModeratingLibrary(l)} title="Moderar comentarios">💬</button>
                  <button className="btn btn-outline btn-sm" onClick={() => setMessagingLibrary(l)} title="Mensajes con el bibliotecario">✉</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleToggleActive(l)}>
                    {l.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(l)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {moderatingLibrary && (
        <div className="modal-overlay" onClick={() => setModeratingLibrary(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <h3>Comentarios — {moderatingLibrary.name}</h3>
            <CommentModeration libraryId={moderatingLibrary._id} canRestore canHardDelete />
            <div className="form-actions">
              <button className="btn btn-outline" onClick={() => setModeratingLibrary(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {messagingLibrary && (
        <div className="modal-overlay" onClick={() => setMessagingLibrary(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <h3>Mensajes — {messagingLibrary.name}</h3>
            <MessageThread libraryId={messagingLibrary._id} />
            <div className="form-actions">
              <button className="btn btn-outline" onClick={() => setMessagingLibrary(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
