const router = require('express').Router();
const PageView = require('../models/PageView');
const Library = require('../models/Library');
const News = require('../models/News');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const XLSX = require('xlsx');
const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType } = require('docx');

let geoip;
try { geoip = require('geoip-lite'); } catch {}

const COUNTRY_NAMES = {
  AD:'Andorra', AE:'Emiratos Árabes', AF:'Afganistán', AG:'Antigua y Barbuda',
  AL:'Albania', AM:'Armenia', AO:'Angola', AR:'Argentina', AT:'Austria',
  AU:'Australia', AZ:'Azerbaiyán', BA:'Bosnia y Herzegovina', BB:'Barbados',
  BD:'Bangladesh', BE:'Bélgica', BF:'Burkina Faso', BG:'Bulgaria', BH:'Baréin',
  BI:'Burundi', BJ:'Benín', BN:'Brunéi', BO:'Bolivia', BR:'Brasil', BS:'Bahamas',
  BT:'Bután', BW:'Botsuana', BY:'Bielorrusia', BZ:'Belice', CA:'Canadá',
  CD:'Rep. Dem. del Congo', CF:'Rep. Centroafricana', CG:'Congo', CH:'Suiza',
  CI:'Costa de Marfil', CL:'Chile', CM:'Camerún', CN:'China', CO:'Colombia',
  CR:'Costa Rica', CU:'Cuba', CV:'Cabo Verde', CY:'Chipre', CZ:'Rep. Checa',
  DE:'Alemania', DJ:'Yibuti', DK:'Dinamarca', DM:'Dominica', DO:'Rep. Dominicana',
  DZ:'Argelia', EC:'Ecuador', EE:'Estonia', EG:'Egipto', ER:'Eritrea', ES:'España',
  ET:'Etiopía', FI:'Finlandia', FJ:'Fiyi', FR:'Francia', GA:'Gabón', GB:'Reino Unido',
  GD:'Granada', GE:'Georgia', GH:'Ghana', GM:'Gambia', GN:'Guinea', GQ:'Guinea Ecuatorial',
  GR:'Grecia', GT:'Guatemala', GW:'Guinea-Bisáu', GY:'Guyana', HN:'Honduras',
  HR:'Croacia', HT:'Haití', HU:'Hungría', ID:'Indonesia', IE:'Irlanda', IL:'Israel',
  IN:'India', IQ:'Irak', IR:'Irán', IS:'Islandia', IT:'Italia', JM:'Jamaica',
  JO:'Jordania', JP:'Japón', KE:'Kenia', KG:'Kirguistán', KH:'Camboya', KI:'Kiribati',
  KM:'Comoras', KN:'San Cristóbal y Nieves', KP:'Corea del Norte', KR:'Corea del Sur',
  KW:'Kuwait', KZ:'Kazajistán', LA:'Laos', LB:'Líbano', LC:'Santa Lucía',
  LI:'Liechtenstein', LK:'Sri Lanka', LR:'Liberia', LS:'Lesoto', LT:'Lituania',
  LU:'Luxemburgo', LV:'Letonia', LY:'Libia', MA:'Marruecos', MC:'Mónaco',
  MD:'Moldavia', ME:'Montenegro', MG:'Madagascar', MH:'Islas Marshall',
  MK:'Macedonia del Norte', ML:'Malí', MM:'Myanmar', MN:'Mongolia', MR:'Mauritania',
  MT:'Malta', MU:'Mauricio', MV:'Maldivas', MW:'Malaui', MX:'México', MY:'Malasia',
  MZ:'Mozambique', NA:'Namibia', NE:'Níger', NG:'Nigeria', NI:'Nicaragua',
  NL:'Países Bajos', NO:'Noruega', NP:'Nepal', NR:'Nauru', NZ:'Nueva Zelanda',
  OM:'Omán', PA:'Panamá', PE:'Perú', PG:'Papúa Nueva Guinea', PH:'Filipinas',
  PK:'Pakistán', PL:'Polonia', PT:'Portugal', PW:'Palaos', PY:'Paraguay',
  QA:'Catar', RO:'Rumanía', RS:'Serbia', RU:'Rusia', RW:'Ruanda',
  SA:'Arabia Saudita', SB:'Islas Salomón', SC:'Seychelles', SD:'Sudán',
  SE:'Suecia', SG:'Singapur', SI:'Eslovenia', SK:'Eslovaquia', SL:'Sierra Leona',
  SM:'San Marino', SN:'Senegal', SO:'Somalia', SR:'Surinam', SS:'Sudán del Sur',
  ST:'Santo Tomé y Príncipe', SV:'El Salvador', SY:'Siria', SZ:'Suazilandia',
  TD:'Chad', TG:'Togo', TH:'Tailandia', TJ:'Tayikistán', TL:'Timor Oriental',
  TM:'Turkmenistán', TN:'Túnez', TO:'Tonga', TR:'Turquía', TT:'Trinidad y Tobago',
  TV:'Tuvalu', TZ:'Tanzania', UA:'Ucrania', UG:'Uganda', US:'Estados Unidos',
  UY:'Uruguay', UZ:'Uzbekistán', VA:'Ciudad del Vaticano', VC:'San Vicente y las Granadinas',
  VE:'Venezuela', VN:'Vietnam', VU:'Vanuatu', WS:'Samoa', YE:'Yemen',
  ZA:'Sudáfrica', ZM:'Zambia', ZW:'Zimbabue', TW:'Taiwán', HK:'Hong Kong',
  PS:'Palestina', MO:'Macao', GL:'Groenlandia', FO:'Islas Feroe', GG:'Guernsey',
  JE:'Jersey', IM:'Isla de Man', NC:'Nueva Caledonia', PF:'Polinesia Francesa',
  YT:'Mayotte', RE:'Reunión', MQ:'Martinica', GP:'Guadalupe', GF:'Guayana Francesa',
  CW:'Curazao', SX:'Sint Maarten', BL:'San Bartolomé', MF:'San Martín',
  PM:'San Pedro y Miquelón', WF:'Wallis y Futuna',
};

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return fwd.split(',')[0].trim();
  return req.ip || req.connection?.remoteAddress || null;
}

function getDateRange(period) {
  const days = period === 'year' ? 365 : period === 'month' ? 30 : 7;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function parseResourceFromPath(path) {
  if (!path || path === '/') return { resourceType: 'home', resourceId: null };
  if (path === '/nosotros') return { resourceType: 'nosotros', resourceId: null };
  if (path === '/noticias') return { resourceType: 'noticias', resourceId: null };
  const libMatch = path.match(/^\/bibliotecas\/([a-f0-9]{24})$/i);
  if (libMatch) return { resourceType: 'biblioteca', resourceId: libMatch[1] };
  const newsMatch = path.match(/^\/noticias\/([a-f0-9]{24})$/i);
  if (newsMatch) return { resourceType: 'noticia', resourceId: newsMatch[1] };
  if (path.startsWith('/departamentos/')) return { resourceType: 'departamento', resourceId: null };
  return { resourceType: 'otro', resourceId: null };
}

function isPrivateIp(ip) {
  return !ip || ip === '::1' || ip === '127.0.0.1' ||
    ip.startsWith('192.168.') || ip.startsWith('10.') ||
    ip.startsWith('172.16.') || ip.startsWith('::ffff:127.');
}

// POST /api/analytics/track — completamente público, fallo silencioso
router.post('/track', async (req, res) => {
  res.status(204).end();
  try {
    const { path, type = 'view', resourceId, resourceName, resourceType: clientType, userType = 'anon' } = req.body;
    if (!path) return;

    const ip = getClientIp(req);
    let country = null, countryCode = null, city = null, lat = null, lon = null;

    if (geoip && !isPrivateIp(ip)) {
      const geo = geoip.lookup(ip);
      if (geo) {
        countryCode = geo.country;
        city = geo.city || null;
        if (geo.ll) { lat = geo.ll[0]; lon = geo.ll[1]; }
        country = COUNTRY_NAMES[geo.country] || geo.country;
      }
    }

    const parsed = parseResourceFromPath(path);

    await PageView.create({
      path,
      type,
      resourceType: clientType || parsed.resourceType,
      resourceId: resourceId || parsed.resourceId || null,
      resourceName: resourceName || null,
      userType,
      ip,
      country,
      countryCode,
      city,
      lat,
      lon
    });
  } catch {} // completamente silencioso
});

// Todos los endpoints de lectura requieren admin
router.use(protect, restrictTo('admin'));

// GET /api/analytics/overview?period=week|month|year
router.get('/overview', async (req, res) => {
  try {
    const since = getDateRange(req.query.period || 'week');

    const [totalViews, uniqueIps, countriesAgg, totalShares] = await Promise.all([
      PageView.countDocuments({ type: 'view', createdAt: { $gte: since } }),
      PageView.distinct('ip', { type: 'view', createdAt: { $gte: since }, ip: { $ne: null } }),
      PageView.aggregate([
        { $match: { type: 'view', createdAt: { $gte: since }, countryCode: { $ne: null } } },
        { $group: { _id: '$countryCode' } },
        { $count: 'total' }
      ]),
      PageView.countDocuments({ type: 'share', createdAt: { $gte: since } })
    ]);

    res.json({
      totalViews,
      uniqueVisitors: uniqueIps.length,
      countries: countriesAgg[0]?.total || 0,
      totalShares
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/geo?period=week|month|year
router.get('/geo', async (req, res) => {
  try {
    const since = getDateRange(req.query.period || 'week');

    const data = await PageView.aggregate([
      { $match: { type: 'view', createdAt: { $gte: since }, countryCode: { $ne: null } } },
      { $group: {
        _id: '$countryCode',
        country: { $first: '$country' },
        countryCode: { $first: '$countryCode' },
        count: { $sum: 1 },
        lat: { $first: '$lat' },
        lon: { $first: '$lon' }
      }},
      { $sort: { count: -1 } },
      { $limit: 100 }
    ]);

    res.json({ countries: data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/popular?period=week|month|year
router.get('/popular', async (req, res) => {
  try {
    const since = getDateRange(req.query.period || 'week');

    const pages = await PageView.aggregate([
      { $match: { type: 'view', createdAt: { $gte: since } } },
      { $group: {
        _id: '$path',
        resourceType: { $first: '$resourceType' },
        resourceId: { $first: '$resourceId' },
        resourceName: { $first: '$resourceName' },
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    const populated = await Promise.all(pages.map(async (p) => {
      if (p.resourceId && p.resourceType === 'biblioteca') {
        const lib = await Library.findById(p.resourceId).select('name').lean();
        return { ...p, resourceName: lib?.name || p.resourceName };
      }
      if (p.resourceId && p.resourceType === 'noticia') {
        const news = await News.findById(p.resourceId).select('title').lean();
        return { ...p, resourceName: news?.title || p.resourceName };
      }
      return p;
    }));

    res.json({ pages: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/interactions?period=week|month|year
router.get('/interactions', async (req, res) => {
  try {
    const since = getDateRange(req.query.period || 'week');

    const shares = await PageView.aggregate([
      { $match: { type: 'share', createdAt: { $gte: since } } },
      { $group: {
        _id: '$path',
        resourceId: { $first: '$resourceId' },
        resourceType: { $first: '$resourceType' },
        resourceName: { $first: '$resourceName' },
        shares: { $sum: 1 }
      }},
      { $sort: { shares: -1 } },
      { $limit: 15 }
    ]);

    const [libraries, news] = await Promise.all([
      Library.find({ isActive: true }).select('name likes comments').sort({ likes: -1 }).limit(10).lean(),
      News.find({ isPublished: true }).select('title likes comments').sort({ likes: -1 }).limit(10).lean()
    ]);

    const contentData = [
      ...libraries.map(lib => {
        let commentLikes = 0, commentDislikes = 0;
        (lib.comments || []).forEach(c => {
          commentLikes += c.likes?.length || 0;
          commentDislikes += c.dislikes?.length || 0;
          (c.replies || []).forEach(r => {
            commentLikes += r.likes?.length || 0;
            commentDislikes += r.dislikes?.length || 0;
          });
        });
        return { _id: lib._id, name: lib.name, type: 'biblioteca', likes: lib.likes || 0, commentLikes, commentDislikes };
      }),
      ...news.map(n => {
        let commentLikes = 0, commentDislikes = 0;
        (n.comments || []).forEach(c => {
          commentLikes += c.likes?.length || 0;
          commentDislikes += c.dislikes?.length || 0;
        });
        return { _id: n._id, name: n.title, type: 'noticia', likes: n.likes || 0, commentLikes, commentDislikes };
      })
    ].sort((a, b) => (b.likes + b.commentLikes) - (a.likes + a.commentLikes)).slice(0, 15);

    res.json({ content: contentData, shares });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/export?format=xlsx|docx|txt&period=week|month|year
router.get('/export', async (req, res) => {
  try {
    const { format = 'xlsx', period = 'week' } = req.query;
    const since = getDateRange(period);
    const periodLabel = { year: 'Último año', month: 'Último mes', week: 'Última semana' }[period] || 'Última semana';

    const [totalViews, uniqueIps, geoData, popularPages, totalShares] = await Promise.all([
      PageView.countDocuments({ type: 'view', createdAt: { $gte: since } }),
      PageView.distinct('ip', { type: 'view', createdAt: { $gte: since }, ip: { $ne: null } }),
      PageView.aggregate([
        { $match: { type: 'view', createdAt: { $gte: since }, countryCode: { $ne: null } } },
        { $group: { _id: '$countryCode', country: { $first: '$country' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      PageView.aggregate([
        { $match: { type: 'view', createdAt: { $gte: since } } },
        { $group: { _id: '$path', count: { $sum: 1 }, resourceType: { $first: '$resourceType' } } },
        { $sort: { count: -1 } },
        { $limit: 30 }
      ]),
      PageView.countDocuments({ type: 'share', createdAt: { $gte: since } })
    ]);

    if (format === 'txt') {
      const sep = '─'.repeat(44);
      const lines = [
        '╔════════════════════════════════════════════╗',
        '║  ANALÍTICAS — BIBLIOTECAS DE SAN JUAN      ║',
        '╚════════════════════════════════════════════╝',
        '',
        `  Período:             ${periodLabel}`,
        `  Generado:            ${new Date().toLocaleString('es-AR')}`,
        '',
        sep,
        '  RESUMEN GENERAL',
        sep,
        `  Total visitas:       ${totalViews}`,
        `  Visitantes únicos:   ${uniqueIps.length}`,
        `  Países únicos:       ${geoData.length}`,
        `  Total compartidos:   ${totalShares}`,
        '',
        sep,
        '  VISITAS POR PAÍS',
        sep,
        ...geoData.map((g, i) => `  ${String(i + 1).padStart(3, ' ')}. ${(g.country || g._id).padEnd(32)}${g.count} visitas`),
        '',
        sep,
        '  PÁGINAS MÁS VISITADAS',
        sep,
        ...popularPages.map((p, i) => `  ${String(i + 1).padStart(3, ' ')}. ${p._id.padEnd(42)}${p.count} visitas`)
      ];
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="analiticas-${period}.txt"`);
      return res.send(lines.join('\n'));
    }

    if (format === 'xlsx') {
      const wb = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['ANALÍTICAS — BIBLIOTECAS POPULARES DE SAN JUAN'],
        [],
        ['Período', periodLabel],
        ['Generado', new Date().toLocaleString('es-AR')],
        [],
        ['Total visitas', totalViews],
        ['Visitantes únicos', uniqueIps.length],
        ['Países únicos', geoData.length],
        ['Total compartidos', totalShares]
      ]), 'Resumen');

      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['País', 'Código', 'Visitas'],
        ...geoData.map(g => [g.country || g._id, g._id, g.count])
      ]), 'Por País');

      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Página / Ruta', 'Tipo', 'Visitas'],
        ...popularPages.map(p => [p._id, p.resourceType, p.count])
      ]), 'Páginas Populares');

      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="analiticas-${period}.xlsx"`);
      return res.send(buffer);
    }

    if (format === 'docx') {
      const tc = (text, bold = false) => new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: String(text ?? ''), bold, size: 20 })] })],
        margins: { top: 80, bottom: 80, left: 120, right: 120 }
      });

      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({ text: 'Analíticas — Bibliotecas Populares de San Juan', heading: HeadingLevel.HEADING_1 }),
            new Paragraph({ text: `Período: ${periodLabel}  |  Generado: ${new Date().toLocaleString('es-AR')}` }),
            new Paragraph({ text: '' }),
            new Paragraph({ text: 'Resumen General', heading: HeadingLevel.HEADING_2 }),
            new Table({
              width: { size: 60, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({ children: [tc('Total visitas', true), tc(totalViews)] }),
                new TableRow({ children: [tc('Visitantes únicos', true), tc(uniqueIps.length)] }),
                new TableRow({ children: [tc('Países únicos', true), tc(geoData.length)] }),
                new TableRow({ children: [tc('Total compartidos', true), tc(totalShares)] }),
              ]
            }),
            new Paragraph({ text: '' }),
            new Paragraph({ text: 'Visitas por País', heading: HeadingLevel.HEADING_2 }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({ children: [tc('País', true), tc('Código', true), tc('Visitas', true)] }),
                ...geoData.slice(0, 50).map(g =>
                  new TableRow({ children: [tc(g.country || g._id), tc(g._id), tc(g.count)] })
                )
              ]
            }),
            new Paragraph({ text: '' }),
            new Paragraph({ text: 'Páginas Más Visitadas', heading: HeadingLevel.HEADING_2 }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({ children: [tc('Ruta', true), tc('Tipo', true), tc('Visitas', true)] }),
                ...popularPages.map(p =>
                  new TableRow({ children: [tc(p._id), tc(p.resourceType), tc(p.count)] })
                )
              ]
            })
          ]
        }]
      });

      const buffer = await Packer.toBuffer(doc);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="analiticas-${period}.docx"`);
      return res.send(buffer);
    }

    res.status(400).json({ message: 'Formato inválido. Usa: xlsx, docx o txt' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
