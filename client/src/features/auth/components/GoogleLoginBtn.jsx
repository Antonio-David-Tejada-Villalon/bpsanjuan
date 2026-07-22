import { googleLoginUrl } from '@/features/auth/api/auth';

export default function GoogleLoginBtn({ className = 'btn btn-sm btn-accent' }) {
  return (
    <a href={googleLoginUrl()} className={className}>
      Iniciar sesión con Google
    </a>
  );
}
