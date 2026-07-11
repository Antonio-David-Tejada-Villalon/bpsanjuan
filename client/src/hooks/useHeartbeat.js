import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const INTERVAL = 45_000; // 45 segundos

/**
 * Envía heartbeats periódicos al servidor para mantener el estado "en línea".
 * Retorna el estado de conexión: 'online' | 'reconnecting' | 'offline'
 */
export function useHeartbeat() {
  const { user, publicUser } = useAuth();
  const [connState, setConnState] = useState('online');
  const intervalRef = useRef(null);
  const failCountRef = useRef(0);

  useEffect(() => {
    if (!user && !publicUser) return;

    const beat = async () => {
      try {
        await api.post('/presence/heartbeat');
        if (failCountRef.current > 0) {
          setConnState('online');
          failCountRef.current = 0;
        }
      } catch {
        failCountRef.current += 1;
        if (failCountRef.current === 1) setConnState('reconnecting');
        if (failCountRef.current >= 3) setConnState('offline');
      }
    };

    beat();
    intervalRef.current = setInterval(beat, INTERVAL);

    const goOffline = () => setConnState('reconnecting');
    const goOnline = () => { failCountRef.current = 0; beat(); };
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);

    return () => {
      clearInterval(intervalRef.current);
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, [user?._id, publicUser?._id]); // eslint-disable-line

  return connState;
}
