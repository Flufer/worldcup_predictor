import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../lib/theme';

export function EmptyState({
  emoji,
  title,
  subtitle,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 },
  emoji: { fontSize: 44 },
  title: { color: theme.color.text, fontSize: theme.font.h3, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: theme.color.muted, fontSize: theme.font.body, textAlign: 'center' },
});
