import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPendingSubmissions, getSubmission, approveSubmission, rejectSubmission, deleteSubmission } from '../../api/librarySubmissions';

const formatValue = (val) => {
  if (val === undefined || val === null || val === '') return '(vacío)';
  if (Array.isArray(val)) return val.length ? val.join(', ') : '(vacío)';
  return String(val);
};

const scheduleToString = (schedule) =>
  (schedule || []).map(s => `${s.day} ${s.open}-${s.close}`).join(' | ') || '(vacío)';

// Campos comparables entre la biblioteca publicada y el borrador propuesto
const FIELDS = [
  { label: 'Nombre', current: l => l.name, proposed: c => c.name },
  { label: 'Año de fundación', current: l => l.foundedYear, proposed: c => c.foundedYear },
  { label: 'Calle', current: l => l.address?.street, proposed: c => c.address?.street },
  { label: 'Localidad', current: l => l.address?.locality, proposed: c => c.address?.locality },
  { label: 'Teléfono', current: l => l.contact?.phone, proposed: c => c.contact?.phone },
  { label: 'Email', current: l => l.contact?.email, proposed: c => c.contact?.email },
  { label: 'Sitio web', current: l => l.contact?.website, proposed: c => c.contact?.website },
  { label: 'Facebook', current: l => l.socialMedia?.facebook, proposed: c => c.socialMedia?.facebook },
  { label: 'Instagram', current: l => l.socialMedia?.instagram, proposed: c => c.socialMedia?.instagram },
  { label: 'YouTube', current: l => l.socialMedia?.youtube, proposed: c => c.socialMedia?.youtube },
  { label: 'Descripción', current: l => l.description, proposed: c => c.description },
  { label: 'Servicios', current: l => l.services, proposed: c => c.services },
  { label: 'Imagen de portada', current: l => l.thumbnail, proposed: c => c.thumbnail },
  { label: 'Galería', current: l => l.images, proposed: c => c.images },
  { label: 'Horarios', current: l => scheduleToString(l.schedule), proposed: c => scheduleToString(c.schedule) }
];

export default function Aprobaciones() {
  const { user } = useAuth();
  const canManage = user.role === 'admin' || user.permissions?.canManageLibraries;

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { submissions } = await getPendingSubmissions();
      setSubmissions(submissions);
    } catch {
      setError('No se pudieron cargar las ediciones pendientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManage) load();
    else setLoading(false);
  }, []);

  const openDetail = async (id) => {
    setDetailLoading(true);
    setRejecting(false);
    setReason('');
    setDetail({});
    try {
      const { submission } = await getSubmission(id);
      setDetail(submission);
    } catch {
      setError('No se pudo cargar el detalle de la edición.');
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => setDetail(null);

  const handleApprove = async () => {
    setSaving(true);
    try {
      await approveSubmission(detail._id);
      closeDetail();
      load();
    } catch {
      setError('No se pudo aprobar la edición.');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) return;
    setSaving(true);
    try {
      await rejectSubmission(detail._id, reason.trim());
      closeDetail();
      load();
    } catch {
      setError('No se pudo rechazar la edición.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta edición pendiente sin aprobarla ni rechazarla? No se puede deshacer.')) return;
    try {
      await deleteSubmission(id);
      if (detail?._id === id) closeDetail();
      load();
    } catch {
      setError('No se pudo eliminar la edición.');
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!canManage) {
    return <p className="empty-state">No tenés permisos para gestionar aprobaciones.</p>;
  }

  const diffRows = detail?.library && detail?.changes
    ? FIELDS.map(f => ({
        label: f.label,
        current: formatValue(f.current(detail.library)),
        proposed: formatValue(f.proposed(detail.changes))
      })).filter(r => r.current !== r.proposed)
    : [];

  return (
    <div>
      <div className="admin-toolbar">
        <h2>Aprobaciones</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {submissions.length === 0 ? (
        <p className="empty-state">No hay ediciones pendientes de aprobación.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Biblioteca</th>
                <th>Enviado por</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(s => (
                <tr key={s._id}>
                  <td>{s.library?.name || '—'}</td>
                  <td>{s.submittedBy?.name || '—'}</td>
                  <td>{new Date(s.createdAt).toLocaleDateString('es-AR')}</td>
                  <td className="row-actions">
                    <button className="btn btn-outline btn-sm" onClick={() => openDetail(s._id)}>Revisar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div className="modal-overlay" onClick={closeDetail}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
            {detailLoading ? (
              <div className="page-loading"><div className="spinner" /></div>
            ) : (
              <>
                <h3>Revisar edición — {detail.library?.name}</h3>
                <p className="section-subtitle" style={{ textAlign: 'left' }}>
                  Enviado por {detail.submittedBy?.name} el {new Date(detail.createdAt).toLocaleString('es-AR')}
                </p>

                <div className="diff-table">
                  {diffRows.length === 0 && (
                    <p className="empty-state">No hay cambios respecto a la versión publicada.</p>
                  )}
                  {diffRows.map(row => (
                    <div key={row.label} className="diff-row">
                      <span className="diff-label">{row.label}</span>
                      <span className="diff-old">{row.current}</span>
                      <span className="diff-new">{row.proposed}</span>
                    </div>
                  ))}
                </div>

                {rejecting ? (
                  <div className="field" style={{ marginTop: 16 }}>
                    <label>Motivo del rechazo</label>
                    <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)} />
                    <div className="form-actions">
                      <button className="btn btn-outline" onClick={() => setRejecting(false)}>Cancelar</button>
                      <button className="btn btn-danger" disabled={saving || !reason.trim()} onClick={handleReject}>
                        {saving ? 'Rechazando…' : 'Confirmar rechazo'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="form-actions">
                    <button className="btn btn-outline" onClick={closeDetail}>Cerrar</button>
                    <button className="btn btn-danger" onClick={() => setRejecting(true)}>Rechazar</button>
                    <button className="btn btn-primary" disabled={saving} onClick={handleApprove}>
                      {saving ? 'Aprobando…' : 'Aprobar'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
