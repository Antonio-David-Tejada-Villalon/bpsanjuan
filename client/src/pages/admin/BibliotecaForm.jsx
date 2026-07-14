import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getLibrary, createLibrary, updateLibrary } from '../../api/libraries';
import { getDepartments } from '../../api/departments';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DESC_MAX = 2000;

const emptyForm = {
  name: '',
  department: '',
  address: { street: '', locality: '', zipCode: '', mapsUrl: '', lat: '', lng: '' },
  contact: { phone: '', whatsapp: '', email: '', website: '' },
  socialMedia: { facebook: '', instagram: '', youtube: '' },
  digibepe: '',
  thumbnail: '',
  images: '',
  schedule: [],
  description: '',
  services: '',
  conabipRegistered: false,
  foundedDay: '',
  foundedMonth: '',
  foundedYear: '',
  isActive: true,
};

export default function BibliotecaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const [deptRes] = await Promise.all([getDepartments()]);
        setDepartments(deptRes.departments);

        if (isEdit) {
          const lib = state?.library || (await getLibrary(id)).library;
          setForm({
            name:        lib.name || '',
            department:  lib.department?._id || lib.department || '',
            address:     { street: lib.address?.street || '', locality: lib.address?.locality || '', zipCode: lib.address?.zipCode || '', mapsUrl: lib.address?.mapsUrl || '', lat: lib.address?.lat ?? '', lng: lib.address?.lng ?? '' },
            contact:     { phone: lib.contact?.phone || '', whatsapp: lib.contact?.whatsapp || '', email: lib.contact?.email || '', website: lib.contact?.website || '' },
            socialMedia: { facebook: lib.socialMedia?.facebook || '', instagram: lib.socialMedia?.instagram || '', youtube: lib.socialMedia?.youtube || '' },
            digibepe:    lib.digibepe || '',
            thumbnail:   lib.thumbnail || '',
            images:      (lib.images || []).join('\n'),
            schedule:    lib.schedule || [],
            description: lib.description || '',
            services:    (lib.services || []).join(', '),
            conabipRegistered: !!lib.conabipRegistered,
            foundedDay:   lib.foundedDay  || '',
            foundedMonth: lib.foundedMonth || '',
            foundedYear:  lib.foundedYear  || '',
            isActive:    lib.isActive ?? true,
          });
        }
      } catch {
        setError('No se pudieron cargar los datos.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setAddr = (key, val) => setForm(f => ({ ...f, address: { ...f.address, [key]: val } }));
  const setContact = (key, val) => setForm(f => ({ ...f, contact: { ...f.contact, [key]: val } }));
  const setSocial = (key, val) => setForm(f => ({ ...f, socialMedia: { ...f.socialMedia, [key]: val } }));

  const addScheduleRow = () =>
    setForm(f => ({ ...f, schedule: [...f.schedule, { day: DAYS[0], open: '', close: '' }] }));

  const updateScheduleRow = (i, field, val) => {
    const s = [...form.schedule];
    s[i] = { ...s[i], [field]: val };
    setForm(f => ({ ...f, schedule: s }));
  };

  const removeScheduleRow = (i) =>
    setForm(f => ({ ...f, schedule: f.schedule.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        address: {
          ...form.address,
          lat: form.address.lat !== '' ? Number(form.address.lat) : undefined,
          lng: form.address.lng !== '' ? Number(form.address.lng) : undefined,
        },
        foundedYear:  form.foundedYear  ? Number(form.foundedYear)  : undefined,
        foundedMonth: form.foundedMonth ? Number(form.foundedMonth) : undefined,
        foundedDay:   form.foundedDay   ? Number(form.foundedDay)   : undefined,
        thumbnail: form.thumbnail || null,
        images: form.images ? form.images.split('\n').map(s => s.trim()).filter(Boolean) : [],
        services: form.services ? form.services.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      if (isEdit) await updateLibrary(id, payload);
      else await createLibrary(payload);
      navigate('/admin/bibliotecas');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Error al guardar la biblioteca.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="form-page">
      <div className="form-page-header">
        <button type="button" className="btn btn-outline btn-sm" onClick={() => navigate('/admin/bibliotecas')}>
          ← Volver
        </button>
        <h2>{isEdit ? `Editar: ${form.name}` : 'Nueva biblioteca'}</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-page-body">

        <fieldset className="form-section">
          <legend>Información general</legend>

          <div className="field">
            <label>Nombre *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>

          <div className="form-grid">
            <div className="field">
              <label>Departamento *</label>
              <select value={form.department} onChange={e => set('department', e.target.value)} required>
                <option value="">Seleccionar…</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Localidad</label>
              <input
                value={form.address.locality}
                onChange={e => setAddr('locality', e.target.value)}
                placeholder="Ej: Caucete, Rivadavia…"
              />
            </div>
          </div>

          <div className="field">
            <label>Fecha de fundación</label>
            <div className="form-grid" style={{ gridTemplateColumns: '80px 1fr 100px', gap: 10 }}>
              <input
                type="number"
                placeholder="Día"
                min={1} max={31}
                value={form.foundedDay}
                onChange={e => set('foundedDay', e.target.value)}
              />
              <select value={form.foundedMonth} onChange={e => set('foundedMonth', e.target.value)}>
                <option value="">Mes…</option>
                {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
              </select>
              <input
                type="number"
                placeholder="Año"
                min={1800} max={new Date().getFullYear()}
                value={form.foundedYear}
                onChange={e => set('foundedYear', e.target.value)}
              />
            </div>
            <span className="field-hint">El día y el mes son opcionales — podés ingresar solo el año.</span>
          </div>

          <div className="field">
            <label>Descripción</label>
            <textarea
              rows={4}
              maxLength={DESC_MAX}
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
            <span className="field-hint" style={{ textAlign: 'right', display: 'block' }}>
              {form.description.length}/{DESC_MAX} caracteres
            </span>
          </div>

          <div className="field">
            <label>Servicios (separados por coma)</label>
            <input value={form.services} onChange={e => set('services', e.target.value)} placeholder="Préstamo de libros, Talleres, Sala de lectura" />
          </div>

          <div className="form-grid">
            <div className="field field-checkbox">
              <input type="checkbox" checked={form.conabipRegistered} onChange={e => set('conabipRegistered', e.target.checked)} />
              <span>Registrada en CONABIP</span>
            </div>
            <div className="field field-checkbox">
              <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
              <span>Biblioteca activa</span>
            </div>
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>Dirección</legend>
          <div className="field">
            <label>Calle y número</label>
            <input value={form.address.street} onChange={e => setAddr('street', e.target.value)} placeholder="Av. San Martín 1234" />
          </div>
          <div className="field">
            <label>Link de Google Maps <span className="field-hint-inline">(el usuario solo ve la dirección de arriba)</span></label>
            <input value={form.address.mapsUrl} onChange={e => setAddr('mapsUrl', e.target.value)} placeholder="https://maps.google.com/..." />
          </div>
          <div className="form-grid">
            <div className="field">
              <label>Latitud</label>
              <input
                type="number"
                step="any"
                value={form.address.lat}
                onChange={e => setAddr('lat', e.target.value)}
                placeholder="-31.5375"
              />
            </div>
            <div className="field">
              <label>Longitud</label>
              <input
                type="number"
                step="any"
                value={form.address.lng}
                onChange={e => setAddr('lng', e.target.value)}
                placeholder="-68.5364"
              />
            </div>
          </div>
          <span className="field-hint">
            Para obtener las coordenadas: abrí Google Maps, buscá la biblioteca, hacé clic derecho sobre el pin y seleccioná <strong>"Copiar coordenadas"</strong>. El primer número es la latitud y el segundo la longitud.
          </span>
        </fieldset>

        <fieldset className="form-section">
          <legend>Contacto</legend>
          <div className="form-grid">
            <div className="field">
              <label>Teléfono fijo</label>
              <input value={form.contact.phone} onChange={e => setContact('phone', e.target.value)} placeholder="0264-4xxxxxx" />
            </div>
            <div className="field">
              <label>WhatsApp</label>
              <input value={form.contact.whatsapp} onChange={e => setContact('whatsapp', e.target.value)} placeholder="5492644xxxxxx" />
            </div>
          </div>
          <div className="form-grid">
            <div className="field">
              <label>Email</label>
              <input type="email" value={form.contact.email} onChange={e => setContact('email', e.target.value)} />
            </div>
            <div className="field">
              <label>DigiBepe</label>
              <input value={form.contact.website} onChange={e => setContact('website', e.target.value)} placeholder="http://XXXX.bepe.ar/" />
            </div>
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>Redes sociales y sitio web</legend>
          <div className="form-grid">
            <div className="field">
              <label>Facebook</label>
              <input value={form.socialMedia.facebook} onChange={e => setSocial('facebook', e.target.value)} placeholder="https://facebook.com/..." />
            </div>
            <div className="field">
              <label>Instagram</label>
              <input value={form.socialMedia.instagram} onChange={e => setSocial('instagram', e.target.value)} placeholder="https://instagram.com/..." />
            </div>
          </div>
          <div className="form-grid">
            <div className="field">
              <label>YouTube</label>
              <input value={form.socialMedia.youtube} onChange={e => setSocial('youtube', e.target.value)} placeholder="https://youtube.com/..." />
            </div>
            <div className="field">
              <label>Sitio web</label>
              <input value={form.digibepe} onChange={e => set('digibepe', e.target.value)} placeholder="https://..." />
            </div>
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>Horarios</legend>
          {form.schedule.map((row, i) => (
            <div key={i} className="form-grid" style={{ gridTemplateColumns: '1.4fr 1fr 1fr auto', alignItems: 'center', marginBottom: 8 }}>
              <select value={row.day} onChange={e => updateScheduleRow(i, 'day', e.target.value)}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input placeholder="Apertura" value={row.open}  onChange={e => updateScheduleRow(i, 'open',  e.target.value)} />
              <input placeholder="Cierre"   value={row.close} onChange={e => updateScheduleRow(i, 'close', e.target.value)} />
              <button type="button" className="btn btn-danger btn-sm" onClick={() => removeScheduleRow(i)}>✕</button>
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-sm" onClick={addScheduleRow}>+ Agregar horario</button>
        </fieldset>

        <fieldset className="form-section">
          <legend>Imágenes</legend>
          <div className="field">
            <label>Imagen de portada (URL)</label>
            <input value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)} placeholder="https://..." />
            {form.thumbnail && (
              <img src={form.thumbnail} alt="preview" style={{ marginTop: 8, maxHeight: 150, borderRadius: 8, objectFit: 'cover', width: '100%' }} onError={e => { e.target.style.display = 'none'; }} />
            )}
          </div>
          <div className="field">
            <label>Galería adicional (una URL por línea)</label>
            <textarea rows={3} value={form.images} onChange={e => set('images', e.target.value)} placeholder={'https://...\nhttps://...'} />
          </div>
        </fieldset>

        <div className="form-page-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/bibliotecas')}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear biblioteca'}
          </button>
        </div>
      </form>
    </div>
  );
}
