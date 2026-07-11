/**
 * Genera Documentacion_BPSanJuan.docx en la raíz del proyecto.
 * Ejecutar: node server/scripts/generateDocs.js
 */
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, BorderStyle, ShadingType,
  PageBreak, UnderlineType, TabStopPosition
} = require('docx');
const fs = require('fs');
const path = require('path');

// ─── COLORES ──────────────────────────────────────────────
const C = {
  primary:  'FA7506',
  dark:     '1A1A2E',
  admin:    '1e3a8a',
  super_:   '065f46',
  biblio:   '7c3aed',
  public_:  '0369a1',
  dev:      '831843',
  gray:     '6B7280',
  lightGray:'F3F4F6',
  white:    'FFFFFF',
  black:    '111827',
  warning:  'B45309',
  success:  '166534',
  danger:   'B91C1C',
  info:     '1d4ed8',
};

// ─── HELPERS ──────────────────────────────────────────────
const sp = () => new Paragraph({ text: '' });

const h1 = (text, color = C.dark) => new Paragraph({
  pageBreakBefore: true,
  spacing: { before: 400, after: 200 },
  children: [new TextRun({ text, bold: true, size: 48, color, font: 'Calibri' })]
});

const h2 = (text, color = C.dark) => new Paragraph({
  spacing: { before: 360, after: 160 },
  children: [new TextRun({ text, bold: true, size: 36, color, font: 'Calibri' })]
});

const h3 = (text, color = C.gray) => new Paragraph({
  spacing: { before: 280, after: 120 },
  children: [new TextRun({ text, bold: true, size: 28, color, font: 'Calibri' })]
});

const h4 = (text) => new Paragraph({
  spacing: { before: 200, after: 80 },
  children: [new TextRun({ text, bold: true, size: 24, italics: true, color: C.dark, font: 'Calibri' })]
});

const p = (text, opts = {}) => new Paragraph({
  spacing: { after: 120 },
  children: [new TextRun({ text, size: 22, font: 'Calibri', color: C.black, ...opts })]
});

const pItalic = (text) => p(text, { italics: true, color: C.gray });

const bullet = (text, level = 0) => new Paragraph({
  spacing: { after: 80 },
  indent: { left: 400 + level * 360, hanging: 360 },
  children: [
    new TextRun({ text: (level === 0 ? '• ' : '◦ ') + text, size: 22, font: 'Calibri', color: C.black })
  ]
});

const bulletB = (label, desc) => new Paragraph({
  spacing: { after: 80 },
  indent: { left: 400, hanging: 360 },
  children: [
    new TextRun({ text: '• ', size: 22, font: 'Calibri' }),
    new TextRun({ text: label + ': ', size: 22, font: 'Calibri', bold: true, color: C.dark }),
    new TextRun({ text: desc, size: 22, font: 'Calibri', color: C.black })
  ]
});

const code = (text) => new Paragraph({
  spacing: { before: 80, after: 80 },
  indent: { left: 400 },
  shading: { type: ShadingType.CLEAR, color: 'auto', fill: C.lightGray },
  children: [new TextRun({ text, font: 'Courier New', size: 18, color: '374151' })]
});

const note = (text, fill = 'FFF3CD', color = C.warning) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  margins: { top: 80, bottom: 80 },
  rows: [new TableRow({ children: [new TableCell({
    shading: { type: ShadingType.CLEAR, fill },
    borders: { left: { style: BorderStyle.THICK, size: 8, color } },
    margins: { left: 200, right: 200, top: 120, bottom: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, size: 20, font: 'Calibri', color: C.black })] })]
  })]})],
});

const noteInfo  = (t) => note(t, 'DBEAFE', C.info);
const noteWarn  = (t) => note(t, 'FEF9C3', C.warning);
const noteOk    = (t) => note(t, 'DCFCE7', C.success);
const noteDanger= (t) => note(t, 'FEE2E2', C.danger);

const divider = () => new Paragraph({
  spacing: { before: 200, after: 200 },
  children: [new TextRun({ text: '─'.repeat(80), size: 16, color: 'D1D5DB' })]
});

// Banner de sección de rol
const roleBanner = (title, subtitle, fill, textColor = C.white) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  margins: { top: 200, bottom: 200 },
  rows: [new TableRow({ children: [new TableCell({
    shading: { type: ShadingType.CLEAR, fill },
    margins: { left: 400, right: 400, top: 240, bottom: 240 },
    children: [
      new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 40, color: textColor, font: 'Calibri' })] }),
      new Paragraph({ children: [new TextRun({ text: subtitle, size: 22, color: textColor, font: 'Calibri' })] })
    ]
  })]})],
});

// Tabla genérica con cabecera
const tbl = (headers, rows, fillHeader = C.dark) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  margins: { top: 80, bottom: 80 },
  rows: [
    new TableRow({
      tableHeader: true,
      children: headers.map(h => new TableCell({
        shading: { type: ShadingType.CLEAR, fill: fillHeader },
        margins: { left: 150, right: 150, top: 100, bottom: 100 },
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: C.white, font: 'Calibri' })] })]
      }))
    }),
    ...rows.map((row, i) => new TableRow({
      children: row.map(cell => new TableCell({
        shading: { type: ShadingType.CLEAR, fill: i % 2 === 0 ? C.white : 'F9FAFB' },
        margins: { left: 150, right: 150, top: 80, bottom: 80 },
        children: [new Paragraph({ children: [new TextRun({ text: String(cell ?? ''), size: 20, font: 'Calibri', color: C.black })] })]
      }))
    }))
  ],
});

// Pantalla simulada (descripción de UI)
const uiScreen = (title, items) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  margins: { top: 160, bottom: 160 },
  rows: [
    new TableRow({ children: [new TableCell({
      shading: { type: ShadingType.CLEAR, fill: '374151' },
      margins: { left: 200, right: 200, top: 100, bottom: 100 },
      children: [new Paragraph({ children: [new TextRun({ text: '🖥  PANTALLA: ' + title, bold: true, size: 20, color: C.white, font: 'Calibri' })] })]
    })]}) ,
    new TableRow({ children: [new TableCell({
      shading: { type: ShadingType.CLEAR, fill: 'F8FAFC' },
      margins: { left: 300, right: 300, top: 160, bottom: 160 },
      children: items.map(it => new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: '  ' + it, size: 20, font: 'Calibri', color: C.black })]
      }))
    })]})
  ],
});

// ─── CONTENIDO ────────────────────────────────────────────

const TOC_ITEMS = [
  ['1', 'Introducción al Sistema', '3'],
  ['2', 'Arquitectura y Tecnologías', '5'],
  ['3', 'Manual del Administrador', '8'],
  ['3.1', 'Gestión de Usuarios Staff', '9'],
  ['3.2', 'Gestión de Bibliotecas', '11'],
  ['3.3', 'Gestión de Noticias', '13'],
  ['3.4', 'Gestión de Departamentos', '14'],
  ['3.5', 'Aprobación de Ediciones', '15'],
  ['3.6', 'Comunidad — Usuarios Google', '16'],
  ['3.7', 'Historial de Actividad', '17'],
  ['3.8', 'Analíticas del Sitio', '18'],
  ['4', 'Manual del Supervisor', '20'],
  ['5', 'Manual del Bibliotecario', '23'],
  ['6', 'Usuarios Públicos (Google)', '27'],
  ['7', 'Guía para Desarrolladores', '29'],
  ['7.1', 'Instalación y Configuración', '29'],
  ['7.2', 'Variables de Entorno', '31'],
  ['7.3', 'Modelos de Base de Datos', '32'],
  ['7.4', 'API — Referencia de Endpoints', '36'],
  ['7.5', 'Seguridad implementada', '40'],
  ['8', 'Despliegue en Producción', '42'],
  ['9', 'Problemas Conocidos y Soluciones', '44'],
  ['10', 'Glosario', '46'],
];

const tocRows = TOC_ITEMS.map(([num, title, page]) => [
  num, title, page
]);

// ══════════════════════════════════════════════════════════
//  BUILD DOCUMENT
// ══════════════════════════════════════════════════════════

const children = [

  // ─── PORTADA ─────────────────────────────────────────
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: [new TableCell({
      shading: { type: ShadingType.CLEAR, fill: C.primary },
      margins: { left: 600, right: 600, top: 800, bottom: 800 },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '📚', size: 120 })] }),
        sp(),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'BIBLIOTECAS POPULARES', bold: true, size: 60, color: C.white, font: 'Calibri' })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'DE SAN JUAN', bold: true, size: 60, color: C.white, font: 'Calibri' })] }),
        sp(),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Documentación Completa del Sistema Web', size: 28, color: 'FFE4CC', font: 'Calibri' })] }),
        sp(),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Versión 1.0  ·  Julio 2026', size: 22, color: 'FFD5B0', font: 'Calibri' })] }),
      ]
    })]})],
  }),
  sp(), sp(),
  p('Este documento cubre la operación y el desarrollo del sistema web de Bibliotecas Populares de San Juan. Está organizado en secciones independientes para cada perfil de usuario.', { size: 22 }),
  sp(),
  noteDanger('⚠  CONFIDENCIAL — Contiene información técnica y de seguridad. No distribuir externamente sin autorización del administrador del sistema.'),
  sp(),

  // ─── ÍNDICE ───────────────────────────────────────────
  new Paragraph({
    pageBreakBefore: true,
    spacing: { after: 300 },
    children: [new TextRun({ text: 'ÍNDICE DE CONTENIDOS', bold: true, size: 40, color: C.dark, font: 'Calibri' })]
  }),
  tbl(['N°', 'Sección', 'Página'], tocRows, C.primary),
  sp(),

  // ─── SECCIÓN 1: INTRODUCCIÓN ──────────────────────────
  h1('1. Introducción al Sistema', C.primary),
  h2('1.1 ¿Qué es este sistema?'),
  p('El sitio web de Bibliotecas Populares de San Juan es una aplicación web full-stack desarrollada con la pila MERN (MongoDB, Express.js, React, Node.js). Su objetivo es centralizar y digitalizar la presencia de todas las bibliotecas populares de la provincia, permitiendo a ciudadanos encontrar información, y al personal interno gestionar contenido de manera colaborativa.'),
  sp(),

  h3('Características principales'),
  bullet('Directorio público de bibliotecas organizado por departamento'),
  bullet('Sistema de noticias con editor de texto enriquecido (TipTap)'),
  bullet('Ficha detallada de cada biblioteca: horarios, contacto, redes sociales, galería de fotos'),
  bullet('Sistema de comentarios y reacciones (me gusta / no me gusta) para usuarios Google'),
  bullet('Autenticación dual: staff por email/contraseña, público por Google OAuth 2.0'),
  bullet('Panel de administración multi-rol con flujo de aprobación de ediciones'),
  bullet('Presencia en tiempo real (indicador online/offline/reconectando)'),
  bullet('Registro de actividad con retención configurable de 30 días'),
  bullet('Analíticas de visitas con mapa geográfico mundial'),
  bullet('Exportación de datos en Excel (.xlsx), Word (.docx) y texto plano (.txt)'),
  bullet('Modo oscuro / claro con persistencia en el navegador'),
  bullet('Diseño responsive, adaptado a móvil y escritorio'),
  sp(),

  h3('Roles del sistema'),
  tbl(
    ['Rol', 'Descripción', 'Nivel de acceso'],
    [
      ['Administrador', 'Control total del sistema. Única cuenta creada inicialmente.', 'Máximo'],
      ['Supervisor', 'Gestiona bibliotecas, noticias o departamentos según permisos otorgados por el admin.', 'Medio-alto'],
      ['Bibliotecario', 'Edita la información de su biblioteca asignada. Sus cambios requieren aprobación.', 'Limitado'],
      ['Usuario Público', 'Visitante que inicia sesión con Google para interactuar (likes, comentarios, perfil).', 'Público'],
    ],
    C.admin
  ),
  sp(),

  h2('1.2 URL del Sistema'),
  tbl(['Entorno', 'Frontend (React)', 'Backend (API)', 'Base de Datos'],
    [
      ['Desarrollo local', 'http://localhost:5173', 'http://localhost:5000', 'MongoDB Atlas (cloud)'],
      ['Producción', 'https://<app>.vercel.app', 'https://<api>.onrender.com', 'MongoDB Atlas (cloud)'],
    ],
    C.dark
  ),
  sp(),
  noteInfo('💡 El frontend en desarrollo usa un proxy Vite: todas las peticiones a /api se redirigen automáticamente al backend en puerto 5000. No se necesita configurar CORS para desarrollo local.'),
  sp(),

  // ─── SECCIÓN 2: ARQUITECTURA ──────────────────────────
  h1('2. Arquitectura y Tecnologías', C.primary),

  h2('2.1 Stack tecnológico'),
  tbl(['Capa', 'Tecnología', 'Versión', 'Propósito'],
    [
      ['Base de datos', 'MongoDB Atlas', '7+', 'Almacenamiento de datos (cloud)'],
      ['Backend — servidor', 'Node.js', '20+', 'Motor de ejecución JavaScript'],
      ['Backend — framework', 'Express.js', '5.x', 'API REST'],
      ['Backend — ODM', 'Mongoose', '9.x', 'Modelos y queries a MongoDB'],
      ['Autenticación staff', 'jsonwebtoken (JWT)', '9.x', 'Tokens de sesión HTTP-only'],
      ['Autenticación pública', 'Passport.js + Google OAuth 2.0', '0.7', 'Login social con Google'],
      ['Hashing de passwords', 'bcryptjs', '3.x', 'Almacenamiento seguro de contraseñas'],
      ['Frontend — framework', 'React', '19.x', 'UI reactiva basada en componentes'],
      ['Frontend — bundler', 'Vite', '8.x', 'Build y dev server ultra-rápido'],
      ['Frontend — router', 'React Router DOM', '7.x', 'Navegación SPA'],
      ['Frontend — HTTP client', 'Axios', '1.x', 'Peticiones a la API'],
      ['Editor de texto enriquecido', 'TipTap', '3.x', 'Editor WYSIWYG en noticias'],
      ['Mapa geográfico', 'react-simple-maps', '3.x', 'Mapa mundial coroplético'],
      ['Excel export', 'xlsx (SheetJS)', '0.18', 'Generación de archivos .xlsx'],
      ['Word export', 'docx', '9.x', 'Generación de archivos .docx'],
      ['Geolocalización IP', 'geoip-lite', 'latest', 'Mapeo IP → país/ciudad (offline)'],
      ['Seguridad headers', 'helmet', '8.x', 'Headers HTTP de seguridad'],
      ['CORS', 'cors', '2.x', 'Control de origen cruzado'],
      ['Rate limiting', 'express-rate-limit', '8.x', 'Protección contra fuerza bruta'],
      ['Despliegue frontend', 'Vercel', '—', 'Hosting del build de React'],
      ['Despliegue backend', 'Render', '—', 'Hosting del servidor Node.js'],
    ],
    C.dark
  ),
  sp(),

  h2('2.2 Estructura de carpetas'),
  code('bpsanjuan-mern/'),
  code('├── server/                 ← Backend (Node.js + Express)'),
  code('│   ├── config/             ← Configuración Passport / Google OAuth'),
  code('│   │   └── passport.js'),
  code('│   ├── helpers/            ← Funciones auxiliares'),
  code('│   │   └── logActivity.js  ← Registro de actividad silencioso'),
  code('│   ├── middleware/         ← Middlewares globales y de ruta'),
  code('│   │   ├── authMiddleware.js  ← protect() + restrictTo()'),
  code('│   │   ├── rateLimiter.js    ← apiLimiter + loginLimiter'),
  code('│   │   └── sanitize.js       ← Anti-inyección NoSQL'),
  code('│   ├── models/             ← Schemas de Mongoose'),
  code('│   │   ├── User.js           ← Staff (admin/supervisor/bibliotecario)'),
  code('│   │   ├── PublicUser.js     ← Usuarios Google'),
  code('│   │   ├── Library.js        ← Biblioteca con comentarios embebidos'),
  code('│   │   ├── Department.js     ← Departamentos de San Juan'),
  code('│   │   ├── News.js           ← Noticias'),
  code('│   │   ├── LibrarySubmission.js ← Ediciones pendientes de aprobación'),
  code('│   │   ├── Message.js        ← Mensajería interna por biblioteca'),
  code('│   │   ├── ActivityLog.js    ← Historial de actividad (TTL 30 días)'),
  code('│   │   └── PageView.js       ← Analíticas de visitas'),
  code('│   ├── routes/             ← Endpoints de la API REST'),
  code('│   │   ├── auth.js           ← Login, logout, OAuth, perfil'),
  code('│   │   ├── users.js          ← CRUD de usuarios staff (admin)'),
  code('│   │   ├── libraries.js      ← CRUD de bibliotecas + comentarios'),
  code('│   │   ├── departments.js    ← CRUD de departamentos'),
  code('│   │   ├── news.js           ← CRUD de noticias'),
  code('│   │   ├── librarySubmissions.js ← Flujo de aprobación'),
  code('│   │   ├── messages.js       ← Mensajería interna'),
  code('│   │   ├── publicUsers.js    ← Admin CRUD de usuarios Google'),
  code('│   │   ├── presence.js       ← Heartbeat de presencia online'),
  code('│   │   ├── activityLogs.js   ← Historial de actividad + exportación'),
  code('│   │   └── analytics.js      ← Analíticas de visitas + mapa'),
  code('│   ├── scripts/'),
  code('│   │   ├── seed.js           ← Poblar la BD con datos iniciales'),
  code('│   │   └── generateDocs.js   ← Este script'),
  code('│   ├── .env                ← Variables de entorno (NO en git)'),
  code('│   └── index.js            ← Servidor Express principal'),
  code('└── client/                 ← Frontend (React + Vite)'),
  code('    └── src/'),
  code('        ├── api/            ← Funciones de llamadas a la API'),
  code('        ├── components/     ← Componentes reutilizables'),
  code('        ├── context/        ← AuthContext, ThemeContext'),
  code('        ├── hooks/          ← useHeartbeat, usePageView'),
  code('        ├── pages/'),
  code('        │   ├── admin/      ← Paneles de admin y supervisor'),
  code('        │   └── bibliotecario/ ← Panel del bibliotecario'),
  code('        └── utils/          ← timeAgo, etc.'),
  sp(),

  h2('2.3 Flujo de autenticación'),
  h3('Staff (admin / supervisor / bibliotecario)'),
  bullet('1. Usuario ingresa email y contraseña en /login'),
  bullet('2. Backend verifica credenciales y devuelve un JWT (cookie HttpOnly + localStorage)'),
  bullet('3. El interceptor de Axios adjunta el token en cada petición: Authorization: Bearer <token>'),
  bullet('4. El middleware protect() verifica el JWT y carga req.user con el documento del usuario'),
  bullet('5. restrictTo("admin") / restrictTo("bibliotecario") controla el acceso por rol'),
  sp(),
  h3('Usuarios Públicos (Google OAuth)'),
  bullet('1. Usuario hace clic en "Continuar con Google"'),
  bullet('2. Passport redirige a Google → usuario autoriza → Google redirige a /api/auth/google/callback'),
  bullet('3. Backend crea o actualiza el PublicUser y emite un JWT especial con type:"public"'),
  bullet('4. Frontend recibe el token por URL, lo guarda como publicToken y llama a /api/auth/me-public'),
  bullet('5. El interceptor adjunta publicToken como Bearer si no hay token de staff'),
  sp(),

  // ─── SECCIÓN 3: ADMINISTRADOR ─────────────────────────
  roleBanner('3. MANUAL DEL ADMINISTRADOR', 'Acceso total al sistema — cuenta: admin@bpsanjuan.ar', C.admin),
  sp(),
  p('El administrador tiene acceso completo a todos los módulos del sistema. Es el único que puede crear y eliminar cuentas de staff, cambiar contraseñas, y acceder a los reportes de analíticas y actividad.'),
  sp(),
  noteWarn('⚠  IMPORTANTE: Cambiar la contraseña inicial "CambiameEnseguida123!" inmediatamente después del primer acceso. Hacerlo desde Mi Perfil → Cambiar contraseña.'),
  sp(),

  uiScreen('Panel de Administración — Inicio', [
    '╔══════════════════════════════════════════════════════╗',
    '║  Panel de Administración  |  Hola, Administrador.   ║',
    '╠══════════════════════════════════════════════════════╣',
    '║  [Usuarios] [Bibliotecas] [Noticias] [Departamentos] ║',
    '║  [Aprobaciones] [Comunidad] [Actividad] [Analíticas] ║',
    '╚══════════════════════════════════════════════════════╝',
    '→ Navegar a cada sección haciendo clic en las pestañas',
  ]),
  sp(),

  h2('3.1 Gestión de Usuarios Staff'),
  p('Ubicación: Panel Admin → pestaña "Usuarios". Solo visible para el rol admin.'),
  sp(),

  uiScreen('Gestión de Usuarios — Vista de tabla', [
    '┌─────────────────────────────────────────────────────────┐',
    '│  Usuarios Staff          [+ Nuevo usuario]              │',
    '│  Total: N usuarios staff registrados                    │',
    '├──────┬──────────┬───────────────┬──────────┬───────────┤',
    '│  ●   │  Nombre  │  Email        │  Rol     │  Acciones │',
    '│ verde│  Juan    │  j@bps...     │  Admin   │ [✏][🗑]   │',
    '│ gris │  María   │  m@bps...     │  Superv. │ [✏][🗑]   │',
    '│negro │  Carlos  │  c@bps...     │  Biblio. │ [✏][🗑]   │',
    '└──────┴──────────┴───────────────┴──────────┴───────────┘',
    '→ El punto de color indica estado online (verde=activo, gris=reciente, negro=desconectado)',
  ]),
  sp(),

  h3('Crear un nuevo usuario staff'),
  bullet('1. Hacer clic en "+ Nuevo usuario"'),
  bullet('2. Completar el formulario: Nombre, Email, Contraseña temporal, Rol'),
  bullet('3. Si el rol es "Supervisor": marcar los permisos que tendrá:', 1),
  bullet('Gestionar bibliotecas — puede aprobar/rechazar ediciones y editar fichas', 2),
  bullet('Gestionar noticias — puede crear, editar y publicar noticias', 2),
  bullet('Editar departamentos — puede modificar la información de departamentos', 2),
  bullet('4. Si el rol es "Bibliotecario": seleccionar la biblioteca asignada'),
  bullet('5. Hacer clic en "Guardar"'),
  sp(),

  h3('Editar / Desactivar / Eliminar un usuario'),
  bullet('Editar (lápiz): abre el modal con los datos actuales para modificar'),
  bullet('Desactivar: el usuario no puede iniciar sesión pero sus datos se conservan'),
  bullet('Activar: reactiva una cuenta desactivada'),
  bullet('Eliminar (papelera): BORRA el usuario de la base de datos. Esta acción no se puede deshacer'),
  bullet('Nota: el administrador no puede eliminarse a sí mismo'),
  sp(),

  h3('Resetear contraseña'),
  bullet('En el modal de edición → sección "Cambiar contraseña"'),
  bullet('Ingresar la nueva contraseña temporal y confirmarla'),
  bullet('El usuario deberá cambiarla en su próximo acceso (recomendado)'),
  sp(),
  noteInfo('💡 Los supervisores hereda solo los permisos que el admin habilita. Un supervisor sin ningún permiso marcado no puede hacer nada más que ver el panel.'),
  sp(),

  h2('3.2 Gestión de Bibliotecas'),
  p('Ubicación: Panel Admin → pestaña "Bibliotecas". Accesible también para supervisores con permiso canManageLibraries.'),
  sp(),

  uiScreen('Gestión de Bibliotecas', [
    '┌────────────────────────────────────────────────────────────┐',
    '│  Gestión de Bibliotecas            [+ Nueva biblioteca]    │',
    '│  Buscador: [__________________] [Buscar] [Limpiar]         │',
    '├──────────┬─────────────┬────────────┬──────┬─────────────┤',
    '│  Nombre  │ Departamento│ Bibliotecario│Estado│  Acciones  │',
    '│  Améric. │  Capital    │  Juan López │ Activa│[✏][💬][✉][🗑]│',
    '│  Rivad.  │  Rawson     │  Sin asignar│ Activa│[✏][💬][✉][🗑]│',
    '└──────────┴─────────────┴────────────┴──────┴─────────────┘',
    '→ [💬] abre el panel de moderación de comentarios de esa biblioteca',
    '→ [✉] abre el hilo de mensajes con el bibliotecario',
  ]),
  sp(),

  h3('Crear / editar una biblioteca'),
  bullet('Hacer clic en "+ Nueva biblioteca" o en el lápiz de una existente'),
  bullet('El formulario incluye: Nombre, Departamento, Dirección, Link Google Maps'),
  bullet('Contacto: Teléfono, WhatsApp, Email, DigiBepe (formato http://XXXX.bepe.ar/), Sitio web'),
  bullet('Redes sociales: Facebook, Instagram, YouTube'),
  bullet('Imagen de portada (URL): se muestra como thumbnail en el listado público'),
  bullet('Galería adicional: una URL por línea'),
  bullet('Descripción, Servicios (uno por línea), Horarios (por día)'),
  bullet('Año de fundación, ¿Registrada en CONABIP?'),
  sp(),
  noteWarn('⚠  CONFUSIÓN DE LABELS INTENCIONAL: En la base de datos, el campo "contact.website" almacena el link de DigiBepe (http://XXXX.bepe.ar/) y el campo "digibepe" almacena el sitio web propio de la biblioteca. Esto es histórico — no migrar los campos para no perder datos ya cargados.'),
  sp(),

  h3('Activar / Desactivar una biblioteca'),
  bullet('Las bibliotecas desactivadas no aparecen en el sitio público'),
  bullet('Los datos se conservan intactos para poder reactivarlas'),
  sp(),

  h2('3.3 Gestión de Noticias'),
  p('Ubicación: Panel Admin → pestaña "Noticias". Accesible también para supervisores con canManageNews.'),
  sp(),

  uiScreen('Gestión de Noticias', [
    '┌────────────────────────────────────────────────────────────┐',
    '│  Gestión de Noticias               [+ Nueva noticia]      │',
    '├──────────────┬───────────┬────────────┬───────────────────┤',
    '│  Título      │  Autor    │  Publicada │  Acciones         │',
    '│  "Encuentro" │  Admin    │  ✅ Sí      │  [✏] [🗑] [Ver]  │',
    '│  "Borrador"  │  Superv.  │  ❌ No      │  [✏] [🗑] [Pub.] │',
    '└──────────────┴───────────┴────────────┴───────────────────┘',
  ]),
  sp(),

  h3('Crear / editar una noticia'),
  bullet('Título, Resumen (breve descripción para el listado), Imagen de portada (URL)'),
  bullet('Contenido: editor de texto enriquecido (TipTap) con barra de herramientas completa'),
  bullet('  Negrita, cursiva, subrayado, tachado', 1),
  bullet('  Títulos H1/H2/H3, listas, alineación, citas, código', 1),
  bullet('  Insertar enlace, insertar imagen por URL', 1),
  bullet('  Selector de fuente, tamaño, color de texto', 1),
  bullet('Etiquetas (tags): palabras clave para filtrar'),
  bullet('Departamento relacionado (opcional)'),
  bullet('Publicada: si está marcada, es visible en el sitio público'),
  sp(),
  noteInfo('💡 Solo las noticias con "Publicada = Sí" aparecen en el sitio público. Se puede crear en borrador y publicar después.'),
  sp(),

  h2('3.4 Gestión de Departamentos'),
  p('Ubicación: Panel Admin → pestaña "Departamentos". Accesible también para supervisores con canEditDepartments.'),
  p('Permite editar el nombre, descripción, slug (URL) e imagen de cada uno de los 19 departamentos de San Juan. Los departamentos son el nivel de agrupación principal de las bibliotecas en el sitio público.'),
  sp(),

  h2('3.5 Aprobación de Ediciones'),
  p('Ubicación: Panel Admin → pestaña "Aprobaciones". Accesible también para supervisores con canManageLibraries.'),
  sp(),

  uiScreen('Aprobaciones de Ediciones', [
    '┌────────────────────────────────────────────────────────────┐',
    '│  Ediciones Pendientes de Aprobación  │ Total pendientes: 3 │',
    '├──────────────┬──────────┬────────────┴────────────────────┤',
    '│  Biblioteca  │ Enviado  │  Acciones                        │',
    '│  Americas    │  10/07   │  [Ver diferencias] [✓] [✗]      │',
    '│  Rivadavia   │  09/07   │  [Ver diferencias] [✓] [✗]      │',
    '└──────────────┴──────────┴──────────────────────────────────┘',
    '→ "Ver diferencias" muestra tabla con valores actuales vs propuestos',
    '→ Los campos sin cambios no se muestran',
    '→ [✓] Aprobar publica los cambios inmediatamente',
    '→ [✗] Rechazar pide un motivo que se envía al bibliotecario como mensaje',
  ]),
  sp(),

  h3('Flujo de aprobación'),
  bullet('1. El bibliotecario envía una propuesta de cambios desde su panel'),
  bullet('2. Aparece en esta lista con estado "Pendiente"'),
  bullet('3. El admin/supervisor abre el detalle: ve tabla con campo, valor actual y valor propuesto'),
  bullet('4. Si aprueba: los cambios se publican en la ficha pública de la biblioteca'),
  bullet('5. Si rechaza: ingresa el motivo. El bibliotecario recibe un mensaje automático con el motivo'),
  bullet('6. El bibliotecario puede ver el rechazo en su panel, corregir y reenviar'),
  sp(),
  noteInfo('💡 Admin y supervisores con el permiso correspondiente editan las bibliotecas directamente sin flujo de aprobación. Solo los bibliotecarios pasan por este proceso.'),
  sp(),

  h2('3.6 Comunidad — Usuarios de Google'),
  p('Ubicación: Panel Admin → pestaña "Comunidad". Solo para administradores.'),
  sp(),

  uiScreen('Gestión de Usuarios Públicos (Google)', [
    '┌──────────────────────────────────────────────────────────────┐',
    '│  Usuarios de la Comunidad     │ 247 usuarios registrados vía Google │',
    '│  [Buscar por nombre o email...]  [Buscar] [Limpiar]          │',
    '├─────────┬──────────┬──────────┬──────┬────────┬────────────┤',
    '│  Avatar │  Nombre  │  Email   │ ❤ s  │ Estado │  Acciones  │',
    '│ ● foto  │  Ana G.  │ ana@g..  │  5   │ Activo │[Bloquear][🗑]│',
    '│ ● inicia│  Luis M. │ luis@g.. │  2   │ Bloqueado│[Activar][🗑]│',
    '└─────────┴──────────┴──────────┴──────┴────────┴────────────┘',
    '→ El punto de color sobre el avatar indica presencia online en tiempo real',
    '→ "❤ s" = cantidad de bibliotecas con me gusta de ese usuario',
  ]),
  sp(),

  h3('Bloquear un usuario público'),
  bullet('Un usuario bloqueado no puede dejar comentarios ni likes'),
  bullet('Su cuenta sigue existiendo pero queda inactiva'),
  bullet('Se puede reactivar en cualquier momento con "Activar"'),
  sp(),

  h3('Eliminar un usuario público'),
  bullet('ACCIÓN IRREVERSIBLE. Borra la cuenta y limpia sus reacciones en comentarios'),
  bullet('Usar solo si el usuario violó los términos del servicio'),
  sp(),

  h2('3.7 Historial de Actividad'),
  p('Ubicación: Panel Admin → pestaña "Actividad". Solo para administradores.'),
  sp(),

  uiScreen('Historial de Actividad', [
    '┌──────────────────────────────────────────────────────────────────┐',
    '│  ⚠ 12 registros vencen en los próximos 7 días [Extender 30 días]│',
    '│  [Buscar...] [Buscar]           [↓ XLSX] [↓ DOCX] [↓ TXT]      │',
    '│  [Eliminar todos]                                                │',
    '├────────┬──────────┬──────┬──────────────┬─────┬────────────────┤',
    '│ Fecha  │ Usuario  │ Rol  │ Acción        │ Vence│ Acciones     │',
    '│ 10 Jul │ Admin    │admin │ Inició sesión │ 8d   │ [🗑]         │',
    '│ 10 Jul │ Superv.  │super │ Creó noticia  │ 8d   │ [🗑]         │',
    '└────────┴──────────┴──────┴──────────────┴──────┴──────────────┘',
  ]),
  sp(),

  h3('Retención de logs'),
  bullet('Los registros se eliminan automáticamente después de 30 días (MongoDB TTL)'),
  bullet('Si quedan registros que vencen en ≤7 días, aparece un aviso en amarillo'),
  bullet('"Extender 30 días" añade 30 días a todos los registros que vencerían pronto'),
  bullet('Se pueden eliminar registros individuales o todos de una vez'),
  sp(),

  h3('Exportación del historial'),
  bullet('XLSX (Excel): 3 hojas — Resumen, Registros completos, Por usuario'),
  bullet('DOCX (Word): documento con tablas formateadas'),
  bullet('TXT: texto plano con formato legible'),
  sp(),

  h2('3.8 Analíticas del Sitio'),
  p('Ubicación: Panel Admin → pestaña "Analíticas". Solo para administradores.'),
  sp(),

  uiScreen('Analíticas del Sitio', [
    '┌────────────────────────────────────────────────────────────────┐',
    '│  Analíticas del Sitio        [↓ XLSX] [↓ DOCX] [↓ TXT]       │',
    '│  [Última semana]  [Último mes]  [Último año]                   │',
    '├──────────┬────────────┬─────────┬───────────────────────────┤',
    '│ 1,234    │    567     │   42    │           89               │',
    '│ Visitas  │  Únicos    │ Países  │       Compartidos          │',
    '├──────────┴────────────┴─────────┴───────────────────────────┤',
    '│  MAPA MUNDIAL: países coloreados según intensidad de visitas  │',
    '│  (más naranja = más visitas)                                  │',
    '│  Lista de países con banderas y barras de progreso            │',
    '├──────────────────────────────────────────────────────────────┤',
    '│  PÁGINAS MÁS VISITADAS: tabla con nombre real y tipo         │',
    '│  REACCIONES: me gusta, dislikes y compartidos por contenido  │',
    '└──────────────────────────────────────────────────────────────┘',
  ]),
  sp(),

  h3('Períodos disponibles'),
  bullet('Última semana: últimos 7 días'),
  bullet('Último mes: últimos 30 días'),
  bullet('Último año: últimos 365 días'),
  sp(),
  noteInfo('💡 Las visitas desde localhost (desarrollo) no se geolocalzan. El mapa solo muestra datos en producción donde los visitantes tienen IPs reales.'),
  sp(),

  h3('Qué se rastrea'),
  tbl(['Dato', 'Detalle'],
    [
      ['Visitas de página', 'Cada cambio de ruta registra una visita con IP, país, ciudad, lat/lon'],
      ['Compartidos', 'Cada clic en un botón de compartir (WhatsApp, Telegram, Facebook, X, Copiar)'],
      ['País / Ciudad', 'Geolocalización offline con geoip-lite (base de datos MaxMind incluida)'],
      ['Tipo de visitante', 'Anónimo / Usuario Google / Staff'],
      ['Tipo de contenido', 'home, nosotros, noticias, biblioteca, noticia, departamento, otro'],
    ],
    C.primary
  ),
  sp(),

  // ─── SECCIÓN 4: SUPERVISOR ────────────────────────────
  roleBanner('4. MANUAL DEL SUPERVISOR', 'Acceso según permisos otorgados por el Administrador', C.super_),
  sp(),
  p('El supervisor es un usuario staff con acceso parcial al sistema. El administrador define exactamente qué puede hacer cada supervisor habilitando uno o más de los tres permisos disponibles.'),
  sp(),

  h2('4.1 Permisos disponibles'),
  tbl(['Permiso', 'Qué habilita', 'Secciones visibles'],
    [
      ['canManageLibraries', 'Crear/editar bibliotecas, aprobar/rechazar ediciones, moderar comentarios, leer mensajes', '"Bibliotecas" + "Aprobaciones"'],
      ['canManageNews', 'Crear, editar, publicar y eliminar noticias', '"Noticias"'],
      ['canEditDepartments', 'Editar información de los 19 departamentos', '"Departamentos"'],
    ],
    C.super_
  ),
  sp(),
  noteWarn('⚠  Un supervisor sin ningún permiso habilitado puede iniciar sesión pero su panel estará vacío. Verificar los permisos al crear la cuenta.'),
  sp(),

  h2('4.2 Lo que el supervisor NO puede hacer'),
  bullet('Crear, editar o eliminar cuentas de staff'),
  bullet('Ver la sección "Usuarios" (solo admin)'),
  bullet('Ver la sección "Comunidad" (usuarios Google — solo admin)'),
  bullet('Ver el "Historial de Actividad" (solo admin)'),
  bullet('Ver las "Analíticas del Sitio" (solo admin)'),
  bullet('Cambiar contraseñas de otros usuarios'),
  bullet('Modificar las secciones para las que NO tiene permiso'),
  sp(),

  h2('4.3 Gestión de Bibliotecas (con permiso canManageLibraries)'),
  p('El supervisor con este permiso tiene acceso a las mismas funciones de gestión de bibliotecas que el administrador, con una diferencia: solo puede actuar sobre bibliotecas, no sobre usuarios o la configuración global del sistema.'),
  sp(),

  h3('Aprobación de ediciones'),
  p('El flujo es idéntico al descrito en la sección 3.5. El supervisor recibe en la pestaña "Aprobaciones" todas las ediciones pendientes de bibliotecas y puede aprobarlas o rechazarlas.'),
  sp(),

  h3('Moderación de comentarios'),
  p('Desde la pestaña "Bibliotecas" → ícono 💬 de cualquier biblioteca, el supervisor puede:'),
  bullet('Ver todos los comentarios (incluidos los ocultos)'),
  bullet('Ocultar un comentario inapropiado (debe ingresar el motivo)'),
  bullet('Restaurar un comentario que fue ocultado por el bibliotecario'),
  bullet('Eliminar definitivamente un comentario (acción irreversible)'),
  sp(),

  h3('Mensajería interna'),
  p('Desde la pestaña "Bibliotecas" → ícono ✉ de cualquier biblioteca, el supervisor puede leer y enviar mensajes al bibliotecario asignado a esa biblioteca.'),
  sp(),

  h2('4.4 Mi Perfil (supervisor)'),
  p('Todo el personal staff accede a su perfil en /perfil o desde el link "Mi Perfil" en la barra de navegación.'),
  sp(),

  uiScreen('Mi Perfil — Staff', [
    '┌──────────────────────────────────────────────────────┐',
    '│  👤  NOMBRE DEL SUPERVISOR                          │',
    '│  Rol: Supervisor  |  [Permisos habilitados]         │',
    '│  Biblioteca asignada: —                             │',
    '│  Último acceso: hace 2 horas                        │',
    '├──────────────────────────────────────────────────────┤',
    '│  CAMBIAR CONTRASEÑA                                  │',
    '│  Contraseña actual: [__________] 👁                 │',
    '│  Nueva contraseña:  [__________] 👁                 │',
    '│  Confirmar:         [__________] 👁                 │',
    '│  [Guardar contraseña]                                │',
    '└──────────────────────────────────────────────────────┘',
  ]),
  sp(),

  // ─── SECCIÓN 5: BIBLIOTECARIO ─────────────────────────
  roleBanner('5. MANUAL DEL BIBLIOTECARIO', 'Panel /panel — Edición de ficha, mensajes y moderación', C.biblio),
  sp(),
  p('El bibliotecario tiene acceso a un panel propio en /panel (no en /admin). Puede editar la información completa de su biblioteca asignada, moderar los comentarios de visitantes, y comunicarse con supervisores y administradores mediante el sistema de mensajería interna.'),
  sp(),
  noteInfo('💡 El bibliotecario se autentica SIEMPRE con email y contraseña, nunca con Google. Google es solo para el público general.'),
  sp(),

  h2('5.1 Panel del Bibliotecario — Navegación'),
  uiScreen('Panel del Bibliotecario — Pestañas', [
    '┌──────────────────────────────────────────────────────┐',
    '│  Panel del Bibliotecario  |  Hola, Carlos López.    │',
    '│  Biblioteca asignada: Biblioteca Amérika            │',
    '├──────────────┬─────────────────┬────────────────────┤',
    '│  Mi Biblioteca│  Comentarios   │  Mensajes          │',
    '└──────────────┴─────────────────┴────────────────────┘',
  ]),
  sp(),

  h2('5.2 Editar Mi Biblioteca'),
  p('El formulario de edición incluye todos los campos públicos de la biblioteca. Al guardar los cambios, se crea una propuesta que debe ser aprobada por un supervisor o administrador antes de publicarse.'),
  sp(),

  h3('Campos editables'),
  tbl(['Campo', 'Descripción', 'Visible para el público'],
    [
      ['Nombre', 'Nombre oficial de la biblioteca', 'Sí'],
      ['Dirección', 'Calle y número', 'Sí'],
      ['Link Google Maps', 'URL de Maps (se pega la URL larga)', 'Solo como enlace "Ver en Maps"'],
      ['Teléfono', 'Número de teléfono fijo', 'Sí'],
      ['WhatsApp', 'Número de WhatsApp', 'Sí (botón de WhatsApp)'],
      ['Email', 'Dirección de email de la biblioteca', 'Sí'],
      ['DigiBepe', 'URL del catálogo en bepe.ar (http://XXXX.bepe.ar/)', 'Sí'],
      ['Sitio web', 'URL del sitio propio de la biblioteca', 'Sí'],
      ['Facebook / Instagram / YouTube', 'URLs de redes sociales', 'Sí'],
      ['Año de fundación', 'Año en que se fundó', 'Sí'],
      ['Descripción', 'Texto descriptivo de la biblioteca', 'Sí'],
      ['Servicios', 'Lista de servicios ofrecidos', 'Sí (como etiquetas)'],
      ['Horarios', 'Días y horarios de atención', 'Sí'],
      ['Imagen de portada', 'URL de la imagen principal', 'Sí'],
      ['Galería adicional', 'URLs de imágenes adicionales (una por línea)', 'Sí'],
    ],
    C.biblio
  ),
  sp(),

  h3('Estado de una propuesta'),
  tbl(['Estado', 'Significado', 'Acción disponible'],
    [
      ['Sin propuesta', 'No hay cambios pendientes. El form muestra datos publicados', 'Enviar nueva propuesta'],
      ['Pendiente', 'Cambios enviados, esperando revisión. Form muestra el borrador', 'Actualizar el borrador'],
      ['Rechazada', 'El revisor rechazó los cambios con un motivo', 'Corregir y reenviar'],
      ['Aprobada', 'Los cambios ya están publicados', 'Enviar nueva propuesta si se desea'],
    ],
    C.biblio
  ),
  sp(),

  uiScreen('Mi Biblioteca — Banner de estado', [
    '┌──────────────────────────────────────────────────────────────┐',
    '│  ⏳  Tienes una propuesta PENDIENTE de revisión              │',
    '│  Enviada el 10 de julio de 2026. Puedes seguir editando.    │',
    '└──────────────────────────────────────────────────────────────┘',
    '─ o ─',
    '┌──────────────────────────────────────────────────────────────┐',
    '│  ❌  Tu propuesta fue RECHAZADA                              │',
    '│  Motivo: "El número de teléfono tiene formato incorrecto"   │',
    '│  Corrige los datos y vuelve a enviar.                        │',
    '└──────────────────────────────────────────────────────────────┘',
  ]),
  sp(),

  h2('5.3 Moderación de Comentarios'),
  p('Desde la pestaña "Comentarios", el bibliotecario puede ver y ocultar comentarios inapropiados de visitantes en su biblioteca.'),
  sp(),

  h3('Ocultar un comentario'),
  bullet('1. Localizar el comentario en la lista'),
  bullet('2. Hacer clic en "Ocultar"'),
  bullet('3. Ingresar el motivo de ocultación (obligatorio)'),
  bullet('4. El comentario desaparece del sitio público pero queda registrado con el motivo'),
  sp(),

  noteWarn('⚠  El bibliotecario puede ocultar comentarios pero NO puede:'),
  bullet('Restaurar un comentario que ocultó (solo puede hacerlo admin/supervisor)'),
  bullet('Eliminar comentarios definitivamente'),
  bullet('Ocultar sin ingresar un motivo'),
  sp(),

  h2('5.4 Mensajería Interna'),
  p('Desde la pestaña "Mensajes", el bibliotecario puede comunicarse con supervisores y administradores sobre su biblioteca.'),
  sp(),

  uiScreen('Mensajería interna', [
    '┌──────────────────────────────────────────────────────────┐',
    '│  Mensajes — Biblioteca Amérika                           │',
    '│                                                          │',
    '│  [Admin]  10/07  "Cambios rechazados: El teléfono..."   │',
    '│  [Yo]     10/07  "Corregido, reenvié la propuesta"      │',
    '│  [Admin]  10/07  "Aprobado. Gracias."                   │',
    '│                                                          │',
    '│  [______________________________] [Enviar]              │',
    '└──────────────────────────────────────────────────────────┘',
  ]),
  sp(),
  noteInfo('💡 Cuando se rechaza una propuesta, el sistema envía automáticamente un mensaje con el motivo del rechazo. No es necesario que el revisor lo haga manualmente.'),
  sp(),

  // ─── SECCIÓN 6: USUARIOS PÚBLICOS ─────────────────────
  roleBanner('6. USUARIOS PÚBLICOS (Google)', 'Acceso vía Google OAuth — Likes, comentarios y perfil', C.public_),
  sp(),
  p('Los usuarios públicos son visitantes del sitio que inician sesión con su cuenta de Google para interactuar con el contenido. No tienen acceso a ningún panel de gestión.'),
  sp(),

  h2('6.1 Iniciar sesión con Google'),
  bullet('1. Hacer clic en "Continuar con Google" en la ficha de una biblioteca o noticia'),
  bullet('2. Seleccionar la cuenta de Google deseada'),
  bullet('3. Google redirige de vuelta al sitio con la sesión activa'),
  bullet('4. El nombre y foto del usuario aparecen en la barra de navegación'),
  sp(),

  h2('6.2 Funcionalidades disponibles'),
  tbl(['Funcionalidad', 'Dónde', 'Descripción'],
    [
      ['Me gusta en biblioteca', 'Ficha de biblioteca', 'Dar/quitar like. Se guarda en el perfil'],
      ['Me gusta en noticia', 'Detalle de noticia', 'Dar/quitar like. Se guarda en el perfil'],
      ['Comentarios en biblioteca', 'Ficha de biblioteca', 'Comentar y responder a otros comentarios'],
      ['Reacciones en comentarios', 'Ficha de biblioteca', 'Dar me gusta o no me gusta a comentarios'],
      ['Mi Perfil', '/perfil o link en navbar', 'Ver y editar bio, ver bibliotecas con like'],
      ['Compartir', 'Fichas y noticias', 'WhatsApp, Telegram, Facebook, X, copiar enlace'],
    ],
    C.public_
  ),
  sp(),

  h2('6.3 Mi Perfil (usuario público)'),
  uiScreen('Mi Perfil — Usuario Google', [
    '┌──────────────────────────────────────────────────────────┐',
    '│  📷 Foto de Google   NOMBRE DEL USUARIO GOOGLE          │',
    '│  usuario@gmail.com                                       │',
    '├──────────────────────────────────────────────────────────┤',
    '│  Sobre mí:                                               │',
    '│  [Escribe una breve descripción...] (máx 200 caracteres) │',
    '│  [Editar] → aparece formulario → [Guardar] [Cancelar]    │',
    '├──────────────────────────────────────────────────────────┤',
    '│  ESTADÍSTICAS                                            │',
    '│  Miembro desde: 10 jul 2026  |  Bibliotecas con 💙: 5   │',
    '├──────────────────────────────────────────────────────────┤',
    '│  BIBLIOTECAS QUE ME GUSTAN                               │',
    '│  [Imagen] [Imagen] [Imagen] [Imagen]  →  (grilla con    │',
    '│   thumbnail, nombre y link a la ficha de cada una)       │',
    '└──────────────────────────────────────────────────────────┘',
  ]),
  sp(),

  h2('6.4 Indicador de presencia online'),
  p('Tanto los usuarios públicos como el staff tienen un indicador de color en sus avatares y junto a sus nombres en los paneles de administración:'),
  tbl(['Color', 'Significado', 'Criterio técnico'],
    [
      ['🟢 Verde', 'Conectado y activo', 'Último heartbeat hace menos de 90 segundos'],
      ['⚫ Gris', 'Inactivo/alejado recientemente', 'Último heartbeat entre 90 segundos y 8 minutos'],
      ['⚫ Negro', 'Desconectado', 'Último heartbeat hace más de 8 minutos o sin datos'],
      ['🟡 Amarillo', 'Reconectando', 'El navegador detectó reconexión (estado transitorio)'],
    ],
    C.dark
  ),
  p('El heartbeat es un ping silencioso cada 45 segundos. Ocurre automáticamente mientras el usuario tiene el sitio abierto en el navegador.'),
  sp(),

  // ─── SECCIÓN 7: DESARROLLADORES ──────────────────────
  roleBanner('7. GUÍA PARA DESARROLLADORES', 'Setup, modelos, API, seguridad y convenciones', C.dev),
  sp(),

  h2('7.1 Instalación local (desde cero)'),
  h3('Requisitos previos'),
  bullet('Node.js 20 o superior (descargar de https://nodejs.org/)'),
  bullet('Cuenta en MongoDB Atlas con un cluster creado'),
  bullet('Cuenta de Google Cloud con un proyecto OAuth configurado'),
  bullet('Git (opcional, para clonar)'),
  sp(),

  h3('Paso 1 — Clonar el repositorio'),
  code('git clone <url-del-repositorio>'),
  code('cd bpsanjuan-mern'),
  sp(),

  h3('Paso 2 — Instalar dependencias del servidor'),
  code('cd server'),
  code('npm install'),
  sp(),

  h3('Paso 3 — Crear server/.env'),
  p('Crear el archivo server/.env con el siguiente contenido (reemplazar los valores reales):'),
  code('NODE_ENV=development'),
  code('PORT=5000'),
  code('MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority'),
  code('JWT_SECRET=<cadena-aleatoria-de-64-bytes-en-hex>'),
  code('JWT_EXPIRES_IN=7d'),
  code('JWT_COOKIE_EXPIRES_IN=7'),
  code('GOOGLE_CLIENT_ID=<id-de-google-cloud>'),
  code('GOOGLE_CLIENT_SECRET=<secreto-de-google-cloud>'),
  code('GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback'),
  code('CLIENT_URL=http://localhost:5173'),
  sp(),
  noteDanger('🔒 NUNCA commitear server/.env a git. El .gitignore ya lo excluye, verificar que siga siendo así.'),
  sp(),

  h3('Paso 4 — Poblar la base de datos (seed)'),
  code('cd server'),
  code('npm run seed'),
  p('Esto crea: 1 admin (admin@bpsanjuan.ar / CambiameEnseguida123!), 19 departamentos, 5 noticias de ejemplo, 4 bibliotecas de ejemplo.'),
  sp(),

  h3('Paso 5 — Instalar dependencias del cliente'),
  code('cd ../client'),
  code('npm install'),
  sp(),

  h3('Paso 6 — Levantar el proyecto'),
  p('En dos terminales separadas:'),
  code('# Terminal 1 — Backend'),
  code('cd server && npm run dev'),
  sp(),
  code('# Terminal 2 — Frontend'),
  code('cd client && npm run dev'),
  sp(),
  p('Acceder en el navegador: http://localhost:5173'),
  sp(),
  noteInfo('💡 El cliente Vite tiene un proxy configurado: todas las peticiones a /api se reenvían automáticamente a http://localhost:5000. No es necesario configurar CORS para desarrollo.'),
  sp(),

  h3('Gotcha: MongoDB SRV en esta máquina Windows'),
  p('Si la URI de MongoDB con formato mongodb+srv:// falla con "querySrv ECONNREFUSED", usar el formato de conexión directa con los 3 hosts del shard:'),
  code('MONGO_URI=mongodb://<user>:<pass>@host1:27017,host2:27017,host3:27017/<db>?ssl=true&replicaSet=<rs>&authSource=admin'),
  p('Los hostnames del shard se obtienen con: nslookup -type=SRV _mongodb._tcp.<cluster>.mongodb.net'),
  sp(),

  h2('7.2 Variables de Entorno — Referencia'),
  tbl(['Variable', 'Requerida', 'Descripción'],
    [
      ['NODE_ENV', 'Sí', '"development" o "production"'],
      ['PORT', 'No', 'Puerto del servidor (default: 5000)'],
      ['MONGO_URI', 'Sí', 'URI de conexión a MongoDB Atlas'],
      ['JWT_SECRET', 'Sí', 'Secreto para firmar tokens JWT (mínimo 32 chars aleatorios)'],
      ['JWT_EXPIRES_IN', 'No', 'Expiración del JWT (default: "7d")'],
      ['JWT_COOKIE_EXPIRES_IN', 'No', 'Días hasta que expire la cookie (default: 7)'],
      ['GOOGLE_CLIENT_ID', 'Sí (OAuth)', 'Client ID de Google Cloud Console'],
      ['GOOGLE_CLIENT_SECRET', 'Sí (OAuth)', 'Client Secret de Google Cloud Console'],
      ['GOOGLE_CALLBACK_URL', 'Sí (OAuth)', 'URL de callback de Google (debe coincidir con la configurada en Google Cloud)'],
      ['CLIENT_URL', 'Sí', 'URL del frontend (para CORS y cookie secure)'],
      ['ADMIN_PASSWORD', 'Solo seed', 'Contraseña del admin creado por el seed'],
    ],
    C.dev
  ),
  sp(),

  h2('7.3 Modelos de Base de Datos'),
  p('Todos los modelos están en server/models/. Se usa Mongoose con MongoDB Atlas.'),
  sp(),

  h3('User — Staff (admin, supervisor, bibliotecario)'),
  tbl(['Campo', 'Tipo', 'Descripción'],
    [
      ['name', 'String', 'Nombre completo (requerido, máx 100)'],
      ['email', 'String', 'Email único, minúsculas (requerido)'],
      ['password', 'String', 'Hash bcrypt (select: false — no se devuelve en queries)'],
      ['role', 'String', '"admin" | "supervisor" | "bibliotecario" (default: "bibliotecario")'],
      ['assignedLibrary', 'ObjectId (Library)', 'Solo para bibliotecarios. Biblioteca que puede gestionar'],
      ['permissions.canManageLibraries', 'Boolean', 'Solo para supervisores'],
      ['permissions.canManageNews', 'Boolean', 'Solo para supervisores'],
      ['permissions.canEditDepartments', 'Boolean', 'Solo para supervisores'],
      ['isActive', 'Boolean', 'Si false: no puede iniciar sesión (default: true)'],
      ['lastLogin', 'Date', 'Último login registrado'],
      ['lastSeen', 'Date', 'Último heartbeat recibido (para indicador de presencia)'],
      ['passwordChangedAt', 'Date', 'Para invalidar tokens anteriores al cambio de contraseña'],
    ],
    C.dev
  ),
  sp(),

  h3('PublicUser — Usuarios Google'),
  tbl(['Campo', 'Tipo', 'Descripción'],
    [
      ['googleId', 'String', 'ID único de Google (requerido)'],
      ['email', 'String', 'Email de Google'],
      ['name', 'String', 'Nombre de Google'],
      ['picture', 'String', 'URL de foto de perfil de Google'],
      ['likedLibraries', '[ObjectId]', 'IDs de bibliotecas con me gusta'],
      ['likedNews', '[ObjectId]', 'IDs de noticias con me gusta'],
      ['bio', 'String', 'Biografía editable por el usuario (máx 200)'],
      ['lastSeen', 'Date', 'Último heartbeat'],
      ['isActive', 'Boolean', 'Si false: no puede interactuar (default: true)'],
    ],
    C.dev
  ),
  sp(),

  h3('Library — Biblioteca'),
  tbl(['Campo', 'Tipo', 'Descripción'],
    [
      ['name', 'String', 'Nombre (requerido)'],
      ['department', 'ObjectId (Department)', 'Departamento al que pertenece (requerido)'],
      ['address.street', 'String', 'Calle y número'],
      ['address.locality', 'String', 'Localidad'],
      ['address.mapsUrl', 'String', 'URL de Google Maps (validado http/https)'],
      ['contact.phone', 'String', 'Teléfono'],
      ['contact.whatsapp', 'String', 'WhatsApp'],
      ['contact.email', 'String', 'Email'],
      ['contact.website', 'String', 'URL DigiBepe (http://XXXX.bepe.ar/)'],
      ['digibepe', 'String', 'URL del sitio web propio (validado http/https)'],
      ['socialMedia.facebook/instagram/youtube', 'String', 'URLs de redes sociales'],
      ['schedule', '[{day, open, close}]', 'Horarios por día'],
      ['description', 'String', 'Descripción larga (máx 2000)'],
      ['services', '[String]', 'Lista de servicios'],
      ['images', '[String]', 'URLs de imágenes adicionales'],
      ['thumbnail', 'String', 'URL de imagen principal'],
      ['foundedYear', 'Number', 'Año de fundación'],
      ['likes', 'Number', 'Contador total de me gusta'],
      ['conabipRegistered', 'Boolean', '¿Registrada en CONABIP?'],
      ['comments', '[CommentSchema]', 'Array embebido de comentarios con replies y reacciones'],
      ['isActive', 'Boolean', 'Visible en el sitio público'],
      ['assignedUser', 'ObjectId (User)', 'Bibliotecario asignado'],
    ],
    C.dev
  ),
  sp(),

  h3('ActivityLog — Historial de actividad'),
  tbl(['Campo', 'Tipo', 'Descripción'],
    [
      ['userId', 'ObjectId', 'ID del usuario que realizó la acción'],
      ['userType', 'String', '"staff" | "public"'],
      ['userName', 'String', 'Nombre del usuario al momento de la acción'],
      ['userEmail', 'String', 'Email del usuario'],
      ['userRole', 'String', 'Rol del usuario'],
      ['action', 'String', 'Descripción de la acción (ej: "Inició sesión")'],
      ['resource', 'String', 'Recurso afectado (ej: "biblioteca", "noticia")'],
      ['resourceId', 'ObjectId', 'ID del recurso afectado'],
      ['ip', 'String', 'IP del cliente'],
      ['expiresAt', 'Date', 'TTL: se elimina automáticamente cuando pase esta fecha (default: +30 días)'],
    ],
    C.dev
  ),
  p('Índice TTL en Mongoose: activityLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })'),
  sp(),

  h3('PageView — Analíticas de visitas'),
  tbl(['Campo', 'Tipo', 'Descripción'],
    [
      ['path', 'String', 'Ruta visitada (ej: "/bibliotecas/abc123")'],
      ['resourceType', 'String', '"biblioteca" | "noticia" | "home" | "nosotros" | "noticias" | "departamento" | "otro"'],
      ['resourceId', 'ObjectId', 'ID del recurso si aplica'],
      ['resourceName', 'String', 'Nombre del recurso (para exports)'],
      ['type', 'String', '"view" | "share"'],
      ['userType', 'String', '"staff" | "public" | "anon"'],
      ['ip', 'String', 'IP del visitante'],
      ['country', 'String', 'Nombre del país (de geoip-lite)'],
      ['countryCode', 'String', 'Código ISO alpha-2 (ej: "AR")'],
      ['city', 'String', 'Ciudad'],
      ['lat / lon', 'Number', 'Coordenadas para el mapa'],
    ],
    C.dev
  ),
  sp(),

  h2('7.4 API — Referencia de Endpoints'),
  p('Base URL: /api. Todos los endpoints devuelven JSON. Los que requieren autenticación usan JWT en Authorization: Bearer <token> o cookie jwt.'),
  sp(),

  h3('Autenticación — /api/auth'),
  tbl(['Método', 'Ruta', 'Acceso', 'Descripción'],
    [
      ['POST', '/login', 'Público', 'Login de staff. Body: { email, password }'],
      ['POST', '/logout', 'Público', 'Invalida la cookie JWT'],
      ['GET', '/me', 'Staff autenticado', 'Devuelve el usuario staff actual'],
      ['PATCH', '/change-password', 'Staff autenticado', 'Cambia contraseña. Body: { currentPassword, newPassword }'],
      ['PATCH', '/update-profile', 'Staff autenticado', 'Actualiza nombre/email'],
      ['GET', '/google', 'Público', 'Inicia el flujo de Google OAuth (redirige a Google)'],
      ['GET', '/google/callback', 'Público', 'Callback de Google (redirige al frontend con token)'],
      ['GET', '/me-public', 'Token público', 'Devuelve el perfil del usuario Google actual'],
      ['PATCH', '/update-profile-public', 'Token público', 'Actualiza bio del usuario Google'],
    ],
    C.dev
  ),
  sp(),

  h3('Bibliotecas — /api/libraries'),
  tbl(['Método', 'Ruta', 'Acceso', 'Descripción'],
    [
      ['GET', '/', 'Público', 'Listado. Params: department (slug), search, page, limit'],
      ['GET', '/:id', 'Público', 'Detalle. Excluye comentarios ocultos'],
      ['POST', '/', 'Admin / Super (canManageLibraries)', 'Crear biblioteca'],
      ['PATCH', '/:id', 'Admin / Super (canManageLibraries)', 'Editar campos admin'],
      ['DELETE', '/:id', 'Admin / Super (canManageLibraries)', 'Eliminar con cascade'],
      ['POST', '/:id/like', 'Token público', 'Toggle me gusta en biblioteca'],
      ['POST', '/:id/comments', 'Token público', 'Agregar comentario'],
      ['POST', '/:id/comments/:cId/replies', 'Token público', 'Responder comentario'],
      ['POST', '/:id/comments/:cId/like', 'Token público', 'Reaccionar a comentario'],
      ['GET', '/:id/comments', 'Staff', 'Todos los comentarios incl. ocultos'],
      ['PATCH', '/:id/comments/:cId/hide', 'Staff', 'Ocultar comentario'],
      ['PATCH', '/:id/comments/:cId/restore', 'Admin / Supervisor', 'Restaurar comentario'],
      ['DELETE', '/:id/comments/:cId', 'Admin / Supervisor', 'Eliminar comentario'],
    ],
    C.dev
  ),
  sp(),

  h3('Presencia — /api/presence'),
  tbl(['Método', 'Ruta', 'Acceso', 'Descripción'],
    [
      ['POST', '/heartbeat', 'Token staff o público', 'Actualiza lastSeen. Siempre responde 204'],
    ],
    C.dev
  ),
  sp(),

  h3('Analíticas — /api/analytics'),
  tbl(['Método', 'Ruta', 'Acceso', 'Descripción'],
    [
      ['POST', '/track', 'Público (silencioso)', 'Registra una visita o compartido. Body: { path, type, userType, resourceId, ... }'],
      ['GET', '/overview', 'Admin', 'Totales del período. Param: period=week|month|year'],
      ['GET', '/geo', 'Admin', 'Visitas por país con coordenadas'],
      ['GET', '/popular', 'Admin', 'Páginas más visitadas con nombre del recurso'],
      ['GET', '/interactions', 'Admin', 'Likes, dislikes y compartidos por contenido'],
      ['GET', '/export', 'Admin', 'Exportar reporte. Params: format=xlsx|docx|txt, period'],
    ],
    C.dev
  ),
  sp(),

  h2('7.5 Seguridad implementada'),
  h3('Middlewares globales'),
  tbl(['Middleware', 'Qué hace'],
    [
      ['helmet()', 'Agrega headers de seguridad HTTP (CSP, HSTS, X-Frame-Options, etc.)'],
      ['cors()', 'Restringe el origen a CLIENT_URL. credentials: true para cookies'],
      ['sanitizeInput', 'Elimina claves con $ o . de req.body/query/params (anti-inyección NoSQL)'],
      ['apiLimiter', '200 peticiones por IP cada 15 minutos en /api/*'],
      ['loginLimiter', '10 intentos por IP cada 15 minutos en /api/auth/login'],
    ],
    C.danger
  ),
  sp(),

  h3('Autenticación y autorización'),
  bullet('Passwords: bcrypt con cost factor 12 (cada hash tarda ~250ms, hace ataques de fuerza bruta inviables)'),
  bullet('Tokens JWT: almacenados en cookie HttpOnly + localStorage. HttpOnly previene acceso desde JS'),
  bullet('Mensajes de error de login genéricos: "Email o contraseña incorrectos" (no filtra si el email existe)'),
  bullet('protect(): verifica JWT y carga req.user. Si el token es inválido o expiró: 401'),
  bullet('restrictTo(): verifica que req.user.role esté en la lista de roles permitidos'),
  bullet('Google OAuth: solo se piden los scopes "profile" y "email" (no requieren verificación de Google)'),
  sp(),

  h3('Validación de datos'),
  bullet('express-validator en rutas críticas (login, creación de usuario, URLs de bibliotecas)'),
  bullet('URLs de websites/redes sociales validadas con isURL({ protocols: ["http","https"] }) → rechaza javascript: y otros esquemas'),
  bullet('Campos con lista blanca en submissions: nunca se pasa req.body directamente, solo los campos permitidos'),
  bullet('Mongoose: validaciones de tipo, maxlength, enum y match en todos los modelos'),
  sp(),

  h3('XSS'),
  bullet('El contenido HTML de noticias (TipTap) lo genera solo staff admin/supervisor autenticado → dangerouslySetInnerHTML es aceptable'),
  bullet('Comentarios de usuarios públicos: siempre texto plano, renderizado como JSX (React escapa automáticamente)'),
  bullet('Descripciones de bibliotecas: texto plano, sin dangerouslySetInnerHTML'),
  sp(),

  noteDanger('⚠  BUG HISTÓRICO de Mongoose 9.x — En los hooks pre("save"), NO declarar ni llamar next() aunque la función sea síncrona. Mongoose 9 lanza TypeError: next is not a function. Toda la lógica va directamente en el cuerpo de la función.'),
  sp(),

  // ─── SECCIÓN 8: DESPLIEGUE ────────────────────────────
  h1('8. Despliegue en Producción', C.primary),

  h2('8.1 Frontend — Vercel'),
  bullet('1. Crear cuenta en vercel.com y conectar el repositorio de GitHub'),
  bullet('2. Configurar el proyecto:'),
  bullet('Root Directory: client', 1),
  bullet('Framework Preset: Vite', 1),
  bullet('Build Command: npm run build', 1),
  bullet('Output Directory: dist', 1),
  bullet('3. Agregar variable de entorno: VITE_API_URL = https://<tu-api>.onrender.com/api'),
  bullet('4. Actualizar client/src/api/axios.js para usar esta variable en producción'),
  bullet('5. Vercel detecta el repositorio y despliega automáticamente en cada push a main'),
  sp(),

  h2('8.2 Backend — Render'),
  bullet('1. Crear cuenta en render.com y conectar el repositorio'),
  bullet('2. Crear un nuevo "Web Service" apuntando al directorio server/'),
  bullet('3. Configurar:'),
  bullet('Build Command: npm install', 1),
  bullet('Start Command: node index.js', 1),
  bullet('4. Agregar todas las variables del server/.env en la sección "Environment" de Render'),
  bullet('5. Cambiar GOOGLE_CALLBACK_URL a la URL de producción: https://<api>.onrender.com/api/auth/google/callback'),
  bullet('6. Cambiar CLIENT_URL a la URL de Vercel: https://<app>.vercel.app'),
  sp(),

  h2('8.3 Google OAuth en producción'),
  bullet('1. Ir a Google Cloud Console → OAuth 2.0 → Credenciales'),
  bullet('2. Agregar la URL de producción del frontend en "Orígenes de JavaScript autorizados"'),
  bullet('3. Agregar la URL de callback del backend en "URIs de redireccionamiento autorizados"'),
  bullet('4. Si se desea que cualquier cuenta Google pueda ingresar (no solo las de prueba):'),
  bullet('Ir a "Pantalla de consentimiento de OAuth" → Publicar la aplicación', 1),
  bullet('Puede requerir una política de privacidad pública y revisión de Google', 1),
  sp(),
  noteInfo('💡 Hoy el sitio está en modo "Testing": solo el email del administrador puede autenticarse con Google. Pasar a "Production" requiere una pantalla de privacidad y posiblemente revisión de Google.'),
  sp(),

  // ─── SECCIÓN 9: PROBLEMAS CONOCIDOS ──────────────────
  h1('9. Problemas Conocidos y Soluciones', C.primary),

  tbl(['Problema', 'Causa', 'Solución'],
    [
      ['MongoDB SRV falla con "querySrv ECONNREFUSED"', 'Bug del resolver DNS de Node en algunas redes Windows', 'Usar URI de conexión directa con los 3 hosts del shard (ver sección 7.1)'],
      ['El rate limiter bloquea scripts de prueba (429)', 'El apiLimiter cuenta peticiones del script', 'Reiniciar el servidor backend para resetear el contador en memoria'],
      ['El mapa de analíticas muestra vacío en desarrollo', 'geoip-lite no geolocalizan IPs locales (127.0.0.1/::1)', 'Comportamiento correcto. El mapa funciona en producción con IPs reales'],
      ['TypeError: next is not a function en hooks de Mongoose', 'Mongoose 9.x cambió el comportamiento de pre("save")', 'Nunca declarar ni llamar next() en hooks. La lógica va directo en el cuerpo'],
      ['El heartbeat crea dos intervalos', 'useHeartbeat llamado desde dos componentes', 'Mantener useHeartbeat SOLO en Navbar.jsx. No llamarlo desde App.jsx ni otros'],
      ['Google OAuth solo funciona para el email del admin', 'App de Google en modo "Testing"', 'Pasar a "Production" en Google Cloud Console (ver sección 8.3)'],
      ['Cuenta supervisor.test@bpsanjuan.ar activa', 'Origen desconocido (ver PROGRESS.md)', 'Verificar con el admin si es una cuenta real o desactivarla'],
      ['Build de Vite con warning de chunk > 500KB', 'react-simple-maps + TipTap son pesados', 'Warning informativo, no error. Considerar code-splitting si el tiempo de carga es importante'],
    ],
    C.danger
  ),
  sp(),

  // ─── SECCIÓN 10: GLOSARIO ─────────────────────────────
  h1('10. Glosario', C.primary),
  tbl(['Término', 'Significado'],
    [
      ['MERN', 'Stack: MongoDB + Express + React + Node.js'],
      ['JWT', 'JSON Web Token. Token firmado digitalmente para autenticar peticiones'],
      ['OAuth 2.0', 'Protocolo de autorización. Permite "Login con Google" sin compartir la contraseña'],
      ['TTL', 'Time To Live. En MongoDB, índice que elimina documentos automáticamente al expirar'],
      ['ODM', 'Object Document Mapper. Mongoose es el ODM que conecta Node.js con MongoDB'],
      ['Heartbeat', 'Ping periódico (cada 45s) que envía el navegador para indicar que el usuario está activo'],
      ['Choropleth', 'Mapa temático donde las regiones se colorean según un valor numérico (aquí, visitas)'],
      ['Submission', 'Propuesta de cambio que un bibliotecario envía y queda pendiente de aprobación'],
      ['Staff', 'Todo el personal con cuenta email/contraseña: admin, supervisor, bibliotecario'],
      ['Usuario público', 'Visitante que se autentica con Google OAuth para interactuar con el contenido'],
      ['slug', 'Versión URL-friendly de un nombre. Ej: "Capital" → "capital", "25 de Mayo" → "25-de-mayo"'],
      ['SPA', 'Single Page Application. React carga una sola vez; la navegación no recarga la página'],
      ['CORS', 'Cross-Origin Resource Sharing. Política que controla qué dominios pueden llamar a la API'],
      ['Rate limiting', 'Límite de peticiones por IP en un período de tiempo. Previene ataques de fuerza bruta'],
      ['XSS', 'Cross-Site Scripting. Ataque de inyección de código JavaScript malicioso'],
      ['geoip-lite', 'Paquete Node.js con base de datos offline para mapear IPs a países y ciudades'],
      ['DigiBepe', 'Plataforma del sistema BEPE (bepe.ar) que ofrece catálogos digitales de bibliotecas'],
      ['CONABIP', 'Comisión Nacional Protectora de Bibliotecas Populares (Argentina)'],
    ],
    C.dark
  ),
  sp(),

  // ─── PIE DE PÁGINA ─────────────────────────────────────
  divider(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200 },
    children: [
      new TextRun({ text: 'Bibliotecas Populares de San Juan  ·  Documentación del Sistema  ·  Julio 2026', size: 18, color: C.gray, font: 'Calibri' })
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text: 'Desarrollado con ♥ para la comunidad bibliotecaria de San Juan, Argentina', size: 18, color: C.gray, font: 'Calibri', italics: true })
    ]
  }),
];

// ══════════════════════════════════════════════════════════
//  GENERAR ARCHIVO
// ══════════════════════════════════════════════════════════

async function main() {
  const doc = new Document({
    creator: 'Sistema BPSanJuan',
    title: 'Documentación — Bibliotecas Populares de San Juan',
    description: 'Manual completo para administradores, supervisores, bibliotecarios y desarrolladores.',
    sections: [{
      properties: {
        page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } }
      },
      children
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, '../../Documentacion_BPSanJuan.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('✅ Documentación generada:', outPath);
  console.log('   Tamaño:', Math.round(buffer.length / 1024), 'KB');
}

main().catch(err => {
  console.error('❌ Error al generar:', err.message);
  process.exit(1);
});
