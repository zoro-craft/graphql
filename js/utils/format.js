// format xp bytes into a readable value with a kb or mb unit.
export function formatXP(bytes) {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes)) return undefined;

  const kb = bytes / 1000;
  if (kb > 1000) {
    const mb = Math.round((kb / 1000) * 100) / 100;
    return String(mb) + ' MB';
  }
  if (kb >= 100) return String(Math.round(kb)) + ' KB';
  if (kb >= 10) return (Math.round(kb * 10) / 10).toFixed(1) + ' KB';
  return (Math.round(kb * 100) / 100).toFixed(2) + ' KB';
}

// audit ratio rounded to one decimal.
export function formatRatio(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '-';
  return (Math.round(value * 10) / 10).toFixed(1);
}

// last segment of a project path, used as the project's display name.
export function projectName(path) {
  if (typeof path !== 'string' || path === '') return undefined;
  const segments = path.split('/');
  return segments[segments.length - 1];
}

// replace missing or empty values with a dash.
export function safeValue(value) {
  if (value === undefined || value === null) return '-';
  if (typeof value === 'number' && !Number.isFinite(value)) return '-';
  if (typeof value === 'string' && value.trim() === '') return '-';
  return value;
}