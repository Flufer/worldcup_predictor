import { useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { supabase } from '../../lib/supabase';
import { theme } from '../../lib/theme';
import { League } from '../../lib/types';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

export default function CreateLeague() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<League | null>(null);
  const [copied, setCopied] = useState(false);

  async function create() {
    setError(null);
    if (name.trim().length < 2) return setError('Give your league a name.');
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('create_league', { p_name: name });
      if (error) throw error;
      setCreated(data as League);
    } catch (e: any) {
      setError(e?.message ?? 'Could not create league.');
    } finally {
      setLoading(false);
    }
  }

  function inviteLink(code: string) {
    // Query-param form maps to the /join route which pre-fills the code.
    return Linking.createURL('join', { queryParams: { code } });
  }

  async function share() {
    if (!created) return;
    const link = inviteLink(created.invite_code);
    await Share.share({
      message: `Join my World Cup league "${created.name}"!\nTap: ${link}\nor enter code: ${created.invite_code}`,
    });
  }

  async function copy() {
    if (!created) return;
    await Clipboard.setStringAsync(created.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (created) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.bigEmoji}>🎉</Text>
        <Text style={styles.title}>"{created.name}" is live</Text>
        <Text style={styles.subtitle}>Share this code with friends so they can join.</Text>

        <View style={styles.codeBox}>
          <Text style={styles.code}>{created.invite_code}</Text>
        </View>

        <Button title="Share invite" onPress={share} />
        <Button title={copied ? 'Copied!' : 'Copy code'} variant="secondary" onPress={copy} />
        <Button
          title="Go to league"
          variant="secondary"
          onPress={() => router.replace({ pathname: '/(app)/league/[id]', params: { id: created.id } })}
        />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Input
        label="League name"
        value={name}
        onChangeText={setName}
        placeholder="The Office Cup"
        error={error ?? undefined}
        autoFocus
      />
      <Button title="Create" onPress={create} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.color.bg, padding: 24, gap: 16 },
  bigEmoji: { fontSize: 56, textAlign: 'center' },
  title: { color: theme.color.text, fontSize: theme.font.h2, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: theme.color.muted, fontSize: theme.font.body, textAlign: 'center', marginBottom: 8 },
  codeBox: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.accent,
    padding: 20,
    alignItems: 'center',
  },
  code: { color: theme.color.accent, fontSize: 40, fontWeight: '800', letterSpacing: 6 },
});
