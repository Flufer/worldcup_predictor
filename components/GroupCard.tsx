import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../lib/theme';
import { Team } from '../lib/types';

// One group: letter badge + its teams (flag + name). Placeholder teams (empty flag)
// render with a neutral dot so the row never looks broken.
export function GroupCard({ label, teams }: { label: string; teams: Team[] }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{label}</Text>
        </View>
        <Text style={styles.title}>Group {label}</Text>
      </View>
      {teams.map((t) => (
        <View key={t.id} style={styles.teamRow}>
          <Text style={styles.flag}>{t.flag || '•'}</Text>
          <Text style={styles.team} numberOfLines={1}>{t.name}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    padding: 14,
    gap: 8,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: theme.color.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#06210F', fontWeight: '800', fontSize: theme.font.small },
  title: { color: theme.color.muted, fontSize: theme.font.small, fontWeight: '700' },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flag: { fontSize: 20, width: 26 },
  team: { color: theme.color.text, fontSize: theme.font.body, fontWeight: '600', flex: 1 },
});
