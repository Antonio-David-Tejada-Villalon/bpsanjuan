// Vercel Edge Middleware — Open Graph para bots de redes sociales y apps de mensajería.
// Cuando WhatsApp, Telegram, Facebook, etc. piden /noticias/:id o /bibliotecas/:id,
// este middleware intercepta la petición, trae los datos del API y devuelve
// HTML mínimo con las meta OG correctas para la vista previa del enlace.
// Los usuarios normales pasan directo al SPA sin ningún overhead.

const BOT_UA =
  /whatsapp|facebookexternalhit|facebookbot|twitterbot|telegrambot|linkedinbot|discordbot|slackbot-linkexpanding|applebot|googlebot|bingbot|rogerbot|embedly|quora link preview|showyoubot|outbrain|pinterest/i;

function isBot(ua) {
  return BOT_UA.test(ua || '');
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildOgHtml({ title, description, image, url, type = 'website' }) {
  const SITE = 'Bibliotecas Populares de San Juan';
  const imgTags = image
    ? `
  <meta property="og:image"        content="${esc(image)}">
  <meta property="og:image:width"  content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:image"       content="${esc(image)}">`
    : '\n  <meta name="twitter:card" content="summary">';

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${esc(title)}</title>
<meta name="description"          content="${esc(description)}">
<meta property="og:type"          content="${esc(type)}">
<meta property="og:site_name"     content="${esc(SITE)}">
<meta property="og:title"         content="${esc(title)}">
<meta property="og:description"   content="${esc(description)}">
<meta property="og:url"           content="${esc(url)}">
<meta property="og:locale"        content="es_AR">${imgTags}
<meta name="twitter:title"        content="${esc(title)}">
<meta name="twitter:description"  content="${esc(description)}">
<meta http-equiv="refresh"        content="0;url=${esc(url)}">
</head>
<body><p><a href="${esc(url)}">${esc(title)}</a></p></body>
</html>`;
}

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  if (!isBot(ua)) return; // usuario normal → pasa al SPA

  const { pathname, origin } = new URL(request.url);

  const newsMatch = pathname.match(/^\/noticias\/([a-f0-9]{24})$/i);
  const libMatch  = pathname.match(/^\/bibliotecas\/([a-f0-9]{24})$/i);

  if (!newsMatch && !libMatch) return; // ruta no dinámica → pasa al SPA

  // La URL del API se configura en las variables de entorno de Vercel
  const apiBase = process.env.VITE_API_URL || '';

  try {
    let title, description, image;

    if (newsMatch) {
      const res = await fetch(`${apiBase}/api/news/${newsMatch[1]}`);
      if (!res.ok) return;
      const { news } = await res.json();
      title       = `${news.title} — Bibliotecas Populares de San Juan`;
      description = news.summary || '';
      image       = news.thumbnail || null;
    } else {
      const res = await fetch(`${apiBase}/api/libraries/${libMatch[1]}`);
      if (!res.ok) return;
      const { library } = await res.json();
      const lugar = library.address?.locality || 'San Juan';
      title       = `${library.name} — Bibliotecas Populares de San Juan`;
      description = library.description || `Biblioteca popular en ${lugar}, San Juan.`;
      image       = library.thumbnail || library.images?.[0] || null;
    }

    return new Response(
      buildOgHtml({ title, description, image, url: origin + pathname }),
      {
        headers: {
          'Content-Type':  'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300, s-maxage=300',
        },
      }
    );
  } catch {
    return; // error al fetchar → pasa al SPA normalmente
  }
}

export const config = {
  matcher: ['/noticias/:id*', '/bibliotecas/:id*'],
};
