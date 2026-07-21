import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onDismiss }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div className={`toast toast--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <span>{message}</span>
      <button className="toast-close" onClick={onDismiss} aria-label="Cerrar notificación">✕</button>
    </div>
  );
}
