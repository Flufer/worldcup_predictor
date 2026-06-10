// Database row types (mirror supabase/schema.sql).

export type Profile = {
  id: string;
  username: string;
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

export type Match = {
  id: string;
  stage: string;
  home_team: string;
  away_team: string;
  home_flag: string;
  away_flag: string;
  kickoff: string; // ISO timestamptz
  home_score: number | null;
  away_score: number | null;
  status: MatchStatus;
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
