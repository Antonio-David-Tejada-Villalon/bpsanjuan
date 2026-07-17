import { Helmet } from 'react-helmet-async';
import './Nosotros.css';

const STATS = [
  { value: '56', label: 'Bibliotecas Populares' },
  { value: '19', label: 'Departamentos de San Juan' },
  { value: '1967', label: 'Año de fundación de la red' },
];

const OBJECTIVES = [
  'Proteger y fomentar a las Bibliotecas Populares de toda la provincia, existentes y a crearse.',
  'Planificar y proyectar actividades destinadas al crecimiento de las Bibliotecas Populares.',
  'Organizar conferencias, cursos, talleres y charlas para el perfeccionamiento de bibliotecas y personal.',
  'Estimular el entrenamiento en ofimática y administración de Digibepe.',
  'Promocionar la actividad literaria local y de autores sanjuaninos.',
  'Estimular acciones que acerquen a la comunidad a la Biblioteca Popular.',
];

export default function Nosotros() {
  return (
    <>
      <Helmet>
        <title>Institucional | Dirección de Bibliotecas Populares — San Juan</title>
        <meta name="description" content="Misión, visión y objetivos de la Dirección de Bibliotecas Populares y Actividades Literarias de San Juan. 56 bibliotecas populares en 19 departamentos." />
      </Helmet>

      {/* ── Hero institucional ── */}
      <section className="nos-hero">
        <div className="container nos-hero-inner">
          <p className="nos-eyebrow">Gobierno de la Provincia de San Juan</p>
          <h1 className="nos-hero-title">
            Dirección de Bibliotecas Populares<br />
            y Actividades Literarias
          </h1>
          <p className="nos-hero-lead">
            Organismo público que promueve, fomenta y articula la red de
            bibliotecas populares de San Juan, acercando la cultura y la lectura
            a toda la comunidad provincial.
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="nos-stats-band">
        <div className="container nos-stats-inner">
          {STATS.map(({ value, label }) => (
            <div key={label} className="nos-stat">
              <span className="nos-stat-value">{value}</span>
              <span className="nos-stat-label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Misión + Visión ── */}
      <section className="section container nos-mv">
        <div className="nos-mv-card">
          <div className="nos-mv-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 className="nos-mv-heading">Misión</h2>
          <p className="nos-mv-text">
            Promover y estimular las Bibliotecas Populares como canales abiertos
            para la difusión y promoción de la lectura, de la mano de acciones
            culturales de distintas expresiones artísticas y comunitarias.
          </p>
        </div>

        <div className="nos-mv-card nos-mv-card--vision">
          <div className="nos-mv-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <h2 className="nos-mv-heading">Visión</h2>
          <p className="nos-mv-text">
            Lograr que cada biblioteca popular se convierta en un Centro de Gestión
            Cultural, inmerso en su comunidad, con acceso abierto para todo público
            sin excepción, en los 19 departamentos de la provincia.
          </p>
        </div>
      </section>

      {/* ── Objetivos estratégicos ── */}
      <section className="nos-objectives-band">
        <div className="container nos-objectives-inner">
          <h2 className="nos-section-title">Objetivos Estratégicos</h2>
          <ol className="nos-obj-list">
            {OBJECTIVES.map((obj, i) => (
              <li key={i} className="nos-obj-item">
                <span className="nos-obj-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="nos-obj-text">{obj}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Valores + CONABIP ── */}
      <section className="section container nos-bottom">
        <div className="nos-value-card">
          <h2 className="nos-mv-heading">Valores Compartidos</h2>
          <p className="nos-mv-text">
            Trabajo en equipo junto a la Federación de Bibliotecas Populares,
            respeto por el espacio funcional de cada integrante, y compromiso
            con el mejor servicio a la comunidad: bibliotecas, bibliotecarios,
            escritores, editoriales y lectores.
          </p>
        </div>

        <div className="nos-value-card">
          <h2 className="nos-mv-heading">Marco Legal</h2>
          <p className="nos-mv-text">
            La Dirección fue creada por la{' '}
            <strong>Ley Provincial N.º 336-F</strong> de la Cámara de Diputados
            de San Juan, que establece sus funciones, crea un fondo especial
            de fomento y otorga a las bibliotecas adheridas exenciones de
            impuestos provinciales y de tarifas de servicios públicos (OSSE y SES).
            A nivel nacional, las bibliotecas se rigen por la{' '}
            <strong>Ley Nacional N.º 23.351</strong> y trabajan con la{' '}
            <a href="https://www.conabip.gob.ar/" target="_blank" rel="noopener noreferrer">
              CONABIP
            </a>{' '}
            (Comisión Nacional de Bibliotecas Populares).
          </p>
        </div>

        <div className="nos-value-card">
          <h2 className="nos-mv-heading">Ferias del Libro</h2>
          <p className="nos-mv-text">
            San Juan participa históricamente en la Feria Internacional del Libro
            de Buenos Aires —la más grande de Latinoamérica— fomentando la
            escritura, la lectura y los autores sanjuaninos.
          </p>
        </div>
      </section>
    </>
  );
}
