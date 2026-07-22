import { useEffect, useState } from 'react';
import { getDepartments, updateDepartment } from '@/features/departments/api/departments';

export default function GestionDepartamentos() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', thumbnail: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getDepartments()
      .then(data => setDepartments(data.departments || []))
      .catch(() => setError('Error al cargar departamentos.'))
      .finally(() => setLoading(false));
  }, []);

  const openEdit = (dept) => {
    setEditing(dept._id);
    setForm({ name: dept.name, description: dept.description || '', thumbnail: dept.thumbnail || '' });
    setError('');
    setSuccess('');
  };

  const closeEdit = () => { setEditing(null); setError(''); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { department } = await updateDepartment(editing, {
        name: form.name,
        description: form.description,
        thumbnail: form.thumbnail,
      });
      setDepartments(ds => ds.map(d => d._id === editing ? department : d));
      setSuccess(`"${department.name}" actualizado correctamente.`);
      setEditing(null);
    } catch {
      setError('Error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="admin-toolbar">
        <h2>Departamentos</h2>
        <span style={{ fontSize: 13, color: 'var(--text-soft)' }}>
          {departments.length} departamentos
        </span>
      </div>

      {success && <p className="alert alert-success">{success}</p>}
      {error && !editing && <p className="alert alert-error">{error}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Departamento</th>
              <th>Descripción</th>
              <th>Bibliotecas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(dept => (
              <tr key={dept._id}>
                <td>
                  {dept.thumbnail
                    ? <img src={dept.thumbnail} alt={dept.name} style={{ width: 64, height: 44, objectFit: 'cover', borderRadius: 8 }} />
                    : <span style={{ color: 'var(--text-soft)', fontSize: 12 }}>Sin imagen</span>
                  }
                </td>
                <td style={{ fontWeight: 600 }}>{dept.name}</td>
                <td style={{ maxWidth: 280, color: 'var(--text-soft)', fontSize: 13 }}>
                  {dept.description
                    ? dept.description.length > 80 ? dept.description.slice(0, 80) + '…' : dept.description
                    : '—'}
                </td>
                <td>{dept.libraryCount ?? 0}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(dept)}>
                      Editar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={closeEdit}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>Editar departamento</h3>
            {error && <p className="alert alert-error">{error}</p>}
            <form onSubmit={handleSave}>
              <div className="field">
                <label>Nombre</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label>Descripción</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Descripción breve del departamento"
                />
              </div>
              <div className="field">
                <label>URL de imagen (thumbnail)</label>
                <input
                  value={form.thumbnail}
                  onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))}
                  placeholder="https://i.ibb.co/..."
                />
                <span className="field-hint">
                  Usá <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer">imgbb.com</a> para subir fotos y obtener el "Direct link".
                </span>
              </div>
              {form.thumbnail && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 12, color: 'var(--text-soft)', marginBottom: 6 }}>Vista previa:</p>
                  <img
                    src={form.thumbnail}
                    alt="preview"
                    style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 10 }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={closeEdit}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
