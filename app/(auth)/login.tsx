import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { theme } from '../../lib/theme';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === 'signup';

  async function submit() {
    setError(null);
    if (!email.includes('@')) return setError('Enter a valid email.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (isSignup && username.trim().length < 2) return setError('Pick a username (2+ chars).');

    setLoading(true);
    try {
      if (isSignup) {
        await signUp(email, password, username);
      } else {
        await signIn(email, password);
      }
      // On success the root layout redirects automatically.
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.wrap, { paddingTop: insets.top + 60 }]} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>⚽️</Text>
        <Text style={styles.title}>WorldCup Predictor</Text>
        <Text style={styles.subtitle}>Predict scores. Beat your friends.</Text>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          {isSignup && (
            <Input
              label="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder="shown on the leaderboard"
            />
          )}
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title={isSignup ? 'Create account' : 'Sign in'} onPress={submit} loading={loading} />

          <Pressable onPress={() => { setMode(isSignup ? 'signin' : 'signup'); setError(null); }}>
            <Text style={styles.toggle}>
              {isSignup ? 'Have an account? ' : "New here? "}
              <Text style={styles.toggleAccent}>{isSignup ? 'Sign in' : 'Create one'}</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, paddingHorizontal: 24, backgroundColor: theme.color.bg, gap: 8 },
  logo: { fontSize: 56, textAlign: 'center' },
  title: { color: theme.color.text, fontSize: theme.font.h1, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: theme.color.muted, fontSize: theme.font.body, textAlign: 'center', marginBottom: 24 },
  form: { gap: 16 },
  error: { color: theme.color.danger, fontSize: theme.font.small },
  toggle: { color: theme.color.muted, textAlign: 'center', fontSize: theme.font.body, marginTop: 4 },
  toggleAccent: { color: theme.color.accent, fontWeight: '700' },
});
