import { useState, useEffect } from 'react';

export function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 5)   return 'justo ahora';
  if (diff < 60)  return `hace ${diff} segundo${diff !== 1 ? 's' : ''}`;
  const m = Math.floor(diff / 60);
  if (m < 60)     return `hace ${m} minuto${m !== 1 ? 's' : ''}`;
  const h = Math.floor(m / 60);
  if (h < 24)     return `hace ${h} hora${h !== 1 ? 's' : ''}`;
  const d = Math.floor(h / 24);
  if (d < 7)      return `hace ${d} día${d !== 1 ? 's' : ''}`;
  const w = Math.floor(d / 7);
  if (w < 4)      return `hace ${w} semana${w !== 1 ? 's' : ''}`;
  const mo = Math.floor(d / 30);
  if (mo < 12)    return `hace ${mo} mes${mo !== 1 ? 'es' : ''}`;
  const y = Math.floor(d / 365);
  return `hace ${y} año${y !== 1 ? 's' : ''}`;
}

function nextTick(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)   return 1000;
  if (diff < 3600) return 30000;
  if (diff < 86400) return 60000;
  return 300000;
}

export function useTimeAgo(date) {
  const [label, setLabel] = useState(() => (date ? timeAgo(date) : ''));

  useEffect(() => {
    if (!date) return;
    setLabel(timeAgo(date));
    let timer;
    const schedule = () => {
      timer = setTimeout(() => {
        setLabel(timeAgo(date));
        schedule();
      }, nextTick(date));
    };
    schedule();
    return () => clearTimeout(timer);
  }, [date]);

  return label;
}
