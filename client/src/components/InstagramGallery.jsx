import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

function IgIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function TypeBadge({ type }) {
  if (type === 'VIDEO') return (
    <svg className="ig-type-icon" width="28" height="28" viewBox="0 0 24 24" fill="white">
      <path d="M8 5v14l11-7z"/>
    </svg>
  );
  if (type === 'CAROUSEL_ALBUM') return (
    <svg className="ig-type-icon" width="22" height="22" viewBox="0 0 24 24" fill="white">
      <rect x="2" y="2" width="14" height="14" rx="2" stroke="white" strokeWidth="2" fill="none"/>
      <rect x="8" y="8" width="14" height="14" rx="2" fill="white" fillOpacity=".6"/>
    </svg>
  );
  return null;
}

function IgPost({ post, featured = false }) {
  const img = post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url;
  return (
    <a
      href={post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className={`ig-item${featured ? ' ig-item--featured' : ''}`}
      aria-label={post.caption ? post.caption.slice(0, 80) : 'Ver en Instagram'}
    >
      <img
        src={img}
        alt={post.caption ? post.caption.slice(0, 60) : 'Publicación de Instagram'}
        className="ig-item-img"
        loading={featured ? 'eager' : 'lazy'}
      />
      <div className="ig-item-overlay">
        <TypeBadge type={post.media_type} />
        {featured && post.caption && (
          <p className="ig-item-caption">{post.caption.slice(0, 120)}{post.caption.length > 120 ? '…' : ''}</p>
        )}
      </div>
    </a>
  );
}

export default function InstagramGallery() {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch(`${API}/instagram/feed`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setPosts(data);
        else setError('error');
      })
      .catch(() => setError('error'))
      .finally(() => setLoading(false));
  }, []);

  if (error) return null;

  const [featured, ...rest] = posts.slice(0, 7);
  const grid = rest.slice(0, 6);

  return (
    <section className="ig-gallery-section section container">
      <div className="ig-gallery-header">
        <h2 className="section-title">En Instagram</h2>
        <a
          href="https://www.instagram.com/dbpsanjuan"
          target="_blank"
          rel="noopener noreferrer"
          className="ig-gallery-handle"
          aria-label="Ver perfil de Instagram @dbpsanjuan"
        >
          <IgIcon /> @dbpsanjuan
        </a>
      </div>

      {loading && (
        <div className="ig-layout">
          <div className="ig-item ig-item--featured ig-item--skeleton" />
          <div className="ig-subgrid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="ig-item ig-item--skeleton" />
            ))}
          </div>
        </div>
      )}

      {!loading && featured && (
        <div className="ig-layout">
          <IgPost post={featured} featured />
          {grid.length > 0 && (
            <div className="ig-subgrid">
              {grid.map(post => <IgPost key={post.id} post={post} />)}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
