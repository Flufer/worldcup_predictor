// Database row types (mirror supabase/schema.sql).

export type Profile = {
  id: string;
  username: string;
  is_admin: boolean;
  created_at: string;
};

export type League = {
  id: string;
  name: string;
  invite_code: string;
  owner_id: string;
  created_at: string;
};

export type MatchStatus = 'scheduled' | 'finished';

// Machine stage codes (mirror matches.stage_code). 'group' covers all 12 groups.
export type StageCode = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'third' | 'final';

export type Match = {
  id: string;
  stage: string; // display label, e.g. "Group A" / "Round of 16"
  stage_code: StageCode;
  stage_order: number; // 1..7 for sorting
  group_label: string | null; // 'A'..'L' for group matches, null for knockout
  home_team: string;
  away_team: string;
  home_flag: string;
  away_flag: string;
  kickoff: string; // ISO timestamptz
  home_score: number | null;
  away_score: number | null;
  status: MatchStatus;
};

export type Team = {
  id: string;
  name: string;
  flag: string;
  group_label: string | null; // 'A'..'L'
  fifa_code?: string | null;
};

export type Prediction = {
  id: string;
  user_id: string;
  match_id: string;
  home_pred: number;
  away_pred: number;
  points: number | null;
  updated_at: string;
};

export type LeaderboardRow = {
  user_id: string;
  username: string;
  total_points: number;
  exact_count: number;
  played: number;
};

// League joined with the current user's member count (computed client-side helper shape).
export type LeagueWithMeta = League & { member_count: number };
