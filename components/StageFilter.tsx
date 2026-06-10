import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { theme } from '../lib/theme';
import { STAGES } from '../lib/format';

export const ALL_STAGES = 'all';

// Horizontal scrollable chip row: "All" + each tournament stage.
// `value` is 'all' or a StageCode. Used on the Matches and Leaderboard tabs.
export function StageFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const chips = [{ code: ALL_STAGES, name: 'All' }, ...STAGES];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.bar}
      contentContainerStyle={styles.row}
    >
      {chips.map((c) => {
        const active = c.code === value;
        return (
          <Pressable
            key={c.code}
            onPress={() => onChange(c.code)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.text, active && styles.textActive]}>{c.name}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // A horizontal ScrollView in a flex column otherwise stretches to fill the
  // remaining vertical space; flexGrow:0 pins it to its content height.
  bar: { flexGrow: 0 },
  row: { gap: 8, paddingHorizontal: 16, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.color.surface,
    borderWidth: 1,
    borderColor: theme.color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: theme.color.primary, borderColor: theme.color.primary },
  text: { color: theme.color.muted, fontWeight: '700', fontSize: theme.font.small },
  textActive: { color: '#06210F' },
});
