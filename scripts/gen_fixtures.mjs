// Dev-only generator (NOT bundled into the app). Produces supabase/seed.sql:
//   48 teams in 12 groups · 72 group matches (exact real fixtures) · 32 knockout placeholders.
// Run:  node scripts/gen_fixtures.mjs
//
// Kickoff times are interpreted as MOSCOW time (UTC+3) and stored with an explicit +03:00
// offset; the app renders them in device-local time. Knockout rounds use clean structural
// placeholders only (Winner Group A / Runner-up Group A / 3rd Place N / Winner R32-1 …).

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, '..', 'supabase', 'seed.sql');
const TZ = '+03:00';

// ---- flags ----
const FLAG = {
  Mexico: '🇲🇽', 'South Africa': '🇿🇦', 'South Korea': '🇰🇷', Czechia: '🇨🇿',
  Canada: '🇨🇦', 'Bosnia & Herzegovina': '🇧🇦', Qatar: '🇶🇦', Switzerland: '🇨🇭',
  Brazil: '🇧🇷', Morocco: '🇲🇦', Haiti: '🇭🇹', Scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  USA: '🇺🇸', Paraguay: '🇵🇾', Australia: '🇦🇺', Turkey: '🇹🇷',
  Germany: '🇩🇪', Curacao: '🇨🇼', 'Ivory Coast': '🇨🇮', Ecuador: '🇪🇨',
  Netherlands: '🇳🇱', Japan: '🇯🇵', Sweden: '🇸🇪', Tunisia: '🇹🇳',
  Belgium: '🇧🇪', Egypt: '🇪🇬', Iran: '🇮🇷', 'New Zealand': '🇳🇿',
  Spain: '🇪🇸', 'Cape Verde': '🇨🇻', 'Saudi Arabia': '🇸🇦', Uruguay: '🇺🇾',
  France: '🇫🇷', Senegal: '🇸🇳', Iraq: '🇮🇶', Norway: '🇳🇴',
  Argentina: '🇦🇷', Algeria: '🇩🇿', Austria: '🇦🇹', Jordan: '🇯🇴',
  Portugal: '🇵🇹', 'DR Congo': '🇨🇩', Uzbekistan: '🇺🇿', Colombia: '🇨🇴',
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', Croatia: '🇭🇷', Ghana: '🇬🇭', Panama: '🇵🇦',
};

// ---- groups: team list (order = group table order) + exact fixtures [home, away, 'YYYY-MM-DDTHH:MM'] ----
const GROUPS = {
  A: {
    teams: ['Mexico', 'South Africa', 'South Korea', 'Czechia'],
    matches: [
      ['Mexico', 'South Africa', '2026-06-11T22:00'],
      ['South Korea', 'Czechia', '2026-06-12T05:00'],
      ['Czechia', 'South Africa', '2026-06-18T19:00'],
      ['Mexico', 'South Korea', '2026-06-19T04:00'],
      ['Mexico', 'Czechia', '2026-06-25T04:00'],
      ['South Africa', 'South Korea', '2026-06-25T04:00'],
    ],
  },
  B: {
    teams: ['Canada', 'Bosnia & Herzegovina', 'Qatar', 'Switzerland'],
    matches: [
      ['Canada', 'Bosnia & Herzegovina', '2026-06-12T22:00'],
      ['Qatar', 'Switzerland', '2026-06-13T22:00'],
      ['Switzerland', 'Bosnia & Herzegovina', '2026-06-18T22:00'],
      ['Canada', 'Qatar', '2026-06-19T01:00'],
      ['Canada', 'Switzerland', '2026-06-24T22:00'],
      ['Bosnia & Herzegovina', 'Qatar', '2026-06-24T22:00'],
    ],
  },
  C: {
    teams: ['Brazil', 'Morocco', 'Haiti', 'Scotland'],
    matches: [
      ['Brazil', 'Morocco', '2026-06-14T01:00'],
      ['Haiti', 'Scotland', '2026-06-14T04:00'],
      ['Scotland', 'Morocco', '2026-06-20T01:00'],
      ['Brazil', 'Haiti', '2026-06-20T03:30'],
      ['Morocco', 'Haiti', '2026-06-25T01:00'],
      ['Scotland', 'Brazil', '2026-06-25T01:00'],
    ],
  },
  D: {
    teams: ['USA', 'Paraguay', 'Australia', 'Turkey'],
    matches: [
      ['USA', 'Paraguay', '2026-06-13T04:00'],
      ['Australia', 'Turkey', '2026-06-14T07:00'],
      ['USA', 'Australia', '2026-06-19T22:00'],
      ['Turkey', 'Paraguay', '2026-06-20T06:00'],
      ['USA', 'Turkey', '2026-06-26T05:00'],
      ['Paraguay', 'Australia', '2026-06-26T05:00'],
    ],
  },
  E: {
    teams: ['Germany', 'Curacao', 'Ivory Coast', 'Ecuador'],
    matches: [
      ['Germany', 'Curacao', '2026-06-14T20:00'],
      ['Ivory Coast', 'Ecuador', '2026-06-15T02:00'],
      ['Germany', 'Ivory Coast', '2026-06-20T23:00'],
      ['Ecuador', 'Curacao', '2026-06-21T03:00'],
      ['Ecuador', 'Germany', '2026-06-25T23:00'],
      ['Curacao', 'Ivory Coast', '2026-06-25T23:00'],
    ],
  },
  F: {
    teams: ['Netherlands', 'Japan', 'Sweden', 'Tunisia'],
    matches: [
      ['Netherlands', 'Japan', '2026-06-14T23:00'],
      ['Sweden', 'Tunisia', '2026-06-15T05:00'],
      ['Netherlands', 'Sweden', '2026-06-20T20:00'],
      ['Tunisia', 'Japan', '2026-06-21T07:00'],
      ['Tunisia', 'Netherlands', '2026-06-26T02:00'],
      ['Japan', 'Sweden', '2026-06-26T02:00'],
    ],
  },
  G: {
    teams: ['Belgium', 'Egypt', 'Iran', 'New Zealand'],
    matches: [
      ['Belgium', 'Egypt', '2026-06-15T22:00'],
      ['Iran', 'New Zealand', '2026-06-16T04:00'],
      ['Belgium', 'Iran', '2026-06-21T22:00'],
      ['New Zealand', 'Egypt', '2026-06-22T04:00'],
      ['New Zealand', 'Belgium', '2026-06-27T06:00'],
      ['Egypt', 'Iran', '2026-06-27T06:00'],
    ],
  },
  H: {
    teams: ['Spain', 'Cape Verde', 'Saudi Arabia', 'Uruguay'],
    matches: [
      ['Spain', 'Cape Verde', '2026-06-15T19:00'],
      ['Saudi Arabia', 'Uruguay', '2026-06-16T01:00'],
      ['Spain', 'Saudi Arabia', '2026-06-21T19:00'],
      ['Uruguay', 'Cape Verde', '2026-06-22T01:00'],
      ['Uruguay', 'Spain', '2026-06-27T03:00'],
      ['Cape Verde', 'Saudi Arabia', '2026-06-27T03:00'],
    ],
  },
  I: {
    teams: ['France', 'Senegal', 'Iraq', 'Norway'],
    matches: [
      ['France', 'Senegal', '2026-06-16T22:00'],
      ['Iraq', 'Norway', '2026-06-17T01:00'],
      ['France', 'Iraq', '2026-06-23T00:00'],
      ['Norway', 'Senegal', '2026-06-23T03:00'],
      ['Norway', 'France', '2026-06-26T22:00'],
      ['Senegal', 'Iraq', '2026-06-26T22:00'],
    ],
  },
  J: {
    teams: ['Argentina', 'Algeria', 'Austria', 'Jordan'],
    matches: [
      ['Argentina', 'Algeria', '2026-06-17T04:00'],
      ['Austria', 'Jordan', '2026-06-17T07:00'],
      ['Argentina', 'Austria', '2026-06-22T20:00'],
      ['Jordan', 'Algeria', '2026-06-23T06:00'],
      ['Algeria', 'Austria', '2026-06-28T05:00'],
      ['Jordan', 'Argentina', '2026-06-28T05:00'],
    ],
  },
  K: {
    teams: ['Portugal', 'DR Congo', 'Uzbekistan', 'Colombia'],
    matches: [
      ['Portugal', 'DR Congo', '2026-06-17T20:00'],
      ['Uzbekistan', 'Colombia', '2026-06-18T05:00'],
      ['Portugal', 'Uzbekistan', '2026-06-23T20:00'],
      ['Colombia', 'DR Congo', '2026-06-24T05:00'],
      ['Colombia', 'Portugal', '2026-06-28T02:30'],
      ['DR Congo', 'Uzbekistan', '2026-06-28T02:30'],
    ],
  },
  L: {
    teams: ['England', 'Croatia', 'Ghana', 'Panama'],
    matches: [
      ['England', 'Croatia', '2026-06-17T23:00'],
      ['Ghana', 'Panama', '2026-06-18T02:00'],
      ['England', 'Ghana', '2026-06-23T23:00'],
      ['Panama', 'Croatia', '2026-06-24T02:00'],
      ['Panama', 'England', '2026-06-28T00:00'],
      ['Croatia', 'Ghana', '2026-06-28T00:00'],
    ],
  },
};

const esc = (s) => s.replace(/'/g, "''");
const flag = (name) => FLAG[name] ?? '';
const ts = (dt) => `${dt}:00${TZ}`;

const rows = [];
const push = (stage, code, order, group, home, away, kickoff) =>
  rows.push({ stage, code, order, group, home, away, kickoff });

// ---- group matches ----
for (const [g, { matches }] of Object.entries(GROUPS)) {
  for (const [home, away, dt] of matches) {
    push(`Group ${g}`, 'group', 1, g, home, away, ts(dt));
  }
}

// ---- knockout placeholders (clean structural names only) ----
const W = (g) => `Winner Group ${g}`;
const R = (g) => `Runner-up Group ${g}`;
const T = (n) => `3rd Place ${n}`;
const L = 'ABCDEFGHIJKL'.split('');

// Round of 32 — 16 matches, each winner/runner-up/third used exactly once.
const r32 = [
  [W('A'), T(1)], [W('B'), T(2)], [W('C'), T(3)], [W('D'), T(4)],
  [W('E'), T(5)], [W('F'), T(6)], [W('G'), T(7)], [W('H'), T(8)],
  [W('I'), R('A')], [W('J'), R('B')], [W('K'), R('C')], [W('L'), R('D')],
  [R('E'), R('F')], [R('G'), R('H')], [R('I'), R('J')], [R('K'), R('L')],
];
const r32Dates = [ // 4/day, Jun 29 – Jul 2 (MSK)
  '2026-06-29T19:00', '2026-06-29T22:00', '2026-06-30T19:00', '2026-06-30T22:00',
  '2026-07-01T19:00', '2026-07-01T22:00', '2026-07-02T19:00', '2026-07-02T22:00',
  '2026-07-03T19:00', '2026-07-03T22:00', '2026-07-04T19:00', '2026-07-04T22:00',
  '2026-07-05T19:00', '2026-07-05T22:00', '2026-07-06T19:00', '2026-07-06T22:00',
];
r32.forEach(([h, a], i) => push('Round of 32', 'r32', 2, null, h, a, ts(r32Dates[i])));

// helper for later rounds: pairs winners of the previous round.
function winnerRound(stage, code, order, prevLabel, prevCount, dates) {
  const n = prevCount / 2;
  for (let i = 0; i < n; i++) {
    push(stage, code, order, null,
      `Winner ${prevLabel}-${i * 2 + 1}`, `Winner ${prevLabel}-${i * 2 + 2}`, ts(dates[i]));
  }
}

winnerRound('Round of 16', 'r16', 3, 'R32', 16, [
  '2026-07-08T19:00', '2026-07-08T22:00', '2026-07-09T19:00', '2026-07-09T22:00',
  '2026-07-10T19:00', '2026-07-10T22:00', '2026-07-11T19:00', '2026-07-11T22:00',
]);
winnerRound('Quarter-final', 'qf', 4, 'R16', 8, [
  '2026-07-14T19:00', '2026-07-14T22:00', '2026-07-15T19:00', '2026-07-15T22:00',
]);
winnerRound('Semi-final', 'sf', 5, 'QF', 4, ['2026-07-18T22:00', '2026-07-19T22:00']);

push('Third place', 'third', 6, null, 'Loser SF-1', 'Loser SF-2', ts('2026-07-22T19:00'));
push('Final', 'final', 7, null, 'Winner SF-1', 'Winner SF-2', ts('2026-07-23T19:00'));

// ---- emit SQL ----
const teamRows = [];
for (const [g, { teams }] of Object.entries(GROUPS)) {
  for (const name of teams) teamRows.push(`  ('${esc(name)}', '${flag(name)}', '${g}')`);
}

const matchRows = rows.map((m) =>
  `  ('${esc(m.stage)}', '${m.code}', ${m.order}, ${m.group ? `'${m.group}'` : 'null'}, ` +
  `'${esc(m.home)}', '${esc(m.away)}', '${flag(m.home)}', '${flag(m.away)}', '${m.kickoff}', null, null, 'scheduled')`
);

const sql = `-- =============================================================================
-- World Cup 2026 fixtures — GENERATED by scripts/gen_fixtures.mjs. Do not edit by hand.
-- Run after the migrations. REPLACES all matches and teams (predictions on old matches
-- cascade away; leagues and accounts are untouched). Schema/triggers/scoring unchanged.
--
-- Kickoff times are stored as Moscow time (UTC+3) via the +03:00 offset; the app renders
-- them in device-local time. Knockout rounds use structural placeholders only.
-- =============================================================================

delete from public.matches;
delete from public.teams;

insert into public.teams (name, flag, group_label) values
${teamRows.join(',\n')};

insert into public.matches
  (stage, stage_code, stage_order, group_label, home_team, away_team, home_flag, away_flag, kickoff, home_score, away_score, status) values
${matchRows.join(',\n')};
`;

writeFileSync(OUT, sql, 'utf8');
console.log(`Wrote ${rows.length} matches + ${teamRows.length} teams → ${OUT}`);
