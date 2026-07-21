import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const ACTIVIDADES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
    titulo: 'Presentaciones de libros',
    desc: 'Autores sanjuaninos y nacionales presentan sus obras. Debates, firmas y encuentros con el lector.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    titulo: 'Talleres literarios',
    desc: 'Escritura creativa, ilustración, lectura en voz alta y talleres para niños y jóvenes de toda la provincia.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
      </svg>
    ),
    titulo: 'Exposición y librería',
    desc: 'Stands de editoriales locales e independientes. Libros nuevos y usados a precios accesibles para toda la familia.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    titulo: 'Espectáculos y cultura',
    desc: 'Música en vivo, teatro, cuentacuentos y actividades culturales complementarias para toda la familia.',
  },
];

const PROGRAMA = [
  { dia: 'Lunes a viernes', horario: '10:00 – 13:00 / 17:00 – 21:00', nota: 'Presentaciones y talleres' },
  { dia: 'Sábados',         horario: '10:00 – 22:00',                   nota: 'Jornada completa + espectáculos nocturnos' },
  { dia: 'Domingos',        horario: '11:00 – 20:00',                   nota: 'Actividades para familias' },
];

export default function FeriaDelLibro() {
  return (
    <div>
      <Helmet>
        <title>Feria del Libro de San Juan | DBP</title>
        <meta name="description" content="La Feria del Libro de San Juan reúne a autores, editoriales y lectores en un espacio de cultura y conocimiento organizado por la Dirección de Bibliotecas Populares." />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://bpsanjuan.vercel.app" },
            { "@type": "ListItem", "position": 2, "name": "Feria del Libro", "item": "https://bpsanjuan.vercel.app/feria-del-libro" }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Event",
          "name": "Feria del Libro de San Juan",
          "description": "Evento cultural anual organizado por la Dirección de Bibliotecas Populares y Actividades Literarias de San Juan.",
          "organizer": {
            "@type": "GovernmentOrganization",
            "name": "Dirección de Bibliotecas Populares y Actividades Literarias de San Juan",
            "url": "https://bpsanjuan.vercel.app"
          },
          "location": {
            "@type": "Place",
            "name": "San Juan, Argentina",
            "address": { "@type": "PostalAddress", "addressLocality": "San Juan", "addressCountry": "AR" }
          }
        })}</script>
      </Helmet>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="feria-hero">
        <div className="container feria-hero-inner">
          <div className="feria-hero-text">
            <nav aria-label="Ruta de navegación" className="breadcrumb feria-breadcrumb">
              <ol className="breadcrumb-list">
                <li><Link to="/">Inicio</Link></li>
                <li aria-current="page">Feria del Libro</li>
              </ol>
            </nav>
            <p className="feria-eyebrow">Dirección de Bibliotecas Populares · San Juan</p>
            <h1 className="feria-hero-title">Feria del Libro<br />de San Juan</h1>
            <p className="feria-hero-sub">
              El encuentro anual que reúne a autores, editoriales y lectores en un espacio de cultura, conocimiento y celebración del libro sanjuanino.
            </p>
            <div className="feria-hero-actions">
              <a href="#actividades" className="btn btn-primary feria-btn-main">Ver actividades</a>
              <Link to="/noticias" className="feria-link-noticias">Noticias del evento →</Link>
            </div>
          </div>
          <div className="feria-hero-badge-wrap" aria-hidden="true">
            <div className="feria-badge">
              <span className="feria-badge-label">Edición anual</span>
              <span className="feria-badge-num">2026</span>
              <span className="feria-badge-sub">San Juan · Argentina</span>
            </div>
            <div className="feria-deco-ring feria-deco-ring-1" />
            <div className="feria-deco-ring feria-deco-ring-2" />
          </div>
        </div>
      </section>

      {/* ── Sobre la Feria ───────────────────────────────── */}
      <section className="section container feria-about">
        <div className="feria-about-grid">
          <div>
            <h2 className="section-title">¿Qué es la Feria del Libro?</h2>
            <p className="feria-about-text">
              La Feria del Libro de San Juan es el evento cultural más importante de la red de bibliotecas populares de la provincia. Organizada anualmente por la Dirección de Bibliotecas Populares y Actividades Literarias, convoca a escritores locales y nacionales, editoriales independientes y lectores de todas las edades.
            </p>
            <p className="feria-about-text" style={{ marginTop: 14 }}>
              Cada edición propone un espacio gratuito y federal donde la cultura llega a toda la comunidad sanjuanina — desde los departamentos más alejados hasta el Gran San Juan.
            </p>
          </div>
          <div className="feria-stats-col">
            {[
              { num: '56', label: 'Bibliotecas participantes' },
              { num: '19', label: 'Departamentos representados' },
              { num: '100%', label: 'Entrada libre y gratuita' },
            ].map(s => (
              <div key={s.label} className="feria-stat">
                <span className="feria-stat-num">{s.num}</span>
                <span className="feria-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Actividades ──────────────────────────────────── */}
      <section id="actividades" className="feria-actividades-section">
        <div className="container">
          <h2 className="section-title" style={{ color: '#fff', marginBottom: 8 }}>Actividades</h2>
          <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.82)', marginBottom: 40 }}>Algo para cada lector, de todas las edades.</p>
          <div className="grid grid-4 feria-act-grid">
            {ACTIVIDADES.map(a => (
              <div key={a.titulo} className="feria-act-card">
                <div className="feria-act-icon">{a.icon}</div>
                <h3 className="feria-act-title">{a.titulo}</h3>
                <p className="feria-act-desc">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Horarios ─────────────────────────────────────── */}
      <section className="section container">
        <h2 className="section-title">Horarios de la edición 2026</h2>
        <p className="section-subtitle">Los horarios exactos se confirman semanas antes del evento. Seguí nuestras noticias.</p>
        <div className="feria-schedule">
          {PROGRAMA.map(p => (
            <div key={p.dia} className="feria-schedule-row">
              <div className="feria-schedule-dia">{p.dia}</div>
              <div className="feria-schedule-hora">{p.horario}</div>
              <div className="feria-schedule-nota">{p.nota}</div>
            </div>
          ))}
        </div>
        <p className="feria-schedule-disclaimer">
          * Los horarios son orientativos para la edición 2026 y pueden modificarse.
          <Link to="/noticias" className="feria-inline-link"> Seguí las novedades en Noticias.</Link>
        </p>
      </section>

      {/* ── Lugar ────────────────────────────────────────── */}
      <section className="feria-lugar-section">
        <div className="container feria-lugar-inner">
          <div>
            <h2 className="section-title">Lugar del evento</h2>
            <p className="feria-lugar-text">
              La Feria del Libro de San Juan se realiza en un espacio de acceso público y gratuito en el Gran San Juan. El lugar definitivo de cada edición se anuncia con anticipación a través de nuestros canales oficiales.
            </p>
            <ul className="feria-lugar-datos">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                San Juan, Argentina
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Entrada libre y gratuita
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.9a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.9a16 16 0 0 0 6.08 6.08l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                (264) 421-7365 · direccionbpsj@gmail.com
              </li>
            </ul>
          </div>
          <div className="feria-lugar-map-placeholder" aria-hidden="true">
            <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" width="200" height="140">
              <rect width="200" height="140" rx="12" fill="var(--smoke)"/>
              <circle cx="100" cy="62" r="22" fill="none" stroke="var(--primary)" strokeWidth="3"/>
              <circle cx="100" cy="62" r="8" fill="var(--primary)"/>
              <path d="M100 84 L100 96" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round"/>
              <text x="100" y="118" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="var(--text-soft)">San Juan, Argentina</text>
            </svg>
          </div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────── */}
      <section className="section container feria-cta-section">
        <div className="feria-cta-inner">
          <h2 className="feria-cta-title">¿Querés recibir las novedades de la Feria?</h2>
          <p className="feria-cta-sub">Suscribite a nuestro newsletter o seguí la sección de noticias para enterarte de fechas, invitados y actividades confirmadas.</p>
          <div className="feria-cta-btns">
            <Link to="/#newsletter" className="btn btn-primary">Suscribirme al newsletter</Link>
            <Link to="/noticias" className="btn btn-outline">Ver todas las noticias</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
