import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const canManageLibraries = user.role === 'admin' || user.permissions?.canManageLibraries;
  const canManageNews = user.role === 'admin' || user.permissions?.canManageNews;

  return (
    <div className="section container">
      <div className="admin-header">
        <h1>Panel de {user.role === 'admin' ? 'Administración' : 'Supervisión'}</h1>
        <p className="section-subtitle" style={{ marginBottom: 0 }}>Hola, {user.name}.</p>
      </div>

      <nav className="admin-tabs">
        {user.role === 'admin' && (
          <NavLink to="/admin/usuarios" className={({ isActive }) => (isActive ? 'active' : '')}>
            Usuarios
          </NavLink>
        )}
        {canManageLibraries && (
          <NavLink to="/admin/bibliotecas" className={({ isActive }) => (isActive ? 'active' : '')}>
            Bibliotecas
          </NavLink>
        )}
        {canManageLibraries && (
          <NavLink to="/admin/aprobaciones" className={({ isActive }) => (isActive ? 'active' : '')}>
            Aprobaciones
          </NavLink>
        )}
        {canManageNews && (
          <NavLink to="/admin/noticias" className={({ isActive }) => (isActive ? 'active' : '')}>
            Noticias
          </NavLink>
        )}
        {user.role === 'admin' && (
          <NavLink to="/admin/departamentos" className={({ isActive }) => (isActive ? 'active' : '')}>
            Departamentos
          </NavLink>
        )}
        {user.role === 'admin' && (
          <NavLink to="/admin/comunidad" className={({ isActive }) => (isActive ? 'active' : '')}>
            Comunidad
          </NavLink>
        )}
        {user.role === 'admin' && (
          <NavLink to="/admin/actividad" className={({ isActive }) => (isActive ? 'active' : '')}>
            Actividad
          </NavLink>
        )}
        {user.role === 'admin' && (
          <NavLink to="/admin/analiticas" className={({ isActive }) => (isActive ? 'active' : '')}>
            Analíticas
          </NavLink>
        )}
      </nav>

      <Outlet />
    </div>
  );
}
