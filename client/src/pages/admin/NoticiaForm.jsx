import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getAllNewsAdmin, createNews, updateNews } from '../../api/news';
import { getDepartments } from '../../api/departments';
import RichTextEditor from '../../components/RichTextEditor';

const emptyForm = {
  title: '',
  summary: '',
  thumbnail: '',
  images: [],
  content: '',
  tags: '',
  relatedDepartment: '',
  isPublished: false,
  publishedAt: '',
};

const isValidUrl = (url) => {
  try { return Boolean(new URL(url)); } catch { return false; }
};

export default function NoticiaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imgInput, setImgInput] = useState('');
  const [imgError, setImgError] = useState('');
  const imgInputRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const deptRes = await getDepartments();
        setDepartments(deptRes.departments);

        if (isEdit) {
          let item = state?.item;
          if (!item) {
            const all = await getAllNewsAdmin();
            item = all.news.find(n => n._id === id);
          }
          if (item) {
            setForm({
              title:             item.title || '',
              summary:           item.summary || '',
              thumbnail:         item.thumbnail || '',
              images:            item.images || [],
              content:           item.content || '',
              tags:              (item.tags || []).join(', '),
              relatedDepartment: item.relatedDepartment?._id || item.relatedDepartment || '',
              isPublished:       item.isPublished,
              publishedAt:       item.publishedAt ? new Date(item.publishedAt).toISOString().slice(0, 16) : '',
            });
          }
        }
      } catch {
        setError('No se pudieron cargar los datos.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const addImage = () => {
    const url = imgInput.trim();
    if (!url) return;
    if (!isValidUrl(url)) { setImgError('URL inválida.'); return; }
    if (form.images.includes(url)) { setImgError('Esta URL ya está en la galería.'); return; }
    setForm(f => ({ ...f, images: [...f.images, url] }));
    setImgInput('');
    setImgError('');
    imgInputRef.current?.focus();
  };

  const removeImage = (idx) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const moveImage = (from, to) => {
    setForm(f => {
      const imgs = [...f.images];
      const [item] = imgs.splice(from, 1);
      imgs.splice(to, 0, item);
      return { ...f, images: imgs };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        title:             form.title,
        summary:           form.summary,
        thumbnail:         form.thumbnail || null,
        images:            form.images,
        content:           form.content,
        tags:              form.tags.split(',').map(t => t.trim()).filter(Boolean),
        relatedDepartment: form.relatedDepartment || null,
        isPublished:       form.isPublished,
        publishedAt:       form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
      };
      if (isEdit) await updateNews(id, payload);
      else await createNews(payload);
      navigate('/admin/noticias');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Error al guardar la noticia.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="form-page">
      <div className="form-page-header">
        <button type="button" className="btn btn-outline btn-sm" onClick={() => navigate('/admin/noticias')}>
          ← Volver
        </button>
        <h2>{isEdit ? `Editar noticia` : 'Nueva noticia'}</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-page-body">

        <fieldset className="form-section">
          <legend>Información</legend>
          <div className="field">
            <label>Título *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required maxLength={200} />
          </div>
          <div className="field">
            <label>Resumen *</label>
            <textarea rows={2} maxLength={500} value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} required />
          </div>
          <div className="field">
            <label>Imagen de portada (URL)</label>
            <input value={form.thumbnail} onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))} placeholder="https://..." />
            {form.thumbnail && (
              <img src={form.thumbnail} alt="preview portada" style={{ marginTop: 8, maxHeight: 150, borderRadius: 8, objectFit: 'cover', width: '100%' }} onError={e => { e.target.style.display = 'none'; }} />
            )}
          </div>
        </fieldset>

        {/* ── Galería carousel ── */}
        <fieldset className="form-section">
          <legend>Galería de fotos <span className="field-hint-inline">(carousel en el artículo)</span></legend>

          <div className="field">
            <label>Agregar foto (URL)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                ref={imgInputRef}
                value={imgInput}
                onChange={e => { setImgInput(e.target.value); setImgError(''); }}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
                placeholder="https://..."
                style={{ flex: 1 }}
              />
              <button type="button" className="btn btn-outline btn-sm" onClick={addImage} style={{ whiteSpace: 'nowrap' }}>
                + Agregar
              </button>
            </div>
            {imgError && <span className="field-hint" style={{ color: 'var(--error, #c0392b)' }}>{imgError}</span>}
            <span className="field-hint">Presioná Enter o el botón para añadir. El orden determina cómo aparecen en el carousel.</span>
          </div>

          {form.images.length > 0 && (
            <div className="img-gallery-grid">
              {form.images.map((src, i) => (
                <div key={src + i} className="img-gallery-item">
                  <img
                    src={src}
                    alt={`Foto ${i + 1}`}
                    className="img-gallery-thumb"
                    onError={e => { e.target.style.opacity = '0.3'; }}
                  />
                  <div className="img-gallery-controls">
                    <span className="img-gallery-index">{i + 1}</span>
                    <div className="img-gallery-actions">
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={() => moveImage(i, i - 1)}
                        disabled={i === 0}
                        aria-label="Mover hacia atrás"
                        title="Mover hacia atrás"
                      >←</button>
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={() => moveImage(i, i + 1)}
                        disabled={i === form.images.length - 1}
                        aria-label="Mover hacia adelante"
                        title="Mover hacia adelante"
                      >→</button>
                      <button
                        type="button"
                        className="btn btn-danger btn-xs"
                        onClick={() => removeImage(i)}
                        aria-label="Eliminar foto"
                        title="Eliminar"
                      >✕</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {form.images.length === 0 && (
            <p className="field-hint" style={{ textAlign: 'center', padding: '1rem 0' }}>
              Sin fotos de galería. Las fotos agregadas aparecerán como carousel al final del artículo.
            </p>
          )}
        </fieldset>

        <fieldset className="form-section">
          <legend>Contenido</legend>
          <div className="field">
            <RichTextEditor
              value={form.content}
              onChange={val => setForm(f => ({ ...f, content: val }))}
              placeholder="Escribí el contenido de la noticia aquí…"
            />
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>Clasificación y publicación</legend>
          <div className="form-grid">
            <div className="field">
              <label>Etiquetas (separadas por coma)</label>
              <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="cultura, libros, evento" />
            </div>
            <div className="field">
              <label>Departamento relacionado (opcional)</label>
              <select value={form.relatedDepartment} onChange={e => setForm(f => ({ ...f, relatedDepartment: e.target.value }))}>
                <option value="">Ninguno</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="field field-checkbox">
            <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} />
            <span>Publicar inmediatamente</span>
          </div>
          <div className="field">
            <label>Fecha y hora de publicación</label>
            <input
              type="datetime-local"
              value={form.publishedAt}
              onChange={e => setForm(f => ({ ...f, publishedAt: e.target.value }))}
            />
            <span className="field-hint">
              {form.publishedAt
                ? `Se mostrará como: ${new Date(form.publishedAt).toLocaleString('es-AR', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}`
                : 'Si se deja vacío y se publica, se usa la fecha/hora actual.'}
            </span>
          </div>
        </fieldset>

        <div className="form-page-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/noticias')}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear noticia'}
          </button>
        </div>
      </form>
    </div>
  );
}
