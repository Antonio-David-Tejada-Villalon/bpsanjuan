import { useEffect, useState, useCallback } from 'react';
import { getMessages, sendMessage } from '../api/messages';
import { useAuth } from '../context/AuthContext';

export default function MessageThread({ libraryId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const { messages } = await getMessages(libraryId);
      setMessages(messages);
    } catch {
      setError('No se pudieron cargar los mensajes.');
    } finally {
      setLoading(false);
    }
  }, [libraryId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await sendMessage(libraryId, text.trim());
      setText('');
      setError('');
      await load();
    } catch {
      setError('No se pudo enviar el mensaje.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="message-thread">
      {error && <p className="alert alert-error">{error}</p>}

      <div className="message-list">
        {messages.length === 0 && <p className="empty-state">Todavía no hay mensajes.</p>}
        {messages.map(m => (
          <div key={m._id} className={`message-bubble ${m.sender?._id === user._id ? 'mine' : ''}`}>
            <span className="message-sender">{m.sender?.name || 'Usuario'}</span>
            <p>{m.text}</p>
            <span className="message-date">{new Date(m.createdAt).toLocaleString('es-AR')}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="message-form">
        <textarea
          rows={2}
          placeholder="Escribí un mensaje..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={sending}>
          {sending ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}
