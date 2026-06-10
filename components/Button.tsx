import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { theme } from '../lib/theme';

type Variant = 'primary' | 'secondary' | 'danger';

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.danger,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? theme.color.text : '#06210F'} />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'secondary' && { color: theme.color.text },
            variant === 'danger' && { color: '#fff' },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primary: { backgroundColor: theme.color.primary },
  secondary: { backgroundColor: theme.color.surfaceAlt, borderWidth: 1, borderColor: theme.color.border },
  danger: { backgroundColor: theme.color.danger },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  text: { color: '#06210F', fontSize: theme.font.body, fontWeight: '700' },
});
