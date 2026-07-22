/**
 * Punto de color que indica el estado de conexión de un usuario
 * basado en su campo lastSeen (timestamp del último heartbeat recibido).
 *
 * Estados:
 *  online      — verde   (#22c55e) : lastSeen < 90s
 *  idle        — gris    (#9CA3AF) : lastSeen 90s–8min
 *  offline     — negro   (#374151) : > 8min o nunca
 *  reconnecting— amarillo (#EAB308) : estado local (cliente reconectando)
 */

const THRESHOLDS = { online: 90_000, idle: 8 * 60_000 };

const COLORS = {
  online:       '#22c55e',
  idle:         '#9CA3AF',
  offline:      '#374151',
  reconnecting: '#EAB308',
};

const LABELS = {
  online:       'En línea',
  idle:         'Recientemente en línea',
  offline:      'Desconectado',
  reconnecting: 'Reconectando…',
};

export function getOnlineStatus(lastSeen) {
  if (!lastSeen) return 'offline';
  const diff = Date.now() - new Date(lastSeen).getTime();
  if (diff < THRESHOLDS.online) return 'online';
  if (diff < THRESHOLDS.idle)   return 'idle';
  return 'offline';
}

export function OnlineIndicator({ lastSeen, overrideStatus, size = 10, style = {} }) {
  const status = overrideStatus ?? getOnlineStatus(lastSeen);
  return (
    <span
      title={LABELS[status]}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: COLORS[status],
        border: '2px solid var(--surface)',
        flexShrink: 0,
        boxShadow: status === 'online' ? `0 0 0 2px ${COLORS.online}33` : 'none',
        ...style
      }}
    />
  );
}
