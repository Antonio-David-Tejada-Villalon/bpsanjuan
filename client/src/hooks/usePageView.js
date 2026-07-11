import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export function usePageView() {
  const location = useLocation();
  const { user, publicUser } = useAuth();
  const lastPath = useRef(null);

  useEffect(() => {
    if (location.pathname === lastPath.current) return;
    lastPath.current = location.pathname;

    const userType = user ? 'staff' : publicUser ? 'public' : 'anon';
    api.post('/analytics/track', { path: location.pathname, type: 'view', userType }).catch(() => {});
  }, [location.pathname, user, publicUser]);
}
