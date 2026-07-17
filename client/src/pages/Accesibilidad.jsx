import { Helmet } from 'react-helmet-async';
import './LegalPage.css';

export default function Accesibilidad() {
  return (
    <article className="legal-page section container">
      <Helmet>
        <title>Declaración de Accesibilidad | Bibliotecas Populares de San Juan</title>
        <meta name="description" content="Declaración de accesibilidad web del sitio de la Dirección de Bibliotecas Populares de San Juan, conforme a la Ley 26.653 y WCAG 2.1 AA." />
      </Helmet>

      <header className="legal-header">
        <p className="legal-eyebrow">Marco legal: Ley 26.653</p>
        <h1 className="legal-title">Declaración de Accesibilidad</h1>
        <p className="legal-date">Evaluación: julio de 2026 · Revisión prevista: julio de 2027</p>
      </header>

      <section className="legal-section">
        <h2>Compromiso con la accesibilidad</h2>
        <p>
          La <strong>Dirección de Bibliotecas Populares y Actividades Literarias de San Juan</strong>{' '}
          se compromete a garantizar la accesibilidad de su sitio web para todas las personas,
          incluyendo aquellas con discapacidades visuales, auditivas, motrices o cognitivas,
          en cumplimiento de la <strong>Ley N.º 26.653 de Accesibilidad de la Información en
          las Páginas Web</strong> y sus normas reglamentarias.
        </p>
      </section>

      <section className="legal-section">
        <h2>Estado de conformidad</h2>
        <p>
          Este sitio aspira a cumplir parcialmente con las{' '}
          <a href="https://www.w3.org/TR/WCAG21/" target="_blank" rel="noopener noreferrer">
            Pautas de Accesibilidad para el Contenido Web (WCAG) 2.1
          </a>{' '}
          nivel <strong>AA</strong>. Se han implementado las siguientes medidas:
        </p>
        <ul>
          <li>
            <strong>Contraste de color:</strong> los textos y enlaces en modo claro utilizan
            el color <code>#B85500</code> sobre fondo blanco (relación 4.87:1, supera el
            mínimo WCAG AA de 4.5:1). En modo oscuro se utiliza <code>#FA7506</code> sobre
            fondo <code>#121212</code> (6.94:1).
          </li>
          <li>
            <strong>Texto alternativo:</strong> todas las imágenes funcionales incluyen
            atributo <code>alt</code>; las decorativas llevan <code>aria-hidden="true"</code>.
          </li>
          <li>
            <strong>Navegación por teclado:</strong> todos los controles interactivos son
            accesibles mediante teclado.
          </li>
          <li>
            <strong>Movimiento reducido:</strong> el sitio respeta la preferencia del sistema
            operativo <code>prefers-reduced-motion</code>, desactivando animaciones cuando
            el usuario lo solicita.
          </li>
          <li>
            <strong>Idioma:</strong> el documento HTML declara <code>lang="es"</code>.
          </li>
          <li>
            <strong>Estructura semántica:</strong> se utilizan elementos HTML semánticos
            (<code>&lt;main&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;footer&gt;</code>,
            <code>&lt;article&gt;</code>, encabezados jerárquicos).
          </li>
          <li>
            <strong>Etiquetas ARIA:</strong> los botones sin texto visible incluyen
            <code>aria-label</code>; los íconos decorativos llevan <code>aria-hidden</code>.
          </li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>Limitaciones conocidas</h2>
        <p>
          A pesar de nuestros esfuerzos, existen áreas en proceso de mejora:
        </p>
        <ul>
          <li>El contenido de imágenes de las galerías de bibliotecas puede carecer de descripciones detalladas cuando las imágenes son subidas por terceros sin texto alternativo.</li>
          <li>La galería de Instagram embebida depende del contenido de la cuenta institucional, cuya accesibilidad es responsabilidad de Meta Platforms.</li>
          <li>Los videos incrustados de YouTube pueden no contar con subtítulos en todos los casos.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>Retroalimentación y contacto</h2>
        <p>
          Si encuentra barreras de accesibilidad en este sitio o necesita información en un
          formato alternativo, puede comunicarse con nosotros a través de los canales
          institucionales de la Dirección de Bibliotecas Populares de San Juan.
        </p>
        <p>
          Nos comprometemos a responder en un plazo máximo de 15 días hábiles.
        </p>
      </section>

      <section className="legal-section">
        <h2>Enfoque técnico</h2>
        <p>
          El sitio fue desarrollado con React y Vite, utilizando CSS con variables de diseño
          que permiten soporte nativo para temas claro y oscuro mediante{' '}
          <code>prefers-color-scheme</code>. Se realizan evaluaciones periódicas con
          herramientas automatizadas y revisión manual.
        </p>
      </section>

      <section className="legal-section">
        <h2>Marco normativo</h2>
        <ul>
          <li>Ley N.º 26.653 — Accesibilidad de la información en las páginas web (Argentina)</li>
          <li>Decreto 355/2013 — Reglamentación de la Ley 26.653</li>
          <li>Ley Provincial N.º 336-F — Protección y Fomento de Bibliotecas Populares (San Juan)</li>
          <li>WCAG 2.1 AA — Web Content Accessibility Guidelines del W3C</li>
        </ul>
      </section>
    </article>
  );
}
