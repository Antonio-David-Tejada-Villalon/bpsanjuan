import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PanelLayout() {
  const { user } = useAuth();

  return (
    <div className="section container">
      <div className="admin-header">
        <h1>Mi Biblioteca</h1>
        <p className="section-subtitle" style={{ marginBottom: 0 }}>Hola, {user.name}.</p>
      </div>

      <nav className="admin-tabs">
        <NavLink to="/panel" end className={({ isActive }) => (isActive ? 'active' : '')}>Mi Biblioteca</NavLink>
        <NavLink to="/panel/comentarios" className={({ isActive }) => (isActive ? 'active' : '')}>Comentarios</NavLink>
        <NavLink to="/panel/mensajes" className={({ isActive }) => (isActive ? 'active' : '')}>Mensajes</NavLink>
      </nav>

      <Outlet />
    </div>
  );
}
