import { Helmet } from 'react-helmet-async';
import './LegalPage.css';

export default function Privacidad() {
  return (
    <article className="legal-page section container">
      <Helmet>
        <title>Política de Privacidad | Bibliotecas Populares de San Juan</title>
        <meta name="description" content="Política de privacidad y protección de datos personales del sitio web de la Dirección de Bibliotecas Populares de San Juan, conforme a la Ley 25.326." />
      </Helmet>

      <header className="legal-header">
        <p className="legal-eyebrow">Marco legal: Ley 25.326</p>
        <h1 className="legal-title">Política de Privacidad</h1>
        <p className="legal-date">Vigente desde julio de 2025 · Última revisión: julio de 2026</p>
      </header>

      <section className="legal-section">
        <h2>1. Responsable del tratamiento</h2>
        <p>
          La <strong>Dirección de Bibliotecas Populares y Actividades Literarias de San Juan</strong>,
          organismo del Gobierno de la Provincia de San Juan, es responsable del sitio web
          accesible en <strong>bpsanjuan.vercel.app</strong> y del tratamiento de los datos
          personales recopilados a través del mismo.
        </p>
        <p>
          Contacto: si tiene consultas sobre sus datos puede escribirnos a través del
          formulario de contacto disponible en el sitio o a los canales institucionales.
        </p>
      </section>

      <section className="legal-section">
        <h2>2. Datos que recopilamos</h2>
        <p>Este sitio puede recopilar las siguientes categorías de datos personales:</p>
        <ul>
          <li>
            <strong>Autenticación con Google:</strong> cuando iniciás sesión mediante Google,
            recibimos tu nombre, dirección de correo electrónico y foto de perfil públicos,
            provistos por Google LLC bajo sus propios{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              términos de privacidad
            </a>.
          </li>
          <li>
            <strong>Comentarios:</strong> el texto que escribís en comentarios se almacena
            asociado a tu perfil de usuario.
          </li>
          <li>
            <strong>Datos de navegación:</strong> registramos páginas visitadas de forma
            agregada y anónima para estadísticas de uso interno (no se comparten con terceros).
          </li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>3. Finalidad del tratamiento</h2>
        <ul>
          <li>Habilitar el inicio de sesión y la identificación en el sitio.</li>
          <li>Permitir la publicación y moderación de comentarios en noticias y bibliotecas.</li>
          <li>Mejorar el funcionamiento del sitio mediante estadísticas de uso anónimas.</li>
        </ul>
        <p>No utilizamos sus datos con fines comerciales ni los cedemos a terceros.</p>
      </section>

      <section className="legal-section">
        <h2>4. Base legal</h2>
        <p>
          El tratamiento se realiza en el marco de la{' '}
          <strong>Ley N.º 25.326 de Protección de los Datos Personales</strong> de la
          República Argentina y sus normas reglamentarias. Al registrarse o comentar,
          usted presta consentimiento informado para el tratamiento descrito.
        </p>
      </section>

      <section className="legal-section">
        <h2>5. Derechos del titular</h2>
        <p>
          Conforme al artículo 14 de la Ley 25.326, usted tiene derecho a:
        </p>
        <ul>
          <li><strong>Acceso:</strong> conocer qué datos personales suyos están almacenados.</li>
          <li><strong>Rectificación:</strong> solicitar la corrección de datos inexactos.</li>
          <li><strong>Supresión:</strong> pedir la eliminación de sus datos cuando ya no sean necesarios.</li>
          <li><strong>Oposición:</strong> oponerse al tratamiento en determinadas circunstancias.</li>
        </ul>
        <p>
          Para ejercer estos derechos puede solicitarlo a través de nuestros canales de contacto
          institucionales. La Agencia de Acceso a la Información Pública (
          <a href="https://www.argentina.gob.ar/aaip" target="_blank" rel="noopener noreferrer">
            www.argentina.gob.ar/aaip
          </a>
          ) actúa como órgano de control de la Ley 25.326.
        </p>
      </section>

      <section className="legal-section">
        <h2>6. Cookies y almacenamiento local</h2>
        <p>
          El sitio utiliza <code>localStorage</code> exclusivamente para recordar la
          preferencia de tema (claro / oscuro) del usuario. No se utilizan cookies de
          seguimiento ni publicidad de terceros.
        </p>
      </section>

      <section className="legal-section">
        <h2>7. Seguridad</h2>
        <p>
          Implementamos medidas técnicas y organizativas razonables para proteger sus datos:
          comunicaciones cifradas mediante HTTPS, contraseñas almacenadas con hash (bcrypt)
          y control de acceso por roles en el panel de administración.
        </p>
      </section>

      <section className="legal-section">
        <h2>8. Cambios en esta política</h2>
        <p>
          Podemos actualizar esta política periódicamente. La fecha de "última revisión"
          al inicio de la página indica la versión vigente. Le recomendamos consultarla
          regularmente.
        </p>
      </section>
    </article>
  );
}
