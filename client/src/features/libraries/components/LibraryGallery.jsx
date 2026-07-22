import { useState } from 'react';

export default function LibraryGallery({ images, libraryName }) {
  const [lightbox, setLightbox] = useState(null);

  if (images.length <= 1) return null;

  return (
    <>
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-body">
          <h3 className="lib-section-title">Galería</h3>
          <div className="lib-gallery">
            {images.map((src, i) => (
              <button key={i} className="lib-gallery-item" onClick={() => setLightbox(src)}>
                <img src={src} alt={`${libraryName} — imagen ${i + 1}`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {lightbox && (
        <div className="modal-overlay" onClick={() => setLightbox(null)} role="dialog" aria-modal="true" aria-label="Imagen ampliada">
          <div
            style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            <img
              src={lightbox}
              alt=""
              style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, display: 'block' }}
            />
            <button
              onClick={() => setLightbox(null)}
              aria-label="Cerrar imagen"
              style={{
                position: 'absolute', top: -12, right: -12,
                background: '#fff', border: 'none', borderRadius: '50%',
                width: 32, height: 32, cursor: 'pointer',
                fontSize: 16, fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >✕</button>
          </div>
        </div>
      )}
    </>
  );
}
