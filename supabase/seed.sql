-- =============================================================================
-- Sample World Cup 2026 matches. Run after schema.sql.
-- Kickoff times are illustrative (UTC). One row is set in the PAST so you can test
-- the "locked after kickoff" path, and one is already finished to test scoring.
-- =============================================================================

insert into public.matches (stage, home_team, away_team, home_flag, away_flag, kickoff, home_score, away_score, status) values
  ('Group A', 'Mexico',     'Canada',      '🇲🇽','🇨🇦', '2026-06-11 18:00+00', null, null, 'scheduled'),
  ('Group A', 'USA',        'Uruguay',     '🇺🇸','🇺🇾', '2026-06-11 21:00+00', null, null, 'scheduled'),
  ('Group B', 'Brazil',     'Serbia',      '🇧🇷','🇷🇸', '2026-06-12 18:00+00', null, null, 'scheduled'),
  ('Group B', 'Argentina',  'Croatia',     '🇦🇷','🇭🇷', '2026-06-12 21:00+00', null, null, 'scheduled'),
  ('Group C', 'England',    'Netherlands', '🏴󠁧󠁢󠁥󠁮󠁧󠁿','🇳🇱', '2026-06-13 18:00+00', null, null, 'scheduled'),
  ('Group C', 'France',     'Germany',     '🇫🇷','🇩🇪', '2026-06-13 21:00+00', null, null, 'scheduled'),
  ('Group D', 'Spain',      'Portugal',    '🇪🇸','🇵🇹', '2026-06-14 18:00+00', null, null, 'scheduled'),
  ('Group D', 'Belgium',    'Japan',       '🇧🇪','🇯🇵', '2026-06-14 21:00+00', null, null, 'scheduled'),
  -- a match already kicked off (for lock testing) — kickoff yesterday, no result yet
  ('Group E', 'Morocco',    'Senegal',     '🇲🇦','🇸🇳', '2026-06-09 18:00+00', null, null, 'scheduled'),
  -- a finished match (for scoring testing)
  ('Group E', 'Italy',      'Colombia',    '🇮🇹','🇨🇴', '2026-06-08 18:00+00', 2,    1,    'finished');
