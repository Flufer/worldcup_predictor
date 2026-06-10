import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../lib/theme';

export function Segmented({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.wrap}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.item, active && styles.itemActive]}
          >
            <Text style={[styles.text, active && styles.textActive]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    padding: 4,
    gap: 4,
  },
  item: { flex: 1, height: 40, borderRadius: theme.radius.sm, alignItems: 'center', justifyContent: 'center' },
  itemActive: { backgroundColor: theme.color.primary },
  text: { color: theme.color.muted, fontWeight: '700', fontSize: theme.font.body },
  textActive: { color: '#06210F' },
});
