import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTopBtn from './components/ScrollToTopBtn';
import CookieConsent from './components/CookieConsent';
import ProtectedRoute from './components/ProtectedRoute';
import { SkeletonPage } from './components/Skeleton';
import { usePageView } from './hooks/usePageView';

// ── Páginas públicas ─────────────────────────────────────────────
const Home              = lazy(() => import('./pages/Home'));
const Nosotros          = lazy(() => import('./pages/Nosotros'));
const Noticias          = lazy(() => import('./pages/Noticias'));
const NoticiaDetalle    = lazy(() => import('./pages/NoticiaDetalle'));
const Departamento      = lazy(() => import('./pages/Departamento'));
const BibliotecaDetalle = lazy(() => import('./pages/BibliotecaDetalle'));
const Login             = lazy(() => import('./pages/Login'));
const GoogleCallback    = lazy(() => import('./pages/GoogleCallback'));
const MiPerfil          = lazy(() => import('./pages/MiPerfil'));
const Privacidad        = lazy(() => import('./pages/Privacidad'));
const Accesibilidad     = lazy(() => import('./pages/Accesibilidad'));
const NotFound          = lazy(() => import('./pages/NotFound'));

// ── Panel admin / supervisor ─────────────────────────────────────
const Dashboard              = lazy(() => import('./pages/admin/Dashboard'));
const AdminHome              = lazy(() => import('./pages/admin/AdminHome'));
const GestionUsuarios        = lazy(() => import('./pages/admin/GestionUsuarios'));
const GestionBibliotecas     = lazy(() => import('./pages/admin/GestionBibliotecas'));
const GestionNoticias        = lazy(() => import('./pages/admin/GestionNoticias'));
const GestionDepartamentos   = lazy(() => import('./pages/admin/GestionDepartamentos'));
const BibliotecaForm         = lazy(() => import('./pages/admin/BibliotecaForm'));
const NoticiaForm            = lazy(() => import('./pages/admin/NoticiaForm'));
const Aprobaciones           = lazy(() => import('./pages/admin/Aprobaciones'));
const GestionUsuariosPublicos = lazy(() => import('./pages/admin/GestionUsuariosPublicos'));
const ActivityLogs           = lazy(() => import('./pages/admin/ActivityLogs'));
const Analytics              = lazy(() => import('./pages/admin/Analytics'));

// ── Panel bibliotecario ──────────────────────────────────────────
const PanelLayout          = lazy(() => import('./pages/bibliotecario/PanelLayout'));
const MiBiblioteca         = lazy(() => import('./pages/bibliotecario/MiBiblioteca'));
const ModeracionComentarios = lazy(() => import('./pages/bibliotecario/ModeracionComentarios'));
const Mensajes             = lazy(() => import('./pages/bibliotecario/Mensajes'));

function PageViewTracker() {
  usePageView();
  return null;
}

function App() {
  return (
    <HelmetProvider>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <PageViewTracker />
          <Navbar />
          <main id="main-content">
            <Suspense fallback={<SkeletonPage />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/nosotros" element={<Nosotros />} />
                <Route path="/noticias" element={<Noticias />} />
                <Route path="/noticias/:id" element={<NoticiaDetalle />} />
                <Route path="/departamentos/:slug" element={<Departamento />} />
                <Route path="/bibliotecas/:id" element={<BibliotecaDetalle />} />
                <Route path="/login" element={<Login />} />
                <Route path="/auth/google-callback" element={<GoogleCallback />} />
                <Route path="/perfil" element={<MiPerfil />} />
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
