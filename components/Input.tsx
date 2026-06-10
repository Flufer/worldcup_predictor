import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { theme } from '../lib/theme';

export function Input({
  label,
  error,
  ...props
}: TextInputProps & { label?: string; error?: string }) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={theme.color.muted}
        style={[styles.input, !!error && styles.inputError]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { color: theme.color.muted, fontSize: theme.font.small, fontWeight: '600' },
  input: {
    height: 52,
    borderRadius: theme.radius.md,
    backgroundColor: theme.color.surface,
    borderWidth: 1,
    borderColor: theme.color.border,
    paddingHorizontal: 16,
    color: theme.color.text,
    fontSize: theme.font.body,
  },
  inputError: { borderColor: theme.color.danger },
  error: { color: theme.color.danger, fontSize: theme.font.small },
});
