import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../lib/theme';

export function ScoreStepper({
  label,
  flag,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  flag: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const dec = () => onChange(Math.max(0, value - 1));
  const inc = () => onChange(Math.min(99, value + 1));

  return (
    <View style={styles.wrap}>
      <Text style={styles.team} numberOfLines={1}>
        {flag} {label}
      </Text>
      <View style={styles.row}>
        <Pressable
          onPress={dec}
          disabled={disabled}
          style={({ pressed }) => [styles.btn, disabled && styles.btnDisabled, pressed && styles.pressed]}
        >
          <Text style={styles.btnText}>−</Text>
        </Pressable>
        <Text style={styles.value}>{value}</Text>
        <Pressable
          onPress={inc}
          disabled={disabled}
          style={({ pressed }) => [styles.btn, disabled && styles.btnDisabled, pressed && styles.pressed]}
        >
          <Text style={styles.btnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 12, flex: 1 },
  team: { color: theme.color.text, fontSize: theme.font.h3, fontWeight: '700', textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btn: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.color.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  pressed: { opacity: 0.7 },
  btnText: { color: theme.color.text, fontSize: 24, fontWeight: '700' },
  value: { color: theme.color.accent, fontSize: 34, fontWeight: '800', minWidth: 36, textAlign: 'center' },
});
