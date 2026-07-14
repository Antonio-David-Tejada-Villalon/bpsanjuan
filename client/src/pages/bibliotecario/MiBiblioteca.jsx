import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getLibrary } from '../../api/libraries';
import { getMySubmission, createSubmission } from '../../api/librarySubmissions';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DESC_MAX = 2000;

const emptyForm = {
  name: '',
  foundedDay: '',
  foundedMonth: '',
  foundedYear: '',
  address: { street: '', locality: '', mapsUrl: '' },
  contact: { phone: '', whatsapp: '', email: '', website: '' },
  socialMedia: { facebook: '', instagram: '', youtube: '' },
  digibepe: '',
  schedule: [],
  description: '',
  services: '',
  thumbnail: '',
  images: ''
};

const toForm = (source) => ({
  name: source.name || '',
  foundedDay:   source.foundedDay   || '',
  foundedMonth: source.foundedMonth || '',
  foundedYear:  source.foundedYear  || '',
  address: { street: source.address?.street || '', locality: source.address?.locality || '', mapsUrl: source.address?.mapsUrl || '' },
  contact: { phone: source.contact?.phone || '', whatsapp: source.contact?.whatsapp || '', email: source.contact?.email || '', website: source.contact?.website || '' },
  socialMedia: { facebook: source.socialMedia?.facebook || '', instagram: source.socialMedia?.instagram || '', youtube: source.socialMedia?.youtube || '' },
  digibepe: source.digibepe || '',
  schedule: source.schedule || [],
  description: source.description || '',
  services: (source.services || []).join(', '),
  thumbnail: source.thumbnail || '',
  images: (source.images || []).join('\n')
});

export default function MiBiblioteca() {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user.assignedLibrary) {
      setLoading(false);
      return;
    }
    Promise.all([
      getLibrary(user.assignedLibrary._id),
      getMySubmission()
    ]).then(([libraryRes, submissionRes]) => {
      const sub = submissionRes.submission;
      setSubmission(sub);
      // Si hay un borrador pendiente o rechazado, seguimos editando ese borrador;
      // si no, partimos de los datos ya publicados.
      const source = sub && sub.status !== 'approved' ? sub.changes : libraryRes.library;
      setForm(toForm(source));
    }).catch(() => setError('No se pudo cargar la información de la biblioteca.'))
      .finally(() => setLoading(false));
  }, []);

  const addScheduleRow = () => {
    setForm({ ...form, schedule: [...form.schedule, { day: DAYS[0], open: '', close: '' }] });
  };

  const updateScheduleRow = (index, field, value) => {
    const schedule = [...form.schedule];
    schedule[index] = { ...schedule[index], [field]: value };
    setForm({ ...form, schedule });
  };

  const removeScheduleRow = (index) => {
    setForm({ ...form, schedule: form.schedule.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { submission: updated } = await createSubmission({
        name: form.name,
        foundedDay:   form.foundedDay   ? Number(form.foundedDay)   : undefined,
        foundedMonth: form.foundedMonth ? Number(form.foundedMonth) : undefined,
        foundedYear:  form.foundedYear  ? Number(form.foundedYear)  : undefined,
        address: form.address,
        contact: form.contact,
        socialMedia: form.socialMedia,
        digibepe: form.digibepe || null,
        schedule: form.schedule,
        description: form.description,
        services: form.services.split(',').map(s => s.trim()).filter(Boolean),
        thumbnail: form.thumbnail || null,
        images: form.images.split('\n').map(s => s.trim()).filter(Boolean)
      });
      setSubmission(updated);
      setSuccess('Cambios enviados. Quedan pendientes de aprobación de un supervisor o administrador.');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'No se pudieron enviar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  if (!user.assignedLibrary) {
    return (
      <div>
        <p className="empty-state">Todavía no tenés una biblioteca asignada. Contactá al administrador.</p>
      </div>
    );
  }

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div>
      <p className="section-subtitle" style={{ marginBottom: 24 }}>
        Editá la información pública de <strong>{user.assignedLibrary.name}</strong>. Los cambios quedan pendientes de aprobación antes de publicarse.
      </p>

      {submission?.status === 'pending' && (
        <div className="alert alert-warning">
          Tu edición del {new Date(submission.updatedAt).toLocaleDateString('es-AR')} está pendiente de aprobación. Podés seguir editando: se actualiza la misma edición pendiente.
        </div>
      )}
      {submission?.status === 'rejected' && (
        <div className="alert alert-error">
          Se rechazó tu última edición: {submission.rejectionReason}. Corregí lo que haga falta y volvé a enviar. Podés ver el detalle en la pestaña "Mensajes".
        </div>
      )}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} style={{ maxWidth: 640, margin: '0 auto', textAlign: 'left' }}>
        <div className="field">
          <label>Nombre</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        </div>

        <div className="field">
          <label>Localidad</label>
          <input value={form.address.locality} onChange={e => setForm({ ...form, address: { ...form.address, locality: e.target.value } })} placeholder="Ej: Caucete, Rivadavia…" />
        </div>

        <div className="form-grid">
          <div className="field">
            <label>Calle y número</label>
            <input value={form.address.street} onChange={e => setForm({ ...form, address: { ...form.address, street: e.target.value } })} placeholder="Ej: Av. San Martín 1234" />
          </div>
          <div className="field">
            <label>Link de Google Maps <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--text-soft)' }}>(solo lo ve el staff)</span></label>
            <input value={form.address.mapsUrl} onChange={e => setForm({ ...form, address: { ...form.address, mapsUrl: e.target.value } })} placeholder="https://maps.google.com/..." />
          </div>
        </div>

        <div className="field">
          <label>Fecha de fundación</label>
          <div className="form-grid" style={{ gridTemplateColumns: '80px 1fr 100px', gap: 10 }}>
            <input
              type="number" placeholder="Día" min={1} max={31}
              value={form.foundedDay}
              onChange={e => setForm({ ...form, foundedDay: e.target.value })}
            />
            <select value={form.foundedMonth} onChange={e => setForm({ ...form, foundedMonth: e.target.value })}>
              <option value="">Mes…</option>
              {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
            <input
              type="number" placeholder="Año" min={1800} max={new Date().getFullYear()}
              value={form.foundedYear}
              onChange={e => setForm({ ...form, foundedYear: e.target.value })}
            />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>El día y el mes son opcionales — podés ingresar solo el año.</span>
        </div>

        <div className="field">
          <label>Descripción</label>
          <textarea rows={5} maxLength={DESC_MAX} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <span style={{ fontSize: 12, color: 'var(--text-soft)', textAlign: 'right', display: 'block' }}>
            {form.description.length}/{DESC_MAX} caracteres
          </span>
        </div>

        <div className="form-grid">
          <div className="field">
            <label>Teléfono fijo</label>
            <input value={form.contact.phone} onChange={e => setForm({ ...form, contact: { ...form.contact, phone: e.target.value } })} placeholder="Ej: 0264-4xxxxxx" />
          </div>
          <div className="field">
            <label>WhatsApp</label>
            <input value={form.contact.whatsapp} onChange={e => setForm({ ...form, contact: { ...form.contact, whatsapp: e.target.value } })} placeholder="Ej: 5492644xxxxxx (con código país)" />
          </div>
        </div>
        <div className="form-grid">
          <div className="field">
            <label>Email</label>
            <input value={form.contact.email} onChange={e => setForm({ ...form, contact: { ...form.contact, email: e.target.value } })} />
          </div>
          <div className="field">
            <label>DigiBepe</label>
            <input value={form.contact.website} onChange={e => setForm({ ...form, contact: { ...form.contact, website: e.target.value } })} placeholder="http://XXXX.bepe.ar/" />
          </div>
        </div>

        <p className="form-section-label">Redes sociales y web</p>
        <div className="form-grid">
          <div className="field">
            <label>Facebook</label>
            <input value={form.socialMedia.facebook} onChange={e => setForm({ ...form, socialMedia: { ...form.socialMedia, facebook: e.target.value } })} placeholder="https://facebook.com/..." />
          </div>
          <div className="field">
            <label>Instagram</label>
            <input value={form.socialMedia.instagram} onChange={e => setForm({ ...form, socialMedia: { ...form.socialMedia, instagram: e.target.value } })} placeholder="https://instagram.com/..." />
          </div>
        </div>
        <div className="form-grid">
          <div className="field">
            <label>YouTube</label>
            <input value={form.socialMedia.youtube} onChange={e => setForm({ ...form, socialMedia: { ...form.socialMedia, youtube: e.target.value } })} placeholder="https://youtube.com/..." />
          </div>
          <div className="field">
            <label>Sitio web</label>
            <input value={form.digibepe} onChange={e => setForm({ ...form, digibepe: e.target.value })} placeholder="https://..." />
          </div>
        </div>

        <div className="field">
          <label>Horarios de atención</label>
          {form.schedule.map((row, i) => (
            <div key={i} className="form-grid" style={{ gridTemplateColumns: '1.4fr 1fr 1fr auto', alignItems: 'center', marginBottom: 8 }}>
              <select value={row.day} onChange={e => updateScheduleRow(i, 'day', e.target.value)}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input placeholder="Apertura" value={row.open} onChange={e => updateScheduleRow(i, 'open', e.target.value)} />
              <input placeholder="Cierre" value={row.close} onChange={e => updateScheduleRow(i, 'close', e.target.value)} />
              <button type="button" className="btn btn-danger btn-sm" onClick={() => removeScheduleRow(i)}>✕</button>
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-sm" onClick={addScheduleRow}>+ Agregar horario</button>
        </div>

        <div className="field">
          <label>Servicios (separados por coma)</label>
          <input value={form.services} onChange={e => setForm({ ...form, services: e.target.value })} placeholder="Préstamo de libros, Talleres, Sala de lectura" />
        </div>

        <div className="field">
          <label>Imagen de portada (URL)</label>
          <input value={form.thumbnail} onChange={e => setForm({ ...form, thumbnail: e.target.value })} />
        </div>

        <div className="field">
          <label>Galería de imágenes (una URL por línea)</label>
          <textarea rows={4} value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Enviando…' : 'Enviar para aprobación'}
          </button>
        </div>
      </form>
    </div>
  );
}
