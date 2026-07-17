import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="nf-page section container">
      <Helmet>
        <title>Página no encontrada | DBP San Juan</title>
      </Helmet>

      <div className="nf-inner">
        <div className="nf-graphic" aria-hidden="true">
          <span className="nf-number">4</span>
          <div className="nf-book">
            <div className="nf-book-cover" />
            <div className="nf-book-pages" />
          </div>
          <span className="nf-number">4</span>
        </div>

        <h1 className="nf-title">Página no encontrada</h1>
        <p className="nf-text">
          La página que buscás no existe o fue movida.<br />
          Podés explorar la red de bibliotecas desde el inicio.
        </p>

        <div className="nf-actions">
          <Link to="/" className="btn btn-primary">Ir al inicio</Link>
          <Link to="/noticias" className="btn btn-outline">Ver noticias</Link>
        </div>
      </div>
    </div>
  );
}
