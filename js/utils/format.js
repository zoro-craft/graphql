/**
 * Format a raw XP amount (in bytes) for display. The unit always follows the number.
 *   - more than 1000 KB -> rounded value in MB   (e.g. "1.5 MB")
 *   - 100 KB or more    -> rounded integer       (e.g. "101 KB")
 *   - 10 KB or more     -> one decimal           (e.g. "55.0 KB")
 *   - less than 10 KB   -> two decimals          (e.g. "9.00 KB")
 */
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

// Audit ratio rounded to one decimal, always showing that digit (e.g. "2.4").
export function formatRatio(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '-';
  return (Math.round(value * 10) / 10).toFixed(1);
}

// Last segment of a project path, used as the project's display name.
export function projectName(path) {
  if (typeof path !== 'string' || path === '') return undefined;
  const segments = path.split('/');
  return segments[segments.length - 1];
}

// Replace missing or empty values with a dash so the UI never renders blanks.
export function safeValue(value) {
  if (value === undefined || value === null) return '-';
  if (typeof value === 'number' && !Number.isFinite(value)) return '-';
  if (typeof value === 'string' && value.trim() === '') return '-';
  return value;
}