export function byteToKB(bytes) {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes)) return undefined;
  return Math.round((bytes / 1000) * 100) / 100;
}

export function projectName(path) {
  if (typeof path !== 'string' || path === '') return undefined;
  const segments = path.split('/');
  return segments[segments.length - 1];
}

export function safeValue(value) {
  if (value === undefined || value === null) return '-';
  if (typeof value === 'number' && !Number.isFinite(value)) return '-';
  if (typeof value === 'string' && value.trim() === '') return '-';
  return value;
}