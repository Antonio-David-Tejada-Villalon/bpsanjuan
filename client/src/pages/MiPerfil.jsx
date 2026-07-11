import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyPublicProfile, updatePublicProfile } from '../api/publicUsersApi';
import api from '../api/axios';

const roleLabel = { admin: 'Administrador', supervisor: 'Supervisor', bibliotecario: 'Bibliotecario' };

function Avatar({ name, picture, size = 80 }) {
  if (picture) {
    return (
      <img
        src={picture}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
      />
    );
  }
  const initials = name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--primary)', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.35,
      border: '3px solid var(--primary)',
      flexShrink: 0
    }}>
      {initials}
    </div>
  );
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ── Perfil para usuarios públicos (Google) ───────────────────────────────────
function PublicProfile({ publicUser: ctxPublicUser }) {
  const { setPublicSession } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    getMyPublicProfile()
      .then(data => {
        setProfile(data.publicUser);
        setBioInput(data.publicUser.bio || '');
      })
      .catch(() => setError('No se pudo cargar el perfil.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveBio = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      await updatePublicProfile({ bio: bioInput.trim() || null });
      setProfile(p => ({ ...p, bio: bioInput.trim() || null }));
      setSaveMsg('Guardado.');
      setEditing(false);
    } catch {
      setSaveMsg('Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-muted">Cargando perfil…</p>;
  if (error) return <p style={{ color: 'var(--danger)' }}>{error}</p>;
  if (!profile) return null;

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <Avatar name={profile.name} picture={profile.picture} size={88} />
        <div className="perfil-header-info">
          <h2 style={{ margin: 0 }}>{profile.name}</h2>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{profile.email}</span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Miembro desde {formatDate(profile.createdAt)}
          </span>
        </div>
      </div>

      <div className="perfil-bio-section">
        {editing ? (
          <form onSubmit={handleSaveBio} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Bio <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(máx. 200 caracteres)</span></label>
            <textarea
              className="form-input"
              value={bioInput}
              onChange={e => setBioInput(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="Contá algo sobre vos…"
              style={{ resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditing(false); setBioInput(profile.bio || ''); }}>Cancelar</button>
              {saveMsg && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{saveMsg}</span>}
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              {profile.bio
                ? <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--text)' }}>"{profile.bio}"</p>
                : <p style={{ margin: 0, color: 'var(--text-muted)' }}>Sin bio — <button className="link-btn" onClick={() => setEditing(true)}>Agregar</button></p>
              }
            </div>
            {profile.bio && (
              <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>Editar bio</button>
            )}
          </div>
        )}
      </div>

      <div className="perfil-stats">
        <div className="perfil-stat">
          <span className="perfil-stat-value">{profile.likedLibraries?.length ?? 0}</span>
          <span className="perfil-stat-label">Bibliotecas con me gusta</span>
        </div>
      </div>

      {profile.likedLibraries?.length > 0 && (
        <div className="perfil-section">
          <h3>Bibliotecas que me gustan</h3>
          <div className="perfil-liked-grid">
            {profile.likedLibraries.map(lib => (
              <Link key={lib._id} to={`/bibliotecas/${lib._id}`} className="perfil-liked-card">
                {lib.thumbnail
                  ? <img src={lib.thumbnail} alt={lib.name} />
                  : <div className="perfil-liked-placeholder">📚</div>
                }
                <span>{lib.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Perfil para usuarios staff (admin/supervisor/bibliotecario) ───────────────
function StaffProfile({ user }) {
  const [changing, setChanging] = useState(false);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', error: false });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: '', error: false });
    if (form.newPassword !== form.confirmPassword) {
      setMsg({ text: 'Las contraseñas nuevas no coinciden.', error: true });
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.newPassword)) {
      setMsg({ text: 'Mínimo 8 caracteres, una mayúscula, una minúscula y un número.', error: true });
      return;
    }
    setSaving(true);
    try {
      await api.patch('/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      setMsg({ text: 'Contraseña actualizada correctamente.', error: false });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setChanging(false);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Error al cambiar la contraseña.', error: true });
    } finally {
      setSaving(false);
    }
  };

  const EyeIcon = ({ visible }) => visible
    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <Avatar name={user.name} size={88} />
        <div className="perfil-header-info">
          <h2 style={{ margin: 0 }}>{user.name}</h2>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.email}</span>
          <span className="comment-role-badge" style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }}>
            {roleLabel[user.role] || user.role}
          </span>
        </div>
      </div>

      <div className="perfil-info-grid">
        {user.assignedLibrary && (
          <div className="perfil-info-item">
            <span className="perfil-info-label">Biblioteca asignada</span>
            <Link to={`/bibliotecas/${user.assignedLibrary._id}`} style={{ color: 'var(--primary)', fontWeight: 500 }}>
              {user.assignedLibrary.name}
            </Link>
          </div>
        )}
        {user.lastLogin && (
          <div className="perfil-info-item">
            <span className="perfil-info-label">Último acceso</span>
            <span>{formatDate(user.lastLogin)}</span>
          </div>
        )}
      </div>

      <div className="perfil-section">
        {!changing ? (
          <button className="btn btn-outline btn-sm" onClick={() => setChanging(true)}>
            Cambiar contraseña
          </button>
        ) : (
          <form onSubmit={handleSubmit} style={{ maxWidth: 380 }}>
            <h3 style={{ marginTop: 0 }}>Cambiar contraseña</h3>
            {['current', 'new', 'confirm'].map((field, i) => {
              const nameMap = { current: 'currentPassword', new: 'newPassword', confirm: 'confirmPassword' };
              const labelMap = { current: 'Contraseña actual', new: 'Nueva contraseña', confirm: 'Confirmar nueva contraseña' };
              return (
                <div key={field} style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    {labelMap[field]}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPwd[field] ? 'text' : 'password'}
                      name={nameMap[field]}
                      className="form-input"
                      value={form[nameMap[field]]}
                      onChange={handleChange}
                      required
                      style={{ paddingRight: '2.5rem', width: '100%' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(s => ({ ...s, [field]: !s[field] }))}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                    >
                      <EyeIcon visible={showPwd[field]} />
                    </button>
                  </div>
                </div>
              );
            })}
            <small style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Mínimo 8 caracteres, una mayúscula, una minúscula y un número.
            </small>
            {msg.text && (
              <p style={{ color: msg.error ? 'var(--danger, #ef4444)' : 'var(--success, #16a34a)', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                {msg.text}
              </p>
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => { setChanging(false); setMsg({ text: '', error: false }); }}>Cancelar</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function MiPerfil() {
  const { user, publicUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !publicUser) navigate('/login');
  }, [user, publicUser, navigate]);

  if (!user && !publicUser) return null;

  return (
    <div className="section container" style={{ maxWidth: 720 }}>
      <h1 style={{ marginBottom: '0.25rem' }}>Mi Perfil</h1>
      <p className="section-subtitle" style={{ marginBottom: '2rem' }}>
        {user ? 'Información de tu cuenta de staff.' : 'Tu cuenta en la comunidad de Bibliotecas Populares.'}
      </p>

      {user
        ? <StaffProfile user={user} />
        : <PublicProfile publicUser={publicUser} />
      }
    </div>
  );
}
