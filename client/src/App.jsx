import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { ThemeProvider } from '@/shared/context/ThemeContext';
import Navbar from '@/shared/components/Navbar';
import Footer from '@/shared/components/Footer';
import ScrollToTopBtn from '@/shared/components/ScrollToTopBtn';
import CookieConsent from '@/shared/components/CookieConsent';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import { SkeletonPage } from '@/shared/components/Skeleton';
import { usePageView } from '@/features/analytics/hooks/usePageView';

// ── Páginas públicas ─────────────────────────────────────────────
const Home              = lazy(() => import('@/pages/Home'));
const Nosotros          = lazy(() => import('@/pages/Nosotros'));
const Noticias          = lazy(() => import('@/features/news/pages/Noticias'));
const NoticiaDetalle    = lazy(() => import('@/features/news/pages/NoticiaDetalle'));
const Departamento      = lazy(() => import('@/features/departments/pages/Departamento'));
const BibliotecaDetalle = lazy(() => import('@/features/libraries/pages/BibliotecaDetalle'));
const Login             = lazy(() => import('@/features/auth/pages/Login'));
const GoogleCallback    = lazy(() => import('@/features/auth/pages/GoogleCallback'));
const MiPerfil          = lazy(() => import('@/features/users/pages/MiPerfil'));
const NoticiasPorTag    = lazy(() => import('@/features/news/pages/NoticiasPorTag'));
const FeriaDelLibro     = lazy(() => import('@/pages/FeriaDelLibro'));
const EquipoMiembro     = lazy(() => import('@/pages/EquipoMiembro'));
const Privacidad        = lazy(() => import('@/pages/Privacidad'));
const Accesibilidad     = lazy(() => import('@/pages/Accesibilidad'));
const NotFound          = lazy(() => import('@/pages/NotFound'));

// ── Panel admin / supervisor ─────────────────────────────────────
const Dashboard              = lazy(() => import('@/features/admin-shell/pages/Dashboard'));
const AdminHome              = lazy(() => import('@/features/admin-shell/pages/AdminHome'));
const GestionUsuarios        = lazy(() => import('@/features/users/admin/GestionUsuarios'));
const GestionBibliotecas     = lazy(() => import('@/features/libraries/admin/GestionBibliotecas'));
const GestionNoticias        = lazy(() => import('@/features/news/admin/GestionNoticias'));
const GestionDepartamentos   = lazy(() => import('@/features/departments/admin/GestionDepartamentos'));
const BibliotecaForm         = lazy(() => import('@/features/libraries/admin/BibliotecaForm'));
const NoticiaForm            = lazy(() => import('@/features/news/admin/NoticiaForm'));
const Aprobaciones           = lazy(() => import('@/features/libraries/admin/Aprobaciones'));
const GestionUsuariosPublicos = lazy(() => import('@/features/users/admin/GestionUsuariosPublicos'));
const ActivityLogs           = lazy(() => import('@/features/activity-log/admin/ActivityLogs'));
const Analytics              = lazy(() => import('@/features/analytics/admin/Analytics'));
const NewsletterSubscribers  = lazy(() => import('@/features/newsletter/admin/NewsletterSubscribers'));

// ── Panel bibliotecario ──────────────────────────────────────────
const PanelLayout          = lazy(() => import('@/features/libraries/bibliotecario/PanelLayout'));
const MiBiblioteca         = lazy(() => import('@/features/libraries/bibliotecario/MiBiblioteca'));
const ModeracionComentarios = lazy(() => import('@/features/libraries/bibliotecario/ModeracionComentarios'));
const Mensajes             = lazy(() => import('@/features/messaging/pages/Mensajes'));

function PageViewTracker() {
  usePageView();
  return null;
}

function ScrollReveal() {
  const { pathname } = useLocation();
  useEffect(() => {
    let io;
    let mo;
    const raf = requestAnimationFrame(() => {
      io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

      const observeCards = () =>
        document.querySelectorAll('.card:not(.revealed)').forEach(el => io.observe(el));

      observeCards();

      mo = new MutationObserver(observeCards);
      mo.observe(document.querySelector('#main-content') || document.body, { childList: true, subtree: true });
    });
    return () => { cancelAnimationFrame(raf); io?.disconnect(); mo?.disconnect(); };
  }, [pathname]);
  return null;
}

function App() {
  return (
    <HelmetProvider>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <PageViewTracker />
          <ScrollReveal />
          <Navbar />
          <main id="main-content">
            <Suspense fallback={<SkeletonPage />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/nosotros" element={<Nosotros />} />
                <Route path="/noticias" element={<Noticias />} />
                <Route path="/noticias/tag/:tag" element={<NoticiasPorTag />} />
                <Route path="/noticias/:id" element={<NoticiaDetalle />} />
                <Route path="/departamentos/:slug" element={<Departamento />} />
                <Route path="/bibliotecas/:id" element={<BibliotecaDetalle />} />
                <Route path="/login" element={<Login />} />
                <Route path="/auth/google-callback" element={<GoogleCallback />} />
                <Route path="/perfil" element={<MiPerfil />} />
                <Route path="/feria-del-libro" element={<FeriaDelLibro />} />
                <Route path="/equipo/:id" element={<EquipoMiembro />} />
                <Route path="/privacidad" element={<Privacidad />} />
                <Route path="/accesibilidad" element={<Accesibilidad />} />
                <Route path="*" element={<NotFound />} />

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute roles={['admin', 'supervisor']}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminHome />} />
                  <Route path="usuarios" element={<GestionUsuarios />} />
                  <Route path="bibliotecas" element={<GestionBibliotecas />} />
                  <Route path="bibliotecas/nueva" element={<BibliotecaForm />} />
                  <Route path="bibliotecas/editar/:id" element={<BibliotecaForm />} />
                  <Route path="noticias" element={<GestionNoticias />} />
                  <Route path="noticias/nueva" element={<NoticiaForm />} />
                  <Route path="noticias/editar/:id" element={<NoticiaForm />} />
                  <Route path="departamentos" element={<GestionDepartamentos />} />
                  <Route path="aprobaciones" element={<Aprobaciones />} />
                  <Route path="comunidad" element={<GestionUsuariosPublicos />} />
                  <Route path="actividad" element={<ActivityLogs />} />
                  <Route path="analiticas" element={<Analytics />} />
                  <Route path="newsletter" element={<NewsletterSubscribers />} />
                </Route>

                <Route
                  path="/panel"
                  element={
                    <ProtectedRoute roles={['bibliotecario']}>
                      <PanelLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<MiBiblioteca />} />
                  <Route path="comentarios" element={<ModeracionComentarios />} />
                  <Route path="mensajes" element={<Mensajes />} />
                </Route>
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <CookieConsent />
          <ScrollToTopBtn />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
