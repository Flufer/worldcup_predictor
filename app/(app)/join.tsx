import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { theme } from '../../lib/theme';
import { League } from '../../lib/types';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

export default function Join() {
  const router = useRouter();
  // `code` arrives from a deep link: worldcup://join?code=ABC123
  const params = useLocalSearchParams<{ code?: string }>();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.code) setCode(String(params.code).toUpperCase());
  }, [params.code]);

  async function join() {
    setError(null);
    const clean = code.trim().toUpperCase();
    if (clean.length < 4) return setError('Enter the invite code.');
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('join_league', { code: clean });
      if (error) throw error;
      const league = data as League;
      router.replace({ pathname: '/(app)/league/[id]', params: { id: league.id } });
    } catch (e: any) {
      setError(e?.message?.includes('not found') ? 'No league with that code.' : (e?.message ?? 'Could not join.'));
      setLoading(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Join a league</Text>
      <Text style={styles.subtitle}>Paste the invite code a friend shared with you.</Text>
      <Input
        label="Invite code"
        value={code}
        onChangeText={(t) => setCode(t.toUpperCase())}
        placeholder="ABC123"
        autoCapitalize="characters"
        autoFocus
        error={error ?? undefined}
      />
      <Button title="Join" onPress={join} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.color.bg, padding: 24, gap: 16 },
  title: { color: theme.color.text, fontSize: theme.font.h2, fontWeight: '800' },
  subtitle: { color: theme.color.muted, fontSize: theme.font.body, marginBottom: 8 },
});
