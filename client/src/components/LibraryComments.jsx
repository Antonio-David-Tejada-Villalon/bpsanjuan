import { useState } from 'react';
import { addLibraryComment, addReply, reactToComment, reactToReply, getLibrary } from '../api/libraries';
import GoogleLoginBtn from './GoogleLoginBtn';
import { timeAgo } from '../utils/timeAgo';

const roleLabel = { admin: 'Admin', supervisor: 'Supervisor', bibliotecario: 'Bibliotecario' };

function CommentAvatar({ name, picture }) {
  if (picture) return <img className="comment-avatar" src={picture} alt={name} />;
  const initials = name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';
  return <div className="comment-avatar comment-avatar--initials">{initials}</div>;
}

function ReactionBar({ likes = [], dislikes = [], currentUserId, onReact }) {
  const uid = currentUserId?.toString();
  const liked    = uid && likes.some(id => id.toString() === uid);
  const disliked = uid && dislikes.some(id => id.toString() === uid);
  return (
    <div className="comment-reactions">
      <button className={`reaction-btn${liked ? ' reaction-btn--liked' : ''}`} onClick={() => onReact('like')} title="Me gusta">
        <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
          <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
        </svg>
        {likes.length > 0 && <span>{likes.length}</span>}
      </button>
      <button className={`reaction-btn${disliked ? ' reaction-btn--disliked' : ''}`} onClick={() => onReact('dislike')} title="No me gusta">
        <svg width="14" height="14" viewBox="0 0 24 24" fill={disliked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
          <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
        </svg>
        {dislikes.length > 0 && <span>{dislikes.length}</span>}
      </button>
    </div>
  );
}

export default function LibraryComments({ libraryId, initialComments = [], canComment, publicUser, user, showToast }) {
  const [comments, setComments] = useState(initialComments);
  const [comment, setComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState('');

  const currentUserId = publicUser?._id || user?._id;

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const { comments: updated } = await addLibraryComment(libraryId, comment.trim());
      setComments(updated);
      setComment('');
      setError('');
      showToast?.('¡Comentario publicado!');
    } catch {
      setError('Iniciá sesión para comentar.');
    }
  };

  const handleReply = async (e, commentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      const { comments: updated } = await addReply(libraryId, commentId, replyText.trim());
      setComments(updated);
      setReplyText('');
      setReplyingTo(null);
    } catch {
      setError('Iniciá sesión para responder.');
    }
  };

  const handleReactComment = async (commentId, type) => {
    if (!canComment) { setError('Iniciá sesión para reaccionar.'); return; }
    try {
      await reactToComment(libraryId, commentId, type);
      const fresh = await getLibrary(libraryId);
      setComments(fresh.library.comments);
    } catch { /* ignore */ }
  };

  const handleReactReply = async (commentId, replyId, type) => {
    if (!canComment) { setError('Iniciá sesión para reaccionar.'); return; }
    try {
      await reactToReply(libraryId, commentId, replyId, type);
      const fresh = await getLibrary(libraryId);
      setComments(fresh.library.comments);
    } catch { /* ignore */ }
  };

  return (
    <div className="card" style={{ marginTop: 24 }}>
      <div className="card-body">
        <h3 className="lib-section-title">
          Comentarios ({comments.filter(c => !c.hidden).length})
        </h3>

        {error && (
          <div style={{ marginBottom: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <p className="alert alert-error" style={{ margin: 0 }}>{error}</p>
            {!publicUser && !user && <GoogleLoginBtn className="btn btn-sm btn-primary" />}
          </div>
        )}

        <form onSubmit={handleComment} className="comment-form">
          <label htmlFor="biblio-comment" className="visually-hidden">Tu comentario</label>
          <textarea
            id="biblio-comment"
            rows={3}
            placeholder={canComment ? 'Escribí un comentario...' : 'Iniciá sesión con Google para comentar'}
            value={comment}
            onChange={e => setComment(e.target.value)}
            disabled={!canComment}
            maxLength={500}
          />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={!canComment}>Comentar</button>
              {!canComment && <GoogleLoginBtn className="btn btn-sm btn-outline" />}
            </div>
            <span style={{ fontSize: 12, color: comment.length > 450 ? 'var(--primary)' : 'var(--text-soft)' }}
                  aria-live="polite" aria-atomic="true">
              {comment.length}/500
            </span>
          </div>
        </form>

        <ul className="comment-list">
          {comments.map(c => {
            const author = c.authorType === 'staff'
              ? { name: c.staffUser?.name || 'Staff', picture: null, role: c.staffUser?.role }
              : { name: c.publicUser?.name || 'Usuario', picture: c.publicUser?.picture, role: null };

            return (
              <li key={c._id} className="comment-item">
                <div className="comment-header">
                  <CommentAvatar name={author.name} picture={author.picture} />
                  <div className="comment-meta">
                    <span className="comment-author">
                      {author.name}
                      {author.role && <span className="comment-role-badge">{roleLabel[author.role] || author.role}</span>}
                    </span>
                    <span className="comment-time">{timeAgo(c.createdAt)}</span>
                  </div>
                </div>
                <p className="comment-text">{c.text}</p>
                <div className="comment-actions">
                  <ReactionBar
                    likes={c.likes || []}
                    dislikes={c.dislikes || []}
                    currentUserId={currentUserId}
                    onReact={type => handleReactComment(c._id, type)}
                  />
                  {canComment && (
                    <button
                      className="comment-reply-btn"
                      onClick={() => setReplyingTo(replyingTo === c._id ? null : c._id)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
                      </svg>
                      Responder
                      {c.replies?.length > 0 && ` (${c.replies.length})`}
                    </button>
                  )}
                </div>

                {(c.replies?.length > 0 || replyingTo === c._id) && (
                  <div className="comment-replies">
                    {c.replies?.map(r => {
                      const rAuthor = r.authorType === 'staff'
                        ? { name: r.staffUser?.name || 'Staff', picture: null, role: r.staffUser?.role }
                        : { name: r.publicUser?.name || 'Usuario', picture: r.publicUser?.picture, role: null };
                      return (
                        <div key={r._id} className="reply-item">
                          <div className="comment-header">
                            <CommentAvatar name={rAuthor.name} picture={rAuthor.picture} />
                            <div className="comment-meta">
                              <span className="comment-author">
                                {rAuthor.name}
                                {rAuthor.role && <span className="comment-role-badge">{roleLabel[rAuthor.role] || rAuthor.role}</span>}
                              </span>
                              <span className="comment-time">{timeAgo(r.createdAt)}</span>
                            </div>
                          </div>
                          <p className="comment-text">{r.text}</p>
                          <ReactionBar
                            likes={r.likes || []}
                            dislikes={r.dislikes || []}
                            currentUserId={currentUserId}
                            onReact={type => handleReactReply(c._id, r._id, type)}
                          />
                        </div>
                      );
                    })}

                    {replyingTo === c._id && (
                      <form className="reply-form" onSubmit={e => handleReply(e, c._id)}>
                        <label htmlFor={`reply-${c._id}`} className="visually-hidden">Tu respuesta</label>
                        <textarea
                          id={`reply-${c._id}`}
                          rows={2}
                          placeholder="Escribí tu respuesta..."
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          autoFocus
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button type="submit" className="btn btn-primary btn-sm">Responder</button>
                          <button type="button" className="btn btn-outline btn-sm" onClick={() => { setReplyingTo(null); setReplyText(''); }}>
                            Cancelar
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </li>
            );
          })}
          {comments.length === 0 && (
            <li style={{ padding: '20px 0', color: 'var(--text-soft)', textAlign: 'center' }}>
              Todavía no hay comentarios. ¡Sé el primero!
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
