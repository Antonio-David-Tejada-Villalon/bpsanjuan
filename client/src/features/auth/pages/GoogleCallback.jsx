import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getMePublic } from '@/features/auth/api/auth';

function decodeJwtPayload(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export default function GoogleCallback() {
  const [params] = useSearchParams();
  const { setPublicSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      navigate('/');
      return;
    }

    // El interceptor de axios necesita el token en localStorage antes de pedir el perfil
    localStorage.setItem('publicToken', token);

    getMePublic()
      .then(({ publicUser }) => setPublicSession(token, publicUser))
      .catch(() => {
        const payload = decodeJwtPayload(token);
        setPublicSession(token, { _id: payload?.id });
      })
      .finally(() => navigate('/'));
  }, [params, setPublicSession, navigate]);

  return <div className="page-loading"><div className="spinner" /></div>;
}
