import { ActivityIndicator, View } from 'react-native';
import { theme } from '../lib/theme';

// Splash placeholder. The real redirect happens in app/_layout.tsx based on session.
export default function Index() {
  return (
    <View style={{ flex: 1, backgroundColor: theme.color.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={theme.color.primary} size="large" />
    </View>
  );
}
