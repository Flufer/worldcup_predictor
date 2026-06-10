// DISPLAY ONLY. The trusted point math lives in supabase/schema.sql (calc_points).
// This mirror is used to show a friendly label after a match finishes.

export function pointsLabel(points: number | null): string {
  switch (points) {
    case 5:
      return 'Exact score · +5';
    case 3:
      return 'Result + goal diff · +3';
    case 2:
      return 'Correct result · +2';
    case 0:
      return 'Wrong · +0';
    default:
      return '';
  }
}

export const SCORING_RULES = [
  { points: 5, label: 'Exact score' },
  { points: 3, label: 'Correct result + goal difference' },
  { points: 2, label: 'Correct result' },
  { points: 0, label: 'Wrong' },
];
