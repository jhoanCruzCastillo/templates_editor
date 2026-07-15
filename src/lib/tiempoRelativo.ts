export function tiempoRelativo(fechaISO: string): string {
  const diffMs = Date.now() - new Date(fechaISO).getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return 'hace un momento';
  if (diffMin < 60) return `hace ${diffMin} min`;

  const diffHoras = Math.floor(diffMin / 60);
  if (diffHoras < 24) return `hace ${diffHoras} h`;

  const diffDias = Math.floor(diffHoras / 24);
  if (diffDias === 1) return 'hace 1 día';
  if (diffDias < 30) return `hace ${diffDias} días`;

  return new Date(fechaISO).toLocaleDateString('es-PE');
}
