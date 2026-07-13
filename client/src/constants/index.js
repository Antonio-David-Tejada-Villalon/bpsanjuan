export const ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  BIBLIOTECARIO: 'bibliotecario',
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 9,
  ADMIN_PAGE_SIZE: 20,
  ACTIVITY_PAGE_SIZE: 20,
  ANALYTICS_TOP: 20,
};

export const API_BASE = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  LIBRARIES: '/api/libraries',
  DEPARTMENTS: '/api/departments',
  NEWS: '/api/news',
  SUBMISSIONS: '/api/library-submissions',
  MESSAGES: '/api/messages',
  ANALYTICS: '/api/analytics',
  ACTIVITY_LOGS: '/api/activity-logs',
  PRESENCE: '/api/presence',
  PUBLIC_USERS: '/api/public-users',
};

export const APP_ROUTES = {
  HOME: '/',
  NOSOTROS: '/nosotros',
  NOTICIAS: '/noticias',
  NOTICIA: (id) => `/noticias/${id}`,
  DEPARTAMENTO: (slug) => `/departamentos/${slug}`,
  BIBLIOTECA: (id) => `/bibliotecas/${id}`,
  LOGIN: '/login',
  PERFIL: '/perfil',
  ADMIN: '/admin',
  PANEL: '/panel',
};

export const ONLINE_THRESHOLDS = {
  ACTIVE_MS: 90 * 1000,
  IDLE_MS: 8 * 60 * 1000,
};

export const HEARTBEAT_INTERVAL_MS = 45 * 1000;
