import { useState, useEffect, useCallback, useRef } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { getOverview, getGeo, getPopular, getInteractions, exportAnalytics } from '@/features/analytics/api/analyticsApi';
import './Analytics.css';

// ISO alpha-2 → ISO numeric (para world-atlas topojson)
const A2N = {
  AD:20,AE:784,AF:4,AG:28,AL:8,AM:51,AO:24,AR:32,AT:40,AU:36,AZ:31,
  BA:70,BB:52,BD:50,BE:56,BF:854,BG:100,BH:48,BI:108,BJ:204,BN:96,
  BO:68,BR:76,BS:44,BT:64,BW:72,BY:112,BZ:84,CA:124,CD:180,CF:140,
  CG:178,CH:756,CI:384,CL:152,CM:120,CN:156,CO:170,CR:188,CU:192,
  CV:132,CY:196,CZ:203,DE:276,DJ:262,DK:208,DM:212,DO:214,DZ:12,
  EC:218,EE:233,EG:818,ER:232,ES:724,ET:231,FI:246,FJ:242,FR:250,
  GA:266,GB:826,GD:308,GE:268,GH:288,GM:270,GN:324,GQ:226,GR:300,
  GT:320,GW:624,GY:328,HN:340,HR:191,HT:332,HU:348,ID:360,IE:372,
  IL:376,IN:356,IQ:368,IR:364,IS:352,IT:380,JM:388,JO:400,JP:392,
  KE:404,KG:417,KH:116,KI:296,KM:174,KN:659,KP:408,KR:410,KW:414,
  KZ:398,LA:418,LB:422,LC:662,LI:438,LK:144,LR:430,LS:426,LT:440,
  LU:442,LV:428,LY:434,MA:504,MC:492,MD:498,ME:499,MG:450,MH:584,
  MK:807,ML:466,MM:104,MN:496,MR:478,MT:470,MU:480,MV:462,MW:454,
  MX:484,MY:458,MZ:508,NA:516,NE:562,NG:566,NI:558,NL:528,NO:578,
  NP:524,NR:520,NZ:554,OM:512,PA:591,PE:604,PG:598,PH:608,PK:586,
  PL:616,PT:620,PW:585,PY:600,QA:634,RO:642,RS:688,RU:643,RW:646,
  SA:682,SB:90,SC:690,SD:729,SE:752,SG:702,SI:705,SK:703,SL:694,
  SM:674,SN:686,SO:706,SR:740,SS:728,ST:678,SV:222,SY:760,SZ:748,
  TD:148,TG:768,TH:764,TJ:762,TL:626,TM:795,TN:788,TO:776,TR:792,
  TT:780,TV:798,TZ:834,UA:804,UG:800,US:840,UY:858,UZ:860,VA:336,
  VC:670,VE:862,VN:704,VU:548,WS:882,YE:887,ZA:710,ZM:894,ZW:716,
  TW:158,HK:344,PS:275,MO:446,GL:304
};

const GEO_URL = '/countries-110m.json';

const N2A = Object.fromEntries(Object.entries(A2N).map(([a2, num]) => [num, a2]));

const AR_PROVINCES = {
  'A':'Salta','B':'Buenos Aires (Prov.)','C':'Ciudad Autónoma de Bs. As.',
  'D':'San Luis','E':'Entre Ríos','F':'La Rioja','G':'Santiago del Estero',
  'H':'Chaco','J':'San Juan','K':'Catamarca','L':'La Pampa','M':'Mendoza',
  'N':'Misiones','P':'Formosa','Q':'Neuquén','R':'Río Negro','S':'Santa Fe',
  'T':'Tucumán','U':'Chubut','V':'Tierra del Fuego','W':'Corrientes',
  'X':'Córdoba','Y':'Jujuy','Z':'Santa Cruz'
};

const US_STATES = {
  'AL':'Alabama','AK':'Alaska','AZ':'Arizona','AR':'Arkansas','CA':'California',
  'CO':'Colorado','CT':'Connecticut','DE':'Delaware','FL':'Florida','GA':'Georgia',
  'HI':'Hawái','ID':'Idaho','IL':'Illinois','IN':'Indiana','IA':'Iowa',
  'KS':'Kansas','KY':'Kentucky','LA':'Luisiana','ME':'Maine','MD':'Maryland',
  'MA':'Massachusetts','MI':'Michigan','MN':'Minnesota','MS':'Mississippi',
  'MO':'Misuri','MT':'Montana','NE':'Nebraska','NV':'Nevada','NH':'New Hampshire',
  'NJ':'New Jersey','NM':'Nuevo México','NY':'Nueva York','NC':'Carolina del Norte',
  'ND':'Dakota del Norte','OH':'Ohio','OK':'Oklahoma','OR':'Oregón','PA':'Pensilvania',
  'RI':'Rhode Island','SC':'Carolina del Sur','SD':'Dakota del Sur','TN':'Tennessee',
  'TX':'Texas','UT':'Utah','VT':'Vermont','VA':'Virginia','WA':'Washington',
  'WV':'Virginia Occidental','WI':'Wisconsin','WY':'Wyoming','DC':'Washington D.C.'
};

function getRegionName(countryCode, regionCode) {
  if (!regionCode) return null;
  if (countryCode === 'AR') return AR_PROVINCES[regionCode] || regionCode;
  if (countryCode === 'US') return US_STATES[regionCode] || regionCode;
  return regionCode;
}

function flag(code) {
  if (!code || code.length !== 2) return '🌐';
  return String.fromCodePoint(127397 + code.charCodeAt(0)) +
         String.fromCodePoint(127397 + code.charCodeAt(1));
}

const ORANGE_SCALE = ['#fff7ed','#ffedd5','#fed7aa','#fdba74','#fb923c','#f97316','#ea580c','#c2410c'];

function lerpColor(a, b, t) {
  const p = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  const [r1,g1,b1] = p(a), [r2,g2,b2] = p(b);
  return `rgb(${Math.round(r1+(r2-r1)*t)},${Math.round(g1+(g2-g1)*t)},${Math.round(b1+(b2-b1)*t)})`;
}

function getMapColor(count, max) {
  if (!count || !max) return null;
  const t = Math.log(count + 1) / Math.log(max + 1);
  const pos = t * (ORANGE_SCALE.length - 1);
  const lo = Math.min(Math.floor(pos), ORANGE_SCALE.length - 2);
  return lerpColor(ORANGE_SCALE[lo], ORANGE_SCALE[lo + 1], pos - lo);
}

function StatCard({ label, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card__label">{icon} {label}</div>
      <div className="stat-card__value">{value ?? '—'}</div>
    </div>
  );
}

function TypeBadge({ type }) {
  const cfg = {
    biblioteca:   { bg: 'rgba(249,115,22,0.12)', color: '#ea580c', label: 'Biblioteca' },
    noticia:      { bg: 'rgba(59,130,246,0.12)',  color: '#2563eb', label: 'Noticia' },
    home:         { bg: 'rgba(34,197,94,0.12)',   color: '#16a34a', label: 'Inicio' },
    nosotros:     { bg: 'rgba(168,85,247,0.12)',  color: '#9333ea', label: 'Nosotros' },
    noticias:     { bg: 'rgba(59,130,246,0.12)',  color: '#2563eb', label: 'Noticias' },
    departamento: { bg: 'rgba(20,184,166,0.12)',  color: '#0d9488', label: 'Departamento' },
    otro:         { bg: 'rgba(107,114,128,0.12)', color: '#6b7280', label: 'Otro' }
  };
  const c = cfg[type] || cfg.otro;
  return (
    <span style={{ background: c.bg, color: c.color, borderRadius: 8, padding: '2px 8px', fontSize: '0.78rem', fontWeight: 600 }}>
      {c.label}
    </span>
  );
}

export default function Analytics() {
  const [period, setPeriod] = useState('week');
  const [overview, setOverview] = useState(null);
  const [geo, setGeo] = useState([]);
  const [popular, setPopular] = useState([]);
  const [interactions, setInteractions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null);
  const [error, setError] = useState('');
  const [cities, setCities] = useState([]);
  const [tooltipPos, setTooltipPos] = useState(null);
  const [tooltipLabel, setTooltipLabel] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState([10, 15]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const mapContainerRef = useRef(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ovRes, gRes, popRes, interRes] = await Promise.allSettled([
        getOverview(period),
        getGeo(period),
        getPopular(period),
        getInteractions(period)
      ]);
      if (ovRes.status === 'fulfilled') setOverview(ovRes.value);
      if (gRes.status === 'fulfilled') { setGeo(gRes.value.countries || []); setCities(gRes.value.cities || []); }
      if (popRes.status === 'fulfilled') setPopular(popRes.value.pages || []);
      if (interRes.status === 'fulfilled') setInteractions(interRes.value);
      if ([ovRes, gRes, popRes, interRes].some(r => r.status === 'rejected')) {
        setError('Algunos datos no pudieron cargarse.');
      }
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      await exportAnalytics(format, period);
    } catch {
      setError('Error al exportar.');
    } finally {
      setExporting(null);
    }
  };

  const maxCount = geo.length > 0 ? Math.max(...geo.map(c => c.count)) : 1;
  const totalGeoVisits = geo.reduce((s, c) => s + c.count, 0);
  const countByNumeric = {};
  const geoByCode = {};
  geo.forEach(c => {
    const num = A2N[c.countryCode];
    if (num) countByNumeric[num] = c.count;
    if (c.countryCode) geoByCode[c.countryCode] = c;
  });

  const periodLabels = { week: 'Última semana', month: 'Último mes', year: 'Último año' };

  return (
    <div>
      {/* Header */}
      <div className="analytics-header">
        <div>
          <h2>Analíticas del Sitio</h2>
          <p className="analytics-header-sub">Visitas, geografía, contenido popular e interacciones</p>
        </div>
        <div className="analytics-export-btns">
          {['xlsx', 'docx', 'txt'].map(fmt => (
            <button
              key={fmt}
              className="btn btn-outline btn-sm"
              onClick={() => handleExport(fmt)}
              disabled={!!exporting || loading}
              title={`Descargar ${fmt.toUpperCase()}`}
            >
              {exporting === fmt ? '…' : `↓ ${fmt.toUpperCase()}`}
            </button>
          ))}
        </div>
      </div>

      {/* Period tabs */}
      <div className="analytics-period-tabs">
        {Object.entries(periodLabels).map(([key, label]) => (
          <button
            key={key}
            className={`analytics-period-btn${period === key ? ' active' : ''}`}
            onClick={() => setPeriod(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <div className="analytics-loading">Cargando analíticas…</div>
      ) : (
        <>
          {/* Overview cards */}
          <div className="analytics-stats-row">
            <StatCard label="Total visitas"     value={overview?.totalViews?.toLocaleString('es-AR')}    icon="👁" />
            <StatCard label="Visitantes únicos" value={overview?.uniqueVisitors?.toLocaleString('es-AR')} icon="👤" />
            <StatCard label="Países"            value={overview?.countries}                               icon="🌍" />
            <StatCard label="Compartidos"       value={overview?.totalShares?.toLocaleString('es-AR')}   icon="🔗" />
          </div>

          {/* World Map */}
          <div className="analytics-card">
            <h3>Mapa de Visitas</h3>
            {geo.length === 0 ? (
              <p className="analytics-empty" style={{ padding: '2rem' }}>
                Sin datos geográficos para este período. Las visitas locales (localhost) no se geolocalzan.
              </p>
            ) : (
              <div
                ref={mapContainerRef}
                className="analytics-map-container"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                }}
                onMouseLeave={() => { setTooltipPos(null); setTooltipLabel(null); }}
              >
                {/* Zoom controls */}
                <div className="analytics-map-controls">
                  <button className="analytics-zoom-btn" onClick={() => setZoom(z => Math.min(+(z * 1.6).toFixed(2), 12))} title="Acercar">+</button>
                  <button className="analytics-zoom-btn" onClick={() => setZoom(z => Math.max(+(z / 1.6).toFixed(2), 1))} title="Alejar">−</button>
                  <button className="analytics-zoom-btn" onClick={() => { setZoom(1); setCenter([10, 15]); setSelectedCountry(null); }} title="Restablecer vista">⟳</button>
                </div>

                {/* Tooltip */}
                {tooltipPos && tooltipLabel && (
                  <div
                    className="analytics-map-tooltip"
                    style={{
                      left: tooltipPos.x + 14,
                      top: Math.max(4, tooltipPos.y - 40),
                      transform: tooltipPos.x > 580 ? 'translateX(calc(-100% - 28px))' : 'none',
                    }}
                  >
                    {tooltipLabel}
                  </div>
                )}

                <div className="analytics-map-overflow">
                  <ComposableMap
                    width={800}
                    height={380}
                    projectionConfig={{ scale: 130 }}
                    style={{ width: '100%', height: 'auto' }}
                  >
                    <ZoomableGroup
                      zoom={zoom}
                      center={center}
                      onMoveEnd={({ zoom: z, coordinates }) => { setZoom(+(z).toFixed(2)); setCenter(coordinates); }}
                    >
                      <Geographies geography={GEO_URL}>
                        {({ geographies }) =>
                          geographies.map(geo => {
                            const geoId = typeof geo.id === 'string' ? parseInt(geo.id, 10) : geo.id;
                            const count = countByNumeric[geoId] || 0;
                            const fill = count > 0 ? getMapColor(count, maxCount) : null;
                            const a2 = N2A[geoId];
                            const countryData = a2 ? geoByCode[a2] : null;
                            const countryName = countryData?.country || a2;
                            const isSelected = selectedCountry?.countryCode === a2;
                            const pct = count > 0 && totalGeoVisits > 0
                              ? ` (${((count / totalGeoVisits) * 100).toFixed(1)}%)`
                              : '';
                            return (
                              <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill={isSelected ? '#fbbf24' : (fill || '#e2e8f0')}
                                stroke={isSelected ? '#d97706' : '#fff'}
                                strokeWidth={isSelected ? 1.5 / zoom : 0.4 / zoom}
                                onClick={() => {
                                  if (countryData) setSelectedCountry(countryData);
                                  else setSelectedCountry(null);
                                }}
                                onMouseEnter={() => {
                                  if (countryName) {
                                    setTooltipLabel(
                                      count > 0
                                        ? `${flag(a2)} ${countryName} — ${count.toLocaleString('es-AR')} visita${count !== 1 ? 's' : ''}${pct}`
                                        : countryName
                                    );
                                  }
                                }}
                                onMouseLeave={() => setTooltipLabel(null)}
                                style={{
                                  default: { outline: 'none', cursor: count > 0 ? 'pointer' : 'default' },
                                  hover:   { outline: 'none', fill: isSelected ? '#fbbf24' : (count > 0 ? '#fbbf24' : '#cbd5e1'), opacity: 0.92, cursor: count > 0 ? 'pointer' : 'grab' },
                                  pressed: { outline: 'none', fill: isSelected ? '#f59e0b' : (fill || '#e2e8f0') }
                                }}
                              />
                            );
                          })
                        }
                      </Geographies>
                    </ZoomableGroup>
                  </ComposableMap>
                </div>

                {/* Selected country detail */}
                {selectedCountry && (
                  <div className="analytics-country-detail">
                    <span className="analytics-country-detail-flag">{flag(selectedCountry.countryCode)}</span>
                    <div className="analytics-country-detail-info">
                      <div className="analytics-country-detail-name">{selectedCountry.country || selectedCountry.countryCode}</div>
                      <div className="analytics-country-detail-stats">
                        {selectedCountry.count.toLocaleString('es-AR')} visita{selectedCountry.count !== 1 ? 's' : ''}
                        {totalGeoVisits > 0 && (
                          <span className="analytics-country-detail-pct">
                            {' '}· {((selectedCountry.count / totalGeoVisits) * 100).toFixed(1)}% del total
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="analytics-country-detail-close" onClick={() => setSelectedCountry(null)} title="Cerrar">✕</button>
                  </div>
                )}

                {/* Color legend */}
                <div className="analytics-map-legend">
                  <span className="analytics-map-legend-label">Menos</span>
                  <div className="analytics-map-legend-scale">
                    {ORANGE_SCALE.map(c => <div key={c} style={{ flex: 1, height: '100%', background: c }} />)}
                  </div>
                  <span className="analytics-map-legend-label">Más</span>
                </div>
              </div>
            )}

            {/* Country list */}
            {geo.length > 0 && (
              <div className="analytics-country-grid">
                {geo.slice(0, 20).map((c, i) => {
                  const topCity   = cities.find(x => x.countryCode === c.countryCode);
                  const regionLabel = topCity ? getRegionName(c.countryCode, topCity.region) : null;
                  const cityLabel   = topCity?.city;
                  const hint = [regionLabel, cityLabel].filter(Boolean).join(' · ');
                  return (
                    <div key={c.countryCode} className="analytics-country-row">
                      <span className="analytics-country-flag">{flag(c.countryCode)}</span>
                      <div className="analytics-country-info">
                        <div className="analytics-country-name">{i + 1}. {c.country || c.countryCode}</div>
                        {hint && <div className="analytics-country-hint">{hint}</div>}
                        <div className="analytics-country-bar-row">
                          <div
                            className="analytics-bar"
                            style={{ width: `${Math.max(8, (c.count / geo[0].count) * 100)}%` }}
                          />
                          <span className="analytics-bar-count">{c.count}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {geo.length > 20 && (
              <p className="analytics-more-hint">
                + {geo.length - 20} países más. Descargá el reporte para ver el listado completo.
              </p>
            )}
          </div>

          {/* Ciudades y Provincias */}
          {cities.length > 0 && (
            <div className="analytics-card">
              <h3 style={{ marginBottom: '0.25rem' }}>Desglose por Ciudad y Provincia</h3>
              <p className="analytics-section-hint">
                Visitas agrupadas por país, provincia/estado y ciudad (top 50).
              </p>
              <div className="analytics-overflow-table">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>País</th>
                      <th>Provincia / Estado</th>
                      <th>Ciudad</th>
                      <th style={{ textAlign: 'right' }}>Visitas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cities.slice(0, 50).map((c, i) => {
                      const regionName = getRegionName(c.countryCode, c.region);
                      return (
                        <tr key={i}>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <span style={{ marginRight: 6 }}>{flag(c.countryCode)}</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{c.country || c.countryCode}</span>
                          </td>
                          <td style={{ fontSize: '0.875rem' }}>
                            {regionName
                              ? <><span style={{ fontWeight: 600 }}>{regionName}</span>{c.region && regionName !== c.region && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}> ({c.region})</span>}</>
                              : <span style={{ color: 'var(--text-muted)' }}>—</span>
                            }
                          </td>
                          <td style={{ fontSize: '0.875rem' }}>{c.city || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>{c.count}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {cities.length > 50 && (
                <p className="analytics-more-hint">
                  + {cities.length - 50} registros más. Descargá el reporte para el listado completo.
                </p>
              )}
            </div>
          )}

          {/* Popular pages */}
          <div className="analytics-card">
            <h3>Páginas Más Visitadas</h3>
            {popular.length === 0 ? (
              <p className="analytics-empty" style={{ padding: '1.5rem' }}>Sin visitas en este período.</p>
            ) : (
              <div className="analytics-overflow-table">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Página</th>
                      <th>Tipo</th>
                      <th style={{ textAlign: 'right' }}>Visitas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {popular.map((p, i) => (
                      <tr key={p._id}>
                        <td style={{ color: 'var(--text-muted)', width: 36 }}>{i + 1}</td>
                        <td>
                          <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{p.resourceName || p._id}</div>
                          {p.resourceName && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{p._id}</div>
                          )}
                        </td>
                        <td><TypeBadge type={p.resourceType} /></td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <div style={{
                              height: 6,
                              background: 'var(--primary)',
                              borderRadius: 3,
                              width: `${Math.max(8, (p.count / popular[0].count) * 80)}px`,
                              opacity: 0.6
                            }} />
                            <span style={{ fontWeight: 700, minWidth: 40 }}>{p.count.toLocaleString('es-AR')}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Interactions */}
          {interactions && (
            <>
              {/* Content likes/dislikes */}
              <div className="analytics-card">
                <h3>Me Gusta y Reacciones por Contenido</h3>
                <p className="analytics-section-hint">
                  Los Me gusta de bibliotecas y noticias son acumulados históricos, no sólo del período seleccionado.
                </p>
                {interactions.content?.length === 0 ? (
                  <p className="analytics-empty" style={{ padding: '1.5rem' }}>Sin datos de reacciones.</p>
                ) : (
                  <div className="analytics-overflow-table">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Contenido</th>
                          <th>Tipo</th>
                          <th style={{ textAlign: 'center' }}>👍 Me gusta</th>
                          <th style={{ textAlign: 'center' }}>💬 Likes en comentarios</th>
                          <th style={{ textAlign: 'center' }}>👎 Dislikes en comentarios</th>
                        </tr>
                      </thead>
                      <tbody>
                        {interactions.content?.map(item => (
                          <tr key={item._id}>
                            <td style={{ fontWeight: 500, fontSize: '0.875rem', maxWidth: 280 }}>
                              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                            </td>
                            <td><TypeBadge type={item.type} /></td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{ fontWeight: 700, color: '#16a34a' }}>{item.likes.toLocaleString('es-AR')}</span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{ color: '#2563eb' }}>{item.commentLikes.toLocaleString('es-AR')}</span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{ color: '#dc2626' }}>{item.commentDislikes.toLocaleString('es-AR')}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Shares */}
              {interactions.shares?.length > 0 && (
                <div className="analytics-card">
                  <h3>Compartidos en el Período</h3>
                  <div className="analytics-overflow-table">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Página</th>
                          <th>Tipo</th>
                          <th style={{ textAlign: 'right' }}>Veces compartido</th>
                        </tr>
                      </thead>
                      <tbody>
                        {interactions.shares.map(s => (
                          <tr key={s._id}>
                            <td style={{ fontSize: '0.875rem' }}>
                              <div style={{ fontWeight: 500 }}>{s.resourceName || s._id}</div>
                              {s.resourceName && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{s._id}</div>}
                            </td>
                            <td><TypeBadge type={s.resourceType} /></td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>
                              🔗 {s.shares}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
