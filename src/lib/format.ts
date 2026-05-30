/** Lightweight date/time formatting helpers (no extra deps). */

export function formatDate(value?: string | null): string {
  if (!value) {
    return '—';
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return value;
  }
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(value?: string | null): string {
  if (!value) {
    return '';
  }
  // Backend times come as HH:MM:SS; trim to HH:MM.
  const match = /^(\d{1,2}):(\d{2})/.exec(value);
  if (match) {
    return `${match[1].padStart(2, '0')}:${match[2]}`;
  }
  return value;
}

export function timeRange(start?: string | null, end?: string | null): string {
  const s = formatTime(start);
  const e = formatTime(end);
  if (s && e) {
    return `${s} – ${e}`;
  }
  return s || e || '';
}
