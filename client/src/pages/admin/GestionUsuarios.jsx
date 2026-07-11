import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as usersApi from '../../api/users';
import { getLibraries } from '../../api/libraries';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'bibliotecario',
  assignedLibrary: '',
  permissions: { canEditDepartments: false, canManageNews: false, canManageLibraries: false }
};

export default function GestionUsuarios() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // 'create' | 'edit' | 'reset' | null
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [usersRes, librariesRes] = await Promise.all([
        usersApi.getUsers(),
        getLibraries({ limit: 100 })
      ]);
      setUsers(usersRes.users);
      setLibraries(librariesRes.libraries);
    } catch {
      setError('No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser.role === 'admin') load();
    else setLoading(false);
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setFormError('');
    setModal('create');
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      assignedLibrary: user.assignedLibrary?._id || '',
      permissions: {
        canEditDepartments: !!user.permissions?.canEditDepartments,
        canManageNews: !!user.permissions?.canManageNews,
        canManageLibraries: !!user.permissions?.canManageLibraries
      }
    });
    setFormError('');
    setModal('edit');
  };

  const openReset = (user) => {
    setEditingUser(user);
    setNewPassword('');
    setFormError('');
    setModal('reset');
  };

  const closeModal = () => {
    setModal(null);
    setEditingUser(null);
    setShowPassword(false);
    setShowNewPassword(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = { ...form };
      if (payload.role !== 'bibliotecario') delete payload.assignedLibrary;
      if (payload.role !== 'supervisor') delete payload.permissions;
      await usersApi.createUser(payload);
      closeModal();
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Error al crear el usuario.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        assignedLibrary: form.role === 'bibliotecario' ? (form.assignedLibrary || null) : null,
        permissions: form.role === 'supervisor' ? form.permissions : undefined
      };
      await usersApi.updateUser(editingUser._id, payload);
      closeModal();
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al actualizar el usuario.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword)) {
      setFormError('Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await usersApi.resetUserPassword(editingUser._id, newPassword);
      closeModal();
    } catch (err) {
      const data = err.response?.data;
      setFormError(data?.message || data?.errors?.[0]?.msg || 'Error al restablecer la contraseña.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user) => {
    if (user.isActive) {
      if (!confirm(`¿Desactivar a ${user.name}?`)) return;
      await usersApi.updateUser(user._id, { isActive: false });
    } else {
      await usersApi.updateUser(user._id, { isActive: true });
    }
    load();
  };

  const handleDelete = async (user) => {
    if (!confirm(`¿Eliminar definitivamente a ${user.name}? Esta acción no se puede deshacer.`)) return;
    try {
      await usersApi.deleteUser(user._id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar el usuario.');
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (currentUser.role !== 'admin') {
    return <p className="empty-state">Solo el administrador puede gestionar usuarios.</p>;
  }
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="admin-toolbar">
        <h2>Usuarios del staff</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Nuevo usuario</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Biblioteca / Permisos</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className="badge">{u.role}</span></td>
                <td>
                  {u.role === 'bibliotecario' && (u.assignedLibrary?.name || '—')}
                  {u.role === 'supervisor' && Object.entries(u.permissions || {})
                    .filter(([, v]) => v).map(([k]) => k).join(', ') || (u.role === 'supervisor' ? '—' : '')}
                  {u.role === 'admin' && '—'}
                </td>
                <td>{u.isActive ? 'Activo' : 'Inactivo'}</td>
                <td className="row-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(u)}>Editar</button>
                  <button className="btn btn-outline btn-sm" onClick={() => openReset(u)}>Resetear pass.</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleToggleActive(u)}>
                    {u.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                  {u._id !== currentUser._id && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u)}>Eliminar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal === 'create' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>Nuevo usuario</h3>
            {formError && <div className="alert alert-error">{formError}</div>}
            <form onSubmit={handleCreate}>
              <div className="field">
                <label>Nombre</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="field">
                <label>Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', padding: 0, lineHeight: 1 }}
                    title={showPassword ? 'Ocultar' : 'Mostrar'}
                  >
                    {showPassword
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
                <small style={{ color: 'var(--text-soft)', marginTop: 4, display: 'block' }}>
                  Mínimo 8 caracteres, una mayúscula, una minúscula y un número.
                </small>
              </div>
              <div className="field">
                <label>Rol</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="admin">Administrador</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="bibliotecario">Bibliotecario</option>
                </select>
              </div>
              {form.role === 'bibliotecario' && (
                <div className="field">
                  <label>Biblioteca asignada</label>
                  <select value={form.assignedLibrary} onChange={e => setForm({ ...form, assignedLibrary: e.target.value })}>
                    <option value="">Sin asignar</option>
                    {libraries.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                  </select>
                </div>
              )}
              {form.role === 'supervisor' && <PermissionsFields form={form} setForm={setForm} />}
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando…' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'edit' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>Editar usuario</h3>
            {formError && <div className="alert alert-error">{formError}</div>}
            <form onSubmit={handleEdit}>
              <div className="field">
                <label>Nombre</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="field">
                <label>Rol</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="admin">Administrador</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="bibliotecario">Bibliotecario</option>
                </select>
              </div>
              {form.role === 'bibliotecario' && (
                <div className="field">
                  <label>Biblioteca asignada</label>
                  <select value={form.assignedLibrary} onChange={e => setForm({ ...form, assignedLibrary: e.target.value })}>
                    <option value="">Sin asignar</option>
                    {libraries.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                  </select>
                </div>
              )}
              {form.role === 'supervisor' && <PermissionsFields form={form} setForm={setForm} />}
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'reset' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>Restablecer contraseña de {editingUser.name}</h3>
            {formError && <div className="alert alert-error">{formError}</div>}
            <form onSubmit={handleReset}>
              <div className="field">
                <label>Nueva contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(v => !v)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', padding: 0, lineHeight: 1 }}
                    title={showNewPassword ? 'Ocultar' : 'Mostrar'}
                  >
                    {showNewPassword
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
                <small style={{ color: 'var(--text-soft)', marginTop: 4, display: 'block' }}>
                  Mínimo 8 caracteres, una mayúscula, una minúscula y un número.
                </small>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando…' : 'Restablecer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PermissionsFields({ form, setForm }) {
  const togglePerm = (key) => {
    setForm({ ...form, permissions: { ...form.permissions, [key]: !form.permissions[key] } });
  };

  return (
    <div className="field">
      <label>Permisos de supervisor</label>
      <div className="field-checkbox">
        <input type="checkbox" checked={form.permissions.canEditDepartments} onChange={() => togglePerm('canEditDepartments')} />
        <span>Editar departamentos</span>
      </div>
      <div className="field-checkbox">
        <input type="checkbox" checked={form.permissions.canManageNews} onChange={() => togglePerm('canManageNews')} />
        <span>Gestionar noticias</span>
      </div>
      <div className="field-checkbox">
        <input type="checkbox" checked={form.permissions.canManageLibraries} onChange={() => togglePerm('canManageLibraries')} />
        <span>Gestionar bibliotecas</span>
      </div>
    </div>
  );
}
