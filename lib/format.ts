import { Match, StageCode } from './types';

// Tournament stages in order. `code` mirrors matches.stage_code; `name` is the short
// chip label. Used by the stage filter and the bracket sections.
export const STAGES: { code: StageCode; name: string }[] = [
  { code: 'group', name: 'Groups' },
  { code: 'r32', name: 'R32' },
  { code: 'r16', name: 'R16' },
  { code: 'qf', name: 'QF' },
  { code: 'sf', name: 'SF' },
  { code: 'third', name: '3rd' },
  { code: 'final', name: 'Final' },
];

// Knockout stages only (group stage excluded), for the bracket view.
export const KNOCKOUT_STAGES = STAGES.filter((s) => s.code !== 'group');

export function stageName(code: StageCode): string {
  return STAGES.find((s) => s.code === code)?.name ?? code;
}

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
