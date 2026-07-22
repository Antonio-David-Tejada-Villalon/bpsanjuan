import { useAuth } from '@/features/auth/context/AuthContext';
import CommentModeration from '@/features/libraries/components/CommentModeration';

export default function ModeracionComentarios() {
  const { user } = useAuth();

  if (!user.assignedLibrary) {
    return <p className="empty-state">Todavía no tenés una biblioteca asignada.</p>;
  }

  return (
    <div>
      <p className="section-subtitle" style={{ marginBottom: 16 }}>
        Podés ocultar comentarios de visitantes en tu ficha. La acción queda registrada para que un supervisor o administrador la revise; no vas a poder deshacerla vos.
      </p>
      <CommentModeration libraryId={user.assignedLibrary._id} canRestore={false} canHardDelete={false} />
    </div>
  );
}
