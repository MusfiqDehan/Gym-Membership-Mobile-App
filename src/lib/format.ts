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

function parseTimeParts(value: string): { hour: number; minute: number } | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  return { hour, minute };
}

/** Format backend HH:mm or HH:mm:ss values as 12-hour clock, e.g. "6:30 PM". */
export function formatTime(value?: string | null): string {
  if (!value) {
    return '';
  }

  const parsed = parseTimeParts(value);
  if (!parsed) {
    return value;
  }

  const date = new Date(2000, 0, 1, parsed.hour, parsed.minute);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function timeRange(start?: string | null, end?: string | null): string {
  const s = formatTime(start);
  const e = formatTime(end);
  if (s && e) {
    return `${s} – ${e}`;
  }
  return s || e || '';
}
