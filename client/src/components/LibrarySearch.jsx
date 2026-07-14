import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchLibraries } from '../api/libraries';

export default function LibrarySearch({ departments = [] }) {
  const [query, setQuery]     = useState('');
  const [libResults, setLibResults] = useState([]);
  const [open, setOpen]       = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const navigate  = useNavigate();
  const timerRef  = useRef(null);

  const q = query.trim().toLowerCase();
  const deptResults = q.length > 0
    ? departments.filter(d => d.name.toLowerCase().includes(q)).slice(0, 4)
    : [];

  const items = [
    ...deptResults.map(d => ({ kind: 'dept', label: d.name, slug: d.slug })),
    ...libResults.map(l => ({ kind: 'lib',  label: l.name, id: l._id, dept: l.department?.name })),
  ];

  useEffect(() => {
    if (query.trim().length < 2) { setLibResults([]); return; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await searchLibraries(query.trim());
        setLibResults(res.libraries || []);
      } catch { setLibResults([]); }
    }, 250);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  const go = (item) => {
    setQuery('');
    setOpen(false);
    setLibResults([]);
    if (item.kind === 'dept') navigate(`/departamentos/${item.slug}`);
    else navigate(`/bibliotecas/${item.id}`);
  };

  const onKeyDown = (e) => {
    if (!open || items.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, items.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); go(items[activeIdx]); }
    else if (e.key === 'Escape') { setOpen(false); }
  };

  const showDropdown = open && items.length > 0;

  return (
    <div className="lib-search" role="combobox" aria-expanded={showDropdown} aria-haspopup="listbox">
      <div className="lib-search-wrap">
        <svg className="lib-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          className="lib-search-input"
          placeholder="Buscar biblioteca o departamento…"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); setActiveIdx(-1); }}
          onFocus={() => { if (query) setOpen(true); }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          aria-label="Buscar biblioteca o departamento"
        />
        {query && (
          <button
            type="button"
            className="lib-search-clear"
            onClick={() => { setQuery(''); setLibResults([]); setOpen(false); }}
            aria-label="Limpiar búsqueda"
          >✕</button>
        )}
      </div>

      {showDropdown && (
        <ul className="lib-search-dropdown" role="listbox">
          {deptResults.length > 0 && (
            <>
              <li className="lib-search-group" role="presentation">Departamentos</li>
              {deptResults.map((d, i) => (
                <li
                  key={d.slug}
                  role="option"
                  aria-selected={activeIdx === i}
                  className={`lib-search-item${activeIdx === i ? ' active' : ''}`}
                  onMouseDown={() => go({ kind: 'dept', slug: d.slug })}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {d.name}
                  <span className="lib-search-tag">Departamento</span>
                </li>
              ))}
            </>
          )}
          {libResults.length > 0 && (
            <>
              <li className="lib-search-group" role="presentation">Bibliotecas</li>
              {libResults.map((l, i) => {
                const idx = deptResults.length + i;
                return (
                  <li
                    key={l._id}
                    role="option"
                    aria-selected={activeIdx === idx}
                    className={`lib-search-item${activeIdx === idx ? ' active' : ''}`}
                    onMouseDown={() => go({ kind: 'lib', id: l._id })}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                    <span>{l.name}</span>
                    {l.department?.name && (
                      <span className="lib-search-dept">{l.department.name}</span>
                    )}
                  </li>
                );
              })}
            </>
          )}
        </ul>
      )}
    </div>
  );
}
