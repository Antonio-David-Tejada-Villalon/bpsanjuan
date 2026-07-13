function SkeletonBlock({ width = '100%', height = 16, radius = 6, style = {} }) {
  return (
    <span
      className="skeleton-block"
      style={{ width, height, borderRadius: radius, ...style }}
      aria-hidden="true"
    />
  );
}

function SkeletonCard() {
  return (
    <div className="card skeleton-card" aria-hidden="true">
      <SkeletonBlock height={170} radius={0} />
      <div className="card-body">
        <SkeletonBlock height={20} width="72%" />
        <SkeletonBlock height={13} width="46%" style={{ marginTop: 4 }} />
        <SkeletonBlock height={13} width="90%" style={{ marginTop: 8 }} />
        <SkeletonBlock height={13} width="78%" />
        <SkeletonBlock height={13} width="55%" />
      </div>
    </div>
  );
}

function SkeletonGrid({ count = 6, columns = 3 }) {
  return (
    <div className={`grid grid-${columns}`}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

function SkeletonText({ lines = 3, lastWidth = '60%' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: lines }, (_, i) => (
        <SkeletonBlock
          key={i}
          height={14}
          width={i === lines - 1 ? lastWidth : '100%'}
        />
      ))}
    </div>
  );
}

function SkeletonPage() {
  return (
    <div className="section container page-loading-skeleton" aria-label="Cargando...">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <SkeletonBlock height={38} width="42%" />
        <SkeletonBlock height={16} width="58%" />
        <SkeletonGrid />
      </div>
    </div>
  );
}

function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="admin-table-wrap" aria-hidden="true">
      <table className="admin-table" style={{ pointerEvents: 'none' }}>
        <thead>
          <tr>
            {Array.from({ length: cols }, (_, i) => (
              <th key={i}><SkeletonBlock height={14} width={i === 0 ? '70%' : '55%'} /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }, (_, c) => (
                <td key={c}><SkeletonBlock height={13} width={c === 0 ? '80%' : '50%'} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { SkeletonBlock, SkeletonCard, SkeletonGrid, SkeletonText, SkeletonPage, SkeletonTable };
