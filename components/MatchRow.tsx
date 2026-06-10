import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../lib/theme';
import { Match, Prediction } from '../lib/types';
import { isLocked, kickoffLabel, statusLabel } from '../lib/format';

export function MatchRow({
  match,
  prediction,
  onPress,
}: {
  match: Match;
  prediction?: Prediction;
  onPress: () => void;
}) {
  const locked = isLocked(match);
  const finished = match.status === 'finished';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && { opacity: 0.8 }]}
    >
      <View style={styles.topRow}>
        <Text style={styles.stage}>{match.stage}</Text>
        <Text style={[styles.status, finished && { color: theme.color.muted }]}>
          {statusLabel(match)}
        </Text>
      </View>

      <View style={styles.teamsRow}>
        <Text style={styles.team} numberOfLines={1}>
          {match.home_flag} {match.home_team}
        </Text>
        <Text style={styles.score}>
          {finished ? `${match.home_score} – ${match.away_score}` : 'vs'}
        </Text>
        <Text style={[styles.team, styles.away]} numberOfLines={1}>
          {match.away_team} {match.away_flag}
        </Text>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.time}>{kickoffLabel(match.kickoff)}</Text>
        {prediction ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {locked ? '🔒 ' : ''}You: {prediction.home_pred}–{prediction.away_pred}
              {finished && prediction.points != null ? ` · +${prediction.points}` : ''}
            </Text>
          </View>
        ) : locked ? (
          <View style={[styles.badge, styles.badgeMuted]}>
            <Text style={[styles.badgeText, { color: theme.color.muted }]}>No pick</Text>
          </View>
        ) : (
          <View style={[styles.badge, styles.badgeOpen]}>
            <Text style={[styles.badgeText, { color: theme.color.accent }]}>Tap to predict</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    padding: 14,
    gap: 10,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stage: { color: theme.color.muted, fontSize: theme.font.small, fontWeight: '600' },
  status: { color: theme.color.primary, fontSize: theme.font.small, fontWeight: '700' },
  teamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  team: { color: theme.color.text, fontSize: theme.font.body, fontWeight: '700', flex: 1 },
  away: { textAlign: 'right' },
  score: { color: theme.color.accent, fontSize: theme.font.h3, fontWeight: '800', paddingHorizontal: 10 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time: { color: theme.color.muted, fontSize: theme.font.small },
  badge: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: theme.color.surfaceAlt,
  },
  badgeMuted: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.color.border },
  badgeOpen: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.color.accent },
  badgeText: { color: theme.color.text, fontSize: theme.font.small, fontWeight: '700' },
});
