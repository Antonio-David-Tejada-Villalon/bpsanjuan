import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPublicUsers, togglePublicUserActive, deletePublicUser } from '../../api/publicUsersApi';
import { OnlineIndicator } from '../../components/OnlineIndicator';

function Avatar({ name, picture, size = 36 }) {
  if (picture) {
    return (
      <img
        src={picture}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  const initials = name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: 'var(--primary)',
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.38, flexShrink: 0
    }}>
      {initials}
    </div>
  );
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function GestionUsuariosPublicos() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPublicUsers({ search, page, limit });
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      setError('Error al cargar usuarios.');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleToggleActive = async (u) => {
    setActionLoading(u._id + '_toggle');
    try {
      const res = await togglePublicUserActive(u._id, !u.isActive);
      setUsers(prev => prev.map(x => x._id === u._id ? { ...x, isActive: res.user.isActive } : x));
    } catch {
      setError('Error al actualizar el usuario.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(id + '_delete');
    try {
      await deletePublicUser(id);
      setConfirmDelete(null);
      setUsers(prev => prev.filter(x => x._id !== id));
      setTotal(t => t - 1);
    } catch {
      setError('Error al eliminar el usuario.');
    } finally {
      setActionLoading(null);
    }
  };

  if (user?.role !== 'admin') {
    return <p>Acceso restringido.</p>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Usuarios de la Comunidad</h2>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {total} usuario{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''} via Google
          </p>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por nombre o email…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            style={{ minWidth: 220 }}
          />
          <button type="submit" className="btn btn-primary btn-sm">Buscar</button>
          {search && (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}>
              Limpiar
            </button>
          )}
        </form>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <p className="text-muted">Cargando…</p>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          {search ? 'No se encontraron usuarios con esa búsqueda.' : 'No hay usuarios registrados aún.'}
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Me gusta</th>
                  <th>Registrado</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ opacity: u.isActive ? 1 : 0.55 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <Avatar name={u.name} picture={u.picture} />
                          <OnlineIndicator lastSeen={u.lastSeen} size={10} style={{ position: 'absolute', bottom: 1, right: 1 }} />
                        </div>
                        <span style={{ fontWeight: 500 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{u.email}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 12, padding: '2px 10px', fontSize: '0.85rem', fontWeight: 600 }}>
                        {u.likedLibraries?.length ?? 0}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatDate(u.createdAt)}</td>
                    <td>
                      <span style={{
                        background: u.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                        color: u.isActive ? '#16a34a' : '#dc2626',
                        borderRadius: 12, padding: '2px 10px', fontSize: '0.82rem', fontWeight: 600
                      }}>
                        {u.isActive ? 'Activo' : 'Bloqueado'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button
                          className={`btn btn-sm ${u.isActive ? 'btn-outline' : 'btn-primary'}`}
                          onClick={() => handleToggleActive(u)}
                          disabled={actionLoading === u._id + '_toggle'}
                          title={u.isActive ? 'Bloquear usuario' : 'Activar usuario'}
                        >
                          {actionLoading === u._id + '_toggle' ? '…' : u.isActive ? 'Bloquear' : 'Activar'}
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ background: '#ef4444', color: '#fff', border: 'none' }}
                          onClick={() => setConfirmDelete(u)}
                          disabled={!!actionLoading}
                          title="Eliminar usuario"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                ← Anterior
              </button>
              <span style={{ padding: '0.4rem 0.75rem', color: 'var(--text-muted)' }}>
                {page} / {pages}
              </span>
              <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <h3 style={{ marginTop: 0 }}>¿Eliminar usuario?</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Avatar name={confirmDelete.name} picture={confirmDelete.picture} size={44} />
              <div>
                <div style={{ fontWeight: 600 }}>{confirmDelete.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{confirmDelete.email}</div>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Se eliminará la cuenta y se limpiarán sus reacciones en comentarios. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button
                className="btn"
                style={{ background: '#ef4444', color: '#fff', border: 'none' }}
                onClick={() => handleDelete(confirmDelete._id)}
                disabled={actionLoading === confirmDelete._id + '_delete'}
              >
                {actionLoading === confirmDelete._id + '_delete' ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
