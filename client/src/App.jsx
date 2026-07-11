import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Nosotros from './pages/Nosotros';
import Noticias from './pages/Noticias';
import NoticiaDetalle from './pages/NoticiaDetalle';
import Departamento from './pages/Departamento';
import BibliotecaDetalle from './pages/BibliotecaDetalle';
import Login from './pages/Login';
import GoogleCallback from './pages/GoogleCallback';
import Dashboard from './pages/admin/Dashboard';
import AdminHome from './pages/admin/AdminHome';
import GestionUsuarios from './pages/admin/GestionUsuarios';
import GestionBibliotecas from './pages/admin/GestionBibliotecas';
import GestionNoticias from './pages/admin/GestionNoticias';
import GestionDepartamentos from './pages/admin/GestionDepartamentos';
import BibliotecaForm from './pages/admin/BibliotecaForm';
import NoticiaForm from './pages/admin/NoticiaForm';
import Aprobaciones from './pages/admin/Aprobaciones';
import GestionUsuariosPublicos from './pages/admin/GestionUsuariosPublicos';
import ActivityLogs from './pages/admin/ActivityLogs';
import MiPerfil from './pages/MiPerfil';
import PanelLayout from './pages/bibliotecario/PanelLayout';
import MiBiblioteca from './pages/bibliotecario/MiBiblioteca';
import ModeracionComentarios from './pages/bibliotecario/ModeracionComentarios';
import Mensajes from './pages/bibliotecario/Mensajes';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <Navbar />
        <main>
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
        </main>
        <Footer />
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
