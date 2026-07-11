import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useHeartbeat } from '../hooks/useHeartbeat';
import { OnlineIndicator } from './OnlineIndicator';
import './Navbar.css';

function IconSun() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function IconMoon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

const dashboardPathByRole = {
  admin: '/admin',
  supervisor: '/admin',
  bibliotecario: '/panel'
};

export default function Navbar() {
  const { user, logout, publicUser, logoutPublic } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const connState = useHeartbeat();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand" onClick={() => setOpen(false)}>
          📚 Bibliotecas Populares de San Juan
        </Link>

        <button
          className="navbar-toggle"
          aria-label="Abrir menú"
          onClick={() => setOpen(o => !o)}
        >
          ☰
        </button>

        <nav className={`navbar-links ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/nosotros">Sobre Nosotros</NavLink>
          <NavLink to="/noticias">Noticias</NavLink>

          {user ? (
            <>
              <NavLink to={dashboardPathByRole[user.role] || '/'}>Panel</NavLink>
              <button className="btn btn-outline btn-sm" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <OnlineIndicator overrideStatus={connState} size={8} style={{ border: '1.5px solid rgba(255,255,255,0.5)' }} />
                Salir ({user.name})
              </button>
            </>
          ) : (
            <NavLink to="/login" className="navbar-staff-link">Staff</NavLink>
          )}

          {publicUser && (
            <span className="navbar-public-user">
              {publicUser.picture && <img src={publicUser.picture} alt={publicUser.name} className="navbar-avatar" />}
              <NavLink to="/perfil" style={{ fontWeight: 500 }}>{publicUser.name}</NavLink>
              <button className="btn btn-outline btn-sm" onClick={logoutPublic}>Salir</button>
            </span>
          )}

          {user && (
            <NavLink to="/perfil" className="navbar-staff-link" style={{ fontSize: '0.85rem' }}>Mi Perfil</NavLink>
          )}

          <button
            className="navbar-theme-toggle"
            onClick={e => { e.stopPropagation(); toggleTheme(); }}
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? <IconSun /> : <IconMoon />}
          </button>
        </nav>
      </div>
    </header>
  );
}
