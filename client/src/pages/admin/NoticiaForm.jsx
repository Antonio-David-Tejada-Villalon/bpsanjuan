import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getAllNewsAdmin, createNews, updateNews } from '../../api/news';
import { getDepartments } from '../../api/departments';
import RichTextEditor from '../../components/RichTextEditor';

const emptyForm = {
  title: '',
  summary: '',
  thumbnail: '',
  content: '',
  tags: '',
  relatedDepartment: '',
  isPublished: false,
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
              content:           item.content || '',
              tags:              (item.tags || []).join(', '),
              relatedDepartment: item.relatedDepartment?._id || item.relatedDepartment || '',
              isPublished:       item.isPublished,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        title:             form.title,
        summary:           form.summary,
        thumbnail:         form.thumbnail || null,
        content:           form.content,
        tags:              form.tags.split(',').map(t => t.trim()).filter(Boolean),
        relatedDepartment: form.relatedDepartment || null,
        isPublished:       form.isPublished,
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
