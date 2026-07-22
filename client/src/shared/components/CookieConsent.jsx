import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('cookie-consent') === 'ok'
  );

  if (dismissed) return null;

  const accept = () => {
    localStorage.setItem('cookie-consent', 'ok');
    setDismissed(true);
  };

  return (
    <div className="cookie-bar" role="region" aria-label="Aviso sobre cookies">
      <p className="cookie-bar-text">
        Este sitio usa cookies de sesión para el inicio de sesión con Google. No usamos cookies de publicidad ni seguimiento.{' '}
        <Link to="/privacidad" className="cookie-bar-link">Política de privacidad</Link>
      </p>
      <button className="btn btn-primary btn-sm cookie-bar-btn" onClick={accept}>
        Entendido
      </button>
    </div>
  );
}
