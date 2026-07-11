import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getActivityLogs, deleteLog, deleteAllLogs, extendRetention, exportLogs } from '../../api/activityLogsApi';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const roleColors = {
  admin: { bg: 'rgba(239,68,68,0.12)', color: '#dc2626' },
  supervisor: { bg: 'rgba(59,130,246,0.12)', color: '#2563eb' },
  bibliotecario: { bg: 'rgba(16,185,129,0.12)', color: '#059669' },
};

export default function ActivityLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [expiringCount, setExpiringCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [exporting, setExporting] = useState('');
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getActivityLogs({ page, search });
      setLogs(data.logs);
      setTotal(data.total);
      setPages(data.pages);
      setExpiringCount(data.expiringCount);
    } catch {
      setError('Error al cargar los registros.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleDelete = async (id) => {
    setActionLoading(id);
    try {
      await deleteLog(id);
      setLogs(prev => prev.filter(l => l._id !== id));
      setTotal(t => t - 1);
    } catch { setError('Error al eliminar.'); }
    finally { setActionLoading(null); }
  };

  const handleDeleteAll = async () => {
    setActionLoading('all');
    try {
      await deleteAllLogs();
      setConfirmDeleteAll(false);
      setLogs([]);
      setTotal(0);
      setExpiringCount(0);
    } catch { setError('Error al eliminar todos los registros.'); }
    finally { setActionLoading(null); }
  };

  const handleExtend = async () => {
    setActionLoading('extend');
    try {
      const res = await extendRetention();
      setExpiringCount(0);
      alert(`Se extendieron ${res.modified} registros por 30 días más.`);
    } catch { setError('Error al extender la retención.'); }
    finally { setActionLoading(null); }
  };

  const handleExport = async (format) => {
    setExporting(format);
    try {
      await exportLogs(format);
    } catch { setError(`Error al exportar en formato ${format}.`); }
    finally { setExporting(''); }
  };

  if (user?.role !== 'admin') return <p>Acceso restringido.</p>;

  return (
    <div>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Historial de Actividad</h2>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {total} registro{total !== 1 ? 's' : ''} — retención de 30 días
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Exportar:</span>
          {['xlsx', 'docx', 'txt'].map(fmt => (
            <button
              key={fmt}
              className="btn btn-outline btn-sm"
              onClick={() => handleExport(fmt)}
              disabled={!!exporting || total === 0}
              style={{ textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.04em' }}
            >
              {exporting === fmt ? '…' : fmt}
            </button>
          ))}
          <button
            className="btn btn-sm"
            style={{ background: '#ef4444', color: '#fff', border: 'none' }}
            onClick={() => setConfirmDeleteAll(true)}
            disabled={total === 0}
          >
            Borrar todo
          </button>
        </div>
      </div>

      {/* Alerta de expiración */}
      {expiringCount > 0 && (
        <div style={{
          background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.4)',
          borderRadius: 'var(--radius)', padding: '0.75rem 1rem', marginBottom: '1rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'
        }}>
          <span style={{ color: '#92400e', fontSize: '0.9rem' }}>
            ⚠️ <strong>{expiringCount} registro{expiringCount !== 1 ? 's' : ''}</strong> vencerá{expiringCount !== 1 ? 'n' : ''} en los próximos 7 días.
          </span>
          <button
            className="btn btn-sm"
            style={{ background: '#d97706', color: '#fff', border: 'none', whiteSpace: 'nowrap' }}
            onClick={handleExtend}
            disabled={actionLoading === 'extend'}
          >
            {actionLoading === 'extend' ? 'Extendiendo…' : 'Extender 30 días'}
          </button>
        </div>
      )}

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Buscador */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Buscar por usuario, acción o recurso…"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          style={{ flex: 1, maxWidth: 400 }}
        />
        <button type="submit" className="btn btn-primary btn-sm">Buscar</button>
        {search && (
          <button type="button" className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}>
            Limpiar
          </button>
        )}
      </form>

      {loading ? (
        <p className="text-muted">Cargando…</p>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          {search ? 'No se encontraron registros con esa búsqueda.' : 'No hay registros de actividad aún.'}
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Acción</th>
                  <th>Recurso</th>
                  <th>IP</th>
                  <th>Vence</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const roleStyle = roleColors[log.userRole] || { bg: 'rgba(156,163,175,0.15)', color: 'var(--text-muted)' };
                  const daysLeft = Math.ceil((new Date(log.expiresAt) - Date.now()) / 86400000);
                  return (
                    <tr key={log._id}>
                      <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                        {formatDate(log.createdAt)}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{log.userName}</div>
                        {log.userEmail && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{log.userEmail}</div>}
                      </td>
                      <td>
                        <span style={{ background: roleStyle.bg, color: roleStyle.color, borderRadius: 10, padding: '2px 8px', fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {log.userRole || 'público'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.88rem' }}>{log.action}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{log.resource || '—'}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{log.ip || '—'}</td>
                      <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        <span style={{ color: daysLeft <= 7 ? '#d97706' : 'var(--text-muted)' }}>
                          {daysLeft > 0 ? `${daysLeft}d` : 'Hoy'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm"
                          style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '2px 8px', fontSize: '0.78rem' }}
                          onClick={() => handleDelete(log._id)}
                          disabled={actionLoading === log._id}
                        >
                          {actionLoading === log._id ? '…' : '×'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Anterior</button>
              <span style={{ padding: '0.4rem 0.75rem', color: 'var(--text-muted)' }}>{page} / {pages}</span>
              <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>Siguiente →</button>
            </div>
          )}
        </>
      )}

      {/* Confirm eliminar todo */}
      {confirmDeleteAll && (
        <div className="modal-overlay" onClick={() => setConfirmDeleteAll(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <h3 style={{ marginTop: 0 }}>¿Eliminar todos los registros?</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Se eliminarán <strong>{total} registros</strong> permanentemente. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setConfirmDeleteAll(false)}>Cancelar</button>
              <button
                className="btn"
                style={{ background: '#ef4444', color: '#fff', border: 'none' }}
                onClick={handleDeleteAll}
                disabled={actionLoading === 'all'}
              >
                {actionLoading === 'all' ? 'Eliminando…' : 'Eliminar todo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
