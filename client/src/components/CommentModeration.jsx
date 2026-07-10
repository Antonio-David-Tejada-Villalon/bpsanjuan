import { useEffect, useState, useCallback } from 'react';
import { getLibraryComments, hideComment, restoreComment, deleteComment } from '../api/libraries';

export default function CommentModeration({ libraryId, canRestore = false, canHardDelete = false }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hidingId, setHidingId] = useState(null);
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    try {
      const { comments } = await getLibraryComments(libraryId);
      setComments(comments);
    } catch {
      setError('No se pudieron cargar los comentarios.');
    } finally {
      setLoading(false);
    }
  }, [libraryId]);

  useEffect(() => {
    load();
  }, [load]);

  const extractError = (err, fallback) =>
    err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || fallback;

  const handleHide = async (commentId) => {
    try {
      await hideComment(libraryId, commentId, reason.trim());
      setHidingId(null);
      setReason('');
      setError('');
      await load();
    } catch (err) {
      setError(extractError(err, 'No se pudo ocultar el comentario.'));
    }
  };

  const handleRestore = async (commentId) => {
    try {
      await restoreComment(libraryId, commentId);
      await load();
    } catch (err) {
      setError(extractError(err, 'No se pudo restaurar el comentario.'));
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('¿Eliminar este comentario definitivamente? No se puede deshacer.')) return;
    try {
      await deleteComment(libraryId, commentId);
      await load();
    } catch (err) {
      setError(extractError(err, 'No se pudo eliminar el comentario.'));
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="comment-moderation">
      {error && <p className="alert alert-error">{error}</p>}
      {comments.length === 0 && <p className="empty-state">Todavía no hay comentarios.</p>}

      <ul className="comment-list">
        {comments.map(c => (
          <li key={c._id} className={c.hidden ? 'comment-hidden' : ''}>
            <strong>{c.publicUser?.name || 'Usuario'}</strong>
            <p>{c.text}</p>

            {c.hidden ? (
              <div className="comment-mod-status">
                <span className="badge badge-warning">
                  Oculto{c.hiddenBy?.name ? ` por ${c.hiddenBy.name}` : ''}{c.hiddenReason ? `: ${c.hiddenReason}` : ''}
                </span>
                {canRestore && (
                  <button className="btn btn-outline btn-sm" onClick={() => handleRestore(c._id)}>Restaurar</button>
                )}
                {canHardDelete && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>Eliminar definitivamente</button>
                )}
              </div>
            ) : (
              <div className="comment-mod-actions">
                {hidingId === c._id ? (
                  <>
                    <input
                      type="text"
                      placeholder="Motivo..."
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                    />
                    <button className="btn btn-danger btn-sm" onClick={() => handleHide(c._id)}>Confirmar</button>
                    <button className="btn btn-outline btn-sm" onClick={() => { setHidingId(null); setReason(''); }}>Cancelar</button>
                  </>
                ) : (
                  <button className="btn btn-outline btn-sm" onClick={() => setHidingId(c._id)}>Ocultar</button>
                )}
                {canHardDelete && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>Eliminar</button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
