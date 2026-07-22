import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getNewsletterSubscribers } from '@/features/newsletter/api/newsletter';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function downloadCsv(subscribers) {
  const rows = [['Email', 'Suscripto el'], ...subscribers.map(s => [s.email, formatDate(s.subscribedAt)])];
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `newsletter-suscriptores-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function NewsletterSubscribers() {
  const { user } = useAuth();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canView = user.role === 'admin' || user.role === 'supervisor';

  useEffect(() => {
    if (!canView) { setLoading(false); return; }
    getNewsletterSubscribers()
      .then(data => setSubscribers(data.subscribers))
      .catch(() => setError('No se pudo cargar la lista de suscriptores.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!canView) return <p className="empty-state">No tenés permisos para ver esta sección.</p>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="admin-toolbar">
        <h2>Newsletter</h2>
        <button className="btn btn-outline" onClick={() => downloadCsv(subscribers)} disabled={subscribers.length === 0}>
          Exportar CSV
        </button>
      </div>

      <p className="section-subtitle" style={{ textAlign: 'left', marginBottom: 16 }}>
        {subscribers.length} suscriptor{subscribers.length !== 1 ? 'es' : ''} a las novedades del sitio. Esta lista solo
        registra los emails que se cargan desde el formulario de la sección "Newsletter" en el Home — el sitio todavía
        no envía correos automáticamente, así que el envío de novedades a esta lista se hace manualmente (por ejemplo
        exportando el CSV e importándolo a un servicio de email como Mailchimp).
      </p>

      {subscribers.length === 0 ? (
        <p className="empty-state">Todavía no hay suscriptores.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Suscripto el</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map(s => (
                <tr key={s._id}>
                  <td>{s.email}</td>
                  <td>{formatDate(s.subscribedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
