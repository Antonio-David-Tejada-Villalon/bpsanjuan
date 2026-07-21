import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getLibrary, toggleLibraryLike, addLibraryComment, addReply, reactToComment, reactToReply, getLibraryHistory } from '../api/libraries';
import { useAuth } from '../context/AuthContext';
import GoogleLoginBtn from '../components/GoogleLoginBtn';
import ShareBtn from '../components/ShareBtn';

/* ── Helpers ─────────────────────────────────────────────────── */
const getAddressLink = (addr) => {
  // Texto visible: siempre la dirección legible
  const label = [addr.street, addr.locality].filter(Boolean).join(', ');
  // Link: primero el campo dedicado mapsUrl, si no existe arma búsqueda
  const href = addr.mapsUrl
    || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label + ', San Juan, Argentina')}`;
  return { href, label };
};

const waUrl = (number, name) => {
  const clean = number.replace(/\D/g, '');
  const msg = `¡Hola! Me comunico con la Biblioteca Popular ${name} para realizarles una consulta. Mi consulta es: `;
  return `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
};

const mailUrl = (email, name) => {
  const subject = `Consulta - Biblioteca Popular ${name}`;
  const body = `¡Hola!\n\nMe comunico para realizarles una consulta a la Biblioteca Popular ${name}.\n\nMi consulta es:\n\n`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

/* ── Iconos SVG ───────────────────────────────────────────────── */
const Ico = ({ d, stroke = true, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={stroke ? 'none' : 'currentColor'}
    stroke={stroke ? 'currentColor' : 'none'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const IconPin      = () => <Ico d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 10m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0" />;
const IconBus      = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="13" rx="2"/><path d="M3 8h18M8 21l-2-5M16 21l2-5M3 16h18"/>
    <circle cx="8.5" cy="18.5" r="1.5"/><circle cx="15.5" cy="18.5" r="1.5"/>
  </svg>
);
const IconPhone    = () => <Ico d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 13 19.79 19.79 0 0 1 1 4.18 2 2 0 0 1 2.98 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />;
const IconMail     = () => <Ico d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" />;
const IconGlobe    = () => <Ico d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />;
const IconBook     = () => <Ico d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />;
const IconCalendar = () => <Ico d="M3 4h18v18H3V4zM16 2v4M8 2v4M3 10h18" />;
const IconClock    = () => <Ico d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2" />;
const IconHeart    = () => <Ico d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />;

const IconWhatsApp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);
const IconFacebook = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const IconInstagram = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const IconYouTube = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75,15.02 15.5,12 9.75,8.98" fill="white" />
  </svg>
);

/* ── Componente ContactLink ───────────────────────────────────── */
function ContactLink({ href, icon, label, badge, colorClass, isPlain, external }) {
  const El = isPlain ? 'div' : 'a';
  const props = isPlain
    ? { className: `lib-contact-item lib-contact-item--plain` }
    : {
        href,
        className: `lib-contact-item lib-contact-item--${colorClass}`,
        ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})
      };
  return (
    <El {...props}>
      <span className="lib-contact-icon">{icon}</span>
      <span className="lib-contact-label">{label}</span>
      {badge && <span className="lib-contact-badge">{badge}</span>}
    </El>
  );
}

/* ── Helpers de comentarios ──────────────────────────────────── */
const timeAgo = (date) => {
  const secs = Math.floor((Date.now() - new Date(date)) / 1000);
  if (secs < 60) return 'ahora';
  if (secs < 3600) return `hace ${Math.floor(secs / 60)} min`;
  if (secs < 86400) return `hace ${Math.floor(secs / 3600)} h`;
  if (secs < 2592000) return `hace ${Math.floor(secs / 86400)} d`;
  return new Date(date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
};

const roleLabel = { admin: 'Admin', supervisor: 'Supervisor', bibliotecario: 'Bibliotecario' };

function CommentAvatar({ name, picture }) {
  if (picture) return <img className="comment-avatar" src={picture} alt={name} />;
  const initials = name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';
  return <div className="comment-avatar comment-avatar--initials">{initials}</div>;
}

function ReactionBar({ likes = [], dislikes = [], currentUserId, onReact }) {
  const uid = currentUserId?.toString();
  const liked    = uid && likes.some(id => id.toString() === uid);
  const disliked = uid && dislikes.some(id => id.toString() === uid);
  return (
    <div className="comment-reactions">
      <button
        className={`reaction-btn${liked ? ' reaction-btn--liked' : ''}`}
        onClick={() => onReact('like')}
        title="Me gusta"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
          <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
        </svg>
        {likes.length > 0 && <span>{likes.length}</span>}
      </button>
      <button
        className={`reaction-btn${disliked ? ' reaction-btn--disliked' : ''}`}
        onClick={() => onReact('dislike')}
        title="No me gusta"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={disliked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
          <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
        </svg>
        {dislikes.length > 0 && <span>{dislikes.length}</span>}
      </button>
    </div>
  );
}

export default function BibliotecaDetalle() {
  const { id } = useParams();
  const { publicUser, user } = useAuth();
  const [library, setLibrary] = useState(null);
  const [comment, setComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  const currentUserId = publicUser?._id || user?._id;
  const canComment = !!(publicUser || user);
  const canViewHistory = user && (user.role === 'admin' || (user.role === 'supervisor' && user.permissions?.canManageLibraries));

  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await getLibraryHistory(id);
      setHistory(data.history);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    getLibrary(id, controller.signal)
      .then(data => setLibrary(data.library))
      .catch(err => { if (err.name !== 'CanceledError') setError('No se pudo cargar la biblioteca.'); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [id]);

  const handleLike = async () => {
    if (!publicUser) {
      setError(user
        ? 'El like es solo para usuarios con cuenta pública (Google).'
        : 'Iniciá sesión con Google para dar like.');
      return;
    }
    try {
      const { likes } = await toggleLibraryLike(id);
      setLibrary(l => ({ ...l, likes }));
      setError('');
    } catch {
      setError('Error al procesar el like. Intentá de nuevo.');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const { comments } = await addLibraryComment(id, comment.trim());
      setLibrary(l => ({ ...l, comments }));
      setComment('');
      setError('');
    } catch {
      setError('Iniciá sesión para comentar.');
    }
  };

  const handleReply = async (e, commentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      const { comments } = await addReply(id, commentId, replyText.trim());
      setLibrary(l => ({ ...l, comments }));
      setReplyText('');
      setReplyingTo(null);
    } catch {
      setError('Iniciá sesión para responder.');
    }
  };

  const handleReactComment = async (commentId, type) => {
    if (!canComment) { setError('Iniciá sesión para reaccionar.'); return; }
    try {
      const { likes, dislikes } = await reactToComment(id, commentId, type);
      setLibrary(l => ({
        ...l,
        comments: l.comments.map(c =>
          c._id === commentId ? { ...c, likes: Array(likes).fill(null).map((_, i) => i === 0 ? currentUserId : `x${i}`), dislikes: Array(dislikes).fill(null).map((_, i) => i === 0 && type === 'dislike' ? currentUserId : `x${i}`) } : c
        )
      }));
      // Recargo desde servidor para tener IDs correctos
      const fresh = await getLibrary(id);
      setLibrary(fresh.library);
    } catch { /* ignore */ }
  };

  const handleReactReply = async (commentId, replyId, type) => {
    if (!canComment) { setError('Iniciá sesión para reaccionar.'); return; }
    try {
      await reactToReply(id, commentId, replyId, type);
      const fresh = await getLibrary(id);
      setLibrary(fresh.library);
    } catch { /* ignore */ }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!library) return <p className="empty-state">{error || 'Biblioteca no encontrada.'}</p>;

  const addr    = library.address || {};
  const contact = library.contact || {};
  const social  = library.socialMedia || {};
  const hasAddr = addr.street || addr.locality;
  const addrLink = hasAddr ? getAddressLink(addr) : null;
  const transitUrl = (addr.lat && addr.lng)
    ? `https://www.google.com/maps/dir/?api=1&destination=${addr.lat},${addr.lng}&travelmode=transit`
    : null;
  const allImages = [library.thumbnail, ...(library.images || [])].filter(Boolean);

  return (
    <div className="section container">
      <Helmet>
        <title>{library.name} | Bibliotecas Populares de San Juan</title>
        <meta name="description" content={`${library.name}${library.department?.name ? ` — ${library.department.name}` : ''}, San Juan. ${addr.street ? `Dirección: ${addr.street}.` : ''} Biblioteca popular de la Dirección de Bibliotecas Populares y Actividades Literarias.`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://bpsanjuan.vercel.app" },
            { "@type": "ListItem", "position": 2, "name": "Departamentos", "item": "https://bpsanjuan.vercel.app/departamentos" },
            ...(library.department ? [{ "@type": "ListItem", "position": 3, "name": library.department.name, "item": `https://bpsanjuan.vercel.app/departamentos/${library.department.slug}` }] : []),
            { "@type": "ListItem", "position": library.department ? 4 : 3, "name": library.name, "item": `https://bpsanjuan.vercel.app/bibliotecas/${id}` }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Library",
          "name": library.name,
          "url": `https://bpsanjuan.vercel.app/bibliotecas/${id}`,
          ...(library.description && { "description": library.description }),
          "address": {
            "@type": "PostalAddress",
            ...(addr.street && { "streetAddress": addr.street }),
            "addressLocality": addr.locality || library.department?.name || "San Juan",
            "addressRegion": "San Juan",
            "addressCountry": "AR"
          },
          ...(contact.phone && { "telephone": contact.phone }),
          ...(contact.email && { "email": contact.email }),
          ...(allImages[0] && { "image": allImages[0] }),
          "parentOrganization": {
            "@type": "GovernmentOrganization",
            "name": "Dirección de Bibliotecas Populares y Actividades Literarias de San Juan",
            "url": "https://bpsanjuan.vercel.app"
          }
        })}</script>
      </Helmet>
      <nav aria-label="Ruta de navegación" className="breadcrumb">
        <ol className="breadcrumb-list">
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/departamentos">Departamentos</Link></li>
          {library.department && (
            <li><Link to={`/departamentos/${library.department.slug}`}>{library.department.name}</Link></li>
          )}
          <li aria-current="page">{library.name}</li>
        </ol>
      </nav>

      {/* ── Hero image ── */}
      {allImages.length > 0 && (
        <div className="lib-hero-img">
          <img src={allImages[0]} alt={library.name} />
          <div className="lib-hero-overlay" />
        </div>
      )}

      {/* ── Cabecera ── */}
      <div className="lib-header card">
        <div className="card-body">
          <div className="lib-header-inner">
            <div>
              <h1 className="lib-title">{library.name}</h1>
              <div className="lib-badges">
                {library.department?.name && <span className="badge">{library.department.name}</span>}
                {library.address?.locality && <span className="badge badge-outline">{library.address.locality}</span>}
                {library.conabipRegistered && (
                  <span className="badge badge-conabip">
                    CONABIP{library.conabipNumber ? ` #${library.conabipNumber}` : ''}
                  </span>
                )}
                {library.foundedYear && (
                  <span className="lib-badge-plain">
                    <IconCalendar /> Fundada{' '}
                    {library.foundedDay && library.foundedMonth
                      ? `el ${library.foundedDay} de ${['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][library.foundedMonth - 1]} de ${library.foundedYear}`
                      : `en ${library.foundedYear}`}
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <ShareBtn title={library.name} />
              <button
                className="btn-like"
                onClick={handleLike}
                aria-label={`Me gusta, ${library.likes ?? 0} likes`}
              >
                <span aria-hidden="true"><IconHeart /></span>
                <span aria-hidden="true">{library.likes ?? 0}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid principal ── */}
      <div className="lib-grid">

        {/* Columna izquierda: Contacto */}
        <div className="lib-col">
          <div className="card">
            <div className="card-body">
              <h3 className="lib-section-title">Contacto</h3>
              <div className="lib-contact-list">
                {addrLink && (
                  <ContactLink
                    href={addrLink.href} external
                    icon={<IconPin />}
                    label={addrLink.label}
                    badge="Google Maps"
                    colorClass="maps"
                  />
                )}
                {transitUrl && (
                  <ContactLink
                    href={transitUrl} external
                    icon={<IconBus />}
                    label="Cómo llegar en transporte"
                    badge="Red Tulum"
                    colorClass="transit"
                  />
                )}
                {contact.phone && (
                  <ContactLink
                    href={`tel:${contact.phone}`}
                    icon={<IconPhone />}
                    label={contact.phone}
                    badge="Llamar"
                    colorClass="phone"
                  />
                )}
                {contact.whatsapp && (
                  <ContactLink
                    href={waUrl(contact.whatsapp, library.name)} external
                    icon={<IconWhatsApp />}
                    label="WhatsApp"
                    badge="Abrir chat"
                    colorClass="wa"
                  />
                )}
                {contact.email && (
                  <ContactLink
                    href={mailUrl(contact.email, library.name)}
                    icon={<IconMail />}
                    label={contact.email}
                    badge="Escribir"
                    colorClass="mail"
                  />
                )}
                {/* contact.website → DigiBepe */}
                {contact.website && (
                  <ContactLink
                    href={contact.website} external
                    icon={<IconBook />}
                    label="Catálogo DigiBepe"
                    badge="Ver libros"
                    colorClass="digi"
                  />
                )}
                {/* digibepe field → Sitio web */}
                {library.digibepe && (
                  <ContactLink
                    href={library.digibepe} external
                    icon={<IconGlobe />}
                    label={library.digibepe.replace(/^https?:\/\//, '')}
                    badge="Visitar"
                    colorClass="web"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Redes sociales */}
          {(social.facebook || social.instagram || social.youtube) && (
            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-body">
                <h3 className="lib-section-title">Redes sociales</h3>
                <div className="lib-social-row">
                  {social.facebook && (
                    <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="lib-social-btn lib-social-btn--fb">
                      <IconFacebook /><span>Facebook</span>
                    </a>
                  )}
                  {social.instagram && (
                    <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="lib-social-btn lib-social-btn--ig">
                      <IconInstagram /><span>Instagram</span>
                    </a>
                  )}
                  {social.youtube && (
                    <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="lib-social-btn lib-social-btn--yt">
                      <IconYouTube /><span>YouTube</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha: Horarios + Descripción + Servicios */}
        <div className="lib-col">
          {library.schedule?.length > 0 && (
            <div className="card">
              <div className="card-body">
                <h3 className="lib-section-title"><IconClock /> Horarios</h3>
                <ul className="lib-schedule-list">
                  {library.schedule.map((s, i) => (
                    <li key={i}>
                      <span className="lib-schedule-day">{s.day}</span>
                      <span className="lib-schedule-time">{s.open} – {s.close}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {library.description && (
            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-body">
                <h3 className="lib-section-title">Sobre la biblioteca</h3>
                <p className="lib-description">{library.description}</p>
              </div>
            </div>
          )}

          {library.services?.length > 0 && (
            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-body">
                <h3 className="lib-section-title">Servicios</h3>
                <div className="lib-services">
                  {library.services.map((s, i) => <span key={i} className="badge">{s}</span>)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Galería ── */}
      {allImages.length > 1 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-body">
            <h3 className="lib-section-title">Galería</h3>
            <div className="lib-gallery">
              {allImages.map((src, i) => (
                <button key={i} className="lib-gallery-item" onClick={() => setLightbox(src)}>
                  <img src={src} alt={`${library.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="modal-overlay" onClick={() => setLightbox(null)}>
          <div style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <img src={lightbox} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, display: 'block' }} />
            <button
              onClick={() => setLightbox(null)}
              style={{ position: 'absolute', top: -12, right: -12, background: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16, fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
            >✕</button>
          </div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <p className="alert alert-error" style={{ margin: 0 }}>{error}</p>
          {!publicUser && !user && <GoogleLoginBtn className="btn btn-sm btn-primary" />}
        </div>
      )}

      {/* ── Historial de ediciones (admin/supervisor) ── */}
      {canViewHistory && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-body">
            <div className="edit-history-head">
              <h3 className="lib-section-title">Historial de ediciones</h3>
              {history === null && !historyLoading && (
                <button className="btn btn-outline btn-sm" onClick={loadHistory}>Cargar historial</button>
              )}
            </div>
            {historyLoading && <div className="spinner" style={{ margin: '16px auto' }} />}
            {history !== null && history.length === 0 && (
              <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>Sin ediciones registradas todavía.</p>
            )}
            {history !== null && history.length > 0 && (
              <ul className="edit-history-list">
                {history.map(entry => (
                  <li key={entry._id} className="edit-history-item">
                    <div className="edit-history-dot" />
                    <div className="edit-history-body">
                      <div className="edit-history-meta">
                        <span className="edit-history-who">{entry.editedBy?.name || 'Usuario'}</span>
                        <span className="edit-history-role">{entry.editedBy?.role}</span>
                        <span className="edit-history-when">
                          {new Date(entry.editedAt).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <ul className="edit-history-fields">
                        {entry.changes.map((c, i) => (
                          <li key={i} className="edit-history-field">
                            <span className="edit-history-field-name">{c.field}</span>
                            {typeof c.from !== 'object' && typeof c.to !== 'object' && (
                              <span className="edit-history-diff">
                                <span className="edit-history-from">{String(c.from ?? '—')}</span>
                                <span className="edit-history-arrow">→</span>
                                <span className="edit-history-to">{String(c.to ?? '—')}</span>
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ── Comentarios ── */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-body">
          <h3 className="lib-section-title">
            Comentarios ({library.comments?.filter(c => !c.hidden).length ?? 0})
          </h3>

          {/* Formulario nuevo comentario */}
          <form onSubmit={handleComment} className="comment-form">
            <label htmlFor="biblio-comment" className="visually-hidden">Tu comentario</label>
            <textarea
              id="biblio-comment"
              rows={3}
              placeholder={canComment ? 'Escribí un comentario...' : 'Iniciá sesión con Google para comentar'}
              value={comment}
              onChange={e => setComment(e.target.value)}
              disabled={!canComment}
              maxLength={500}
            />
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={!canComment}>
                  Comentar
                </button>
                {!canComment && <GoogleLoginBtn className="btn btn-sm btn-outline" />}
              </div>
              <span style={{ fontSize: 12, color: comment.length > 450 ? 'var(--primary)' : 'var(--text-soft)' }}
                    aria-live="polite" aria-atomic="true">
                {comment.length}/500
              </span>
            </div>
          </form>

          {/* Lista de comentarios */}
          <ul className="comment-list">
            {library.comments?.map(c => {
              const author = c.authorType === 'staff'
                ? { name: c.staffUser?.name || 'Staff', picture: null, role: c.staffUser?.role }
                : { name: c.publicUser?.name || 'Usuario', picture: c.publicUser?.picture, role: null };

              return (
                <li key={c._id} className="comment-item">
                  <div className="comment-header">
                    <CommentAvatar name={author.name} picture={author.picture} />
                    <div className="comment-meta">
                      <span className="comment-author">
                        {author.name}
                        {author.role && (
                          <span className="comment-role-badge">{roleLabel[author.role] || author.role}</span>
                        )}
                      </span>
                      <span className="comment-time">{timeAgo(c.createdAt)}</span>
                    </div>
                  </div>
                  <p className="comment-text">{c.text}</p>
                  <div className="comment-actions">
                    <ReactionBar
                      likes={c.likes || []}
                      dislikes={c.dislikes || []}
                      currentUserId={currentUserId}
                      onReact={type => handleReactComment(c._id, type)}
                    />
                    {canComment && (
                      <button
                        className="comment-reply-btn"
                        onClick={() => setReplyingTo(replyingTo === c._id ? null : c._id)}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
                        </svg>
                        Responder
                        {c.replies?.length > 0 && ` (${c.replies.length})`}
                      </button>
                    )}
                  </div>

                  {/* Respuestas */}
                  {(c.replies?.length > 0 || replyingTo === c._id) && (
                    <div className="comment-replies">
                      {c.replies?.map(r => {
                        const rAuthor = r.authorType === 'staff'
                          ? { name: r.staffUser?.name || 'Staff', picture: null, role: r.staffUser?.role }
                          : { name: r.publicUser?.name || 'Usuario', picture: r.publicUser?.picture, role: null };
                        return (
                          <div key={r._id} className="reply-item">
                            <div className="comment-header">
                              <CommentAvatar name={rAuthor.name} picture={rAuthor.picture} />
                              <div className="comment-meta">
                                <span className="comment-author">
                                  {rAuthor.name}
                                  {rAuthor.role && (
                                    <span className="comment-role-badge">{roleLabel[rAuthor.role] || rAuthor.role}</span>
                                  )}
                                </span>
                                <span className="comment-time">{timeAgo(r.createdAt)}</span>
                              </div>
                            </div>
                            <p className="comment-text">{r.text}</p>
                            <ReactionBar
                              likes={r.likes || []}
                              dislikes={r.dislikes || []}
                              currentUserId={currentUserId}
                              onReact={type => handleReactReply(c._id, r._id, type)}
                            />
                          </div>
                        );
                      })}

                      {/* Formulario de respuesta inline */}
                      {replyingTo === c._id && (
                        <form className="reply-form" onSubmit={e => handleReply(e, c._id)}>
                          <label htmlFor={`reply-${c._id}`} className="visually-hidden">Tu respuesta</label>
                          <textarea
                            id={`reply-${c._id}`}
                            rows={2}
                            placeholder="Escribí tu respuesta..."
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            autoFocus
                          />
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button type="submit" className="btn btn-primary btn-sm">Responder</button>
                            <button type="button" className="btn btn-outline btn-sm" onClick={() => { setReplyingTo(null); setReplyText(''); }}>
                              Cancelar
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
            {library.comments?.length === 0 && (
              <li style={{ padding: '20px 0', color: 'var(--text-soft)', textAlign: 'center' }}>
                Todavía no hay comentarios. ¡Sé el primero!
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
