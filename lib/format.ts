import { Match } from './types';

export function isLocked(match: Match): boolean {
  return new Date(match.kickoff).getTime() <= Date.now();
}

// Local-time kickoff label, e.g. "Thu 11 Jun, 21:00".
export function kickoffLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function statusLabel(match: Match): string {
  if (match.status === 'finished') return 'Finished';
  return isLocked(match) ? 'Live / locked' : 'Upcoming';
}
