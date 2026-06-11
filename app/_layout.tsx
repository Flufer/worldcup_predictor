import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../lib/auth';
import { theme } from '../lib/theme';

function RootNavigator() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';
    if (!session && !inAuthGroup) {
      // Not logged in and outside the auth group (e.g. the index splash) → go to login.
      router.replace('/(auth)/login');
    } else if (session && !inAppGroup) {
      // Logged in but not yet inside the app group (index splash or auth screen) → go to app.
      // NOTE: must be `!inAppGroup`, not `inAuthGroup` — otherwise an authenticated user
      // landing on `index` matches neither branch and is stuck on the splash spinner forever.
      router.replace('/(app)/leagues');
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.color.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.color.primary} size="large" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.color.bg },
        headerTintColor: theme.color.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: theme.color.bg },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
      <Stack.Screen name="(app)/leagues" options={{ title: 'Your Leagues' }} />
      <Stack.Screen name="(app)/create-league" options={{ title: 'Create League', presentation: 'modal' }} />
      <Stack.Screen name="(app)/join" options={{ title: 'Join League', presentation: 'modal' }} />
      <Stack.Screen name="(app)/league/[id]" options={{ title: 'League' }} />
      <Stack.Screen name="(app)/match/[id]" options={{ title: 'Prediction', presentation: 'modal' }} />
      <Stack.Screen name="(app)/admin" options={{ title: 'Admin · Results' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
