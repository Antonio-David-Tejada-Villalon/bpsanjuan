import { useAuth } from '@/features/auth/context/AuthContext';
import MessageThread from '@/features/messaging/components/MessageThread';

export default function Mensajes() {
  const { user } = useAuth();

  if (!user.assignedLibrary) {
    return <p className="empty-state">Todavía no tenés una biblioteca asignada.</p>;
  }

  return (
    <div>
      <p className="section-subtitle" style={{ marginBottom: 16 }}>
        Conversá acá con un supervisor o administrador sobre tu biblioteca (por ejemplo, si te rechazaron una edición).
      </p>
      <MessageThread libraryId={user.assignedLibrary._id} />
    </div>
  );
}
