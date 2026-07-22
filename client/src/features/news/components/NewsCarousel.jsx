import { useState, useCallback, useEffect, useRef } from 'react';
import './NewsCarousel.css';

export default function NewsCarousel({ images }) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);
  const count = images.length;

  const prev = useCallback(() => setCurrent(i => (i - 1 + count) % count), [count]);
  const next = useCallback(() => setCurrent(i => (i + 1) % count), [count]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next]);

  if (!images?.length) return null;

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  return (
    <figure className="nc-root" role="region" aria-label="Galería de fotos">
      <div
        className="nc-viewport"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="nc-track"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {images.map((src, i) => (
            <div key={i} className="nc-slide" aria-hidden={i !== current}>
              <img
                src={src}
                alt={`Foto ${i + 1} de ${count}`}
                className="nc-img"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            <button className="nc-arrow nc-arrow-prev" onClick={prev} aria-label="Foto anterior">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button className="nc-arrow nc-arrow-next" onClick={next} aria-label="Foto siguiente">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

        <div className="nc-counter" aria-live="polite" aria-atomic="true">
          {current + 1} / {count}
        </div>
      </div>

      {count > 1 && (
        <div className="nc-dots" role="tablist" aria-label="Seleccionar foto">
          {images.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`Foto ${i + 1}`}
              className={`nc-dot${i === current ? ' nc-dot-active' : ''}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      )}
    </figure>
  );
}
