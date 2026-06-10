import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { theme } from '../../lib/theme';
import { Match } from '../../lib/types';
import { kickoffLabel, statusLabel } from '../../lib/format';
import { useIsAdmin } from '../../lib/useIsAdmin';
import { useMatchesRealtime } from '../../lib/useMatchesRealtime';
import { Button } from '../../components/Button';
import { ScoreStepper } from '../../components/ScoreStepper';
import { EmptyState } from '../../components/EmptyState';
import { StageFilter, ALL_STAGES } from '../../components/StageFilter';

// Admin-only screen: enter / correct final match results. Every write goes through the
// set_result RPC (the single ingestion choke-point), which enforces is_admin server-side
// and fires the scoring trigger + realtime fan-out.
export default function AdminScreen() {
  const isAdmin = useIsAdmin();
  const insets = useSafeAreaInsets();
  const [matches, setMatches] = useState<Match[]>([]);
  const [stage, setStage] = useState<string>(ALL_STAGES);
  const [selected, setSelected] = useState<Match | null>(null);
  const [home, setHome] = useState(0);
  const [away, setAway] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('matches')
      .select('*')
      .order('stage_order', { ascending: true })
      .order('kickoff', { ascending: true });
    if (data) setMatches(data as Match[]);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  useMatchesRealtime(load);

  function pick(m: Match) {
    setSelected(m);
    setHome(m.home_score ?? 0);
    setAway(m.away_score ?? 0);
    setError(null);
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase.rpc('set_result', {
        p_match_id: selected.id,
        p_home: home,
        p_away: away,
      });
      if (error) throw error;
      setSelected(null);
      await load();
    } catch (e: any) {
      setError(
        e?.code === '42501' || e?.message?.includes('Not authorized')
          ? 'Not authorized — your account is not an admin.'
          : (e?.message ?? 'Could not save result.')
      );
    } finally {
      setSaving(false);
    }
  }

  if (!isAdmin) {
    return (
      <View style={styles.wrap}>
        <EmptyState emoji="🔒" title="Admins only" subtitle="Your account doesn't have result-entry access." />
      </View>
    );
  }

  const filtered = stage === ALL_STAGES ? matches : matches.filter((m) => m.stage_code === stage);

  return (
    <View style={styles.wrap}>
      {selected && (
        <View style={styles.editor}>
          <Text style={styles.editorStage}>{selected.stage}</Text>
          <View style={styles.steppers}>
            <ScoreStepper label={selected.home_team} flag={selected.home_flag} value={home} onChange={setHome} />
            <View style={styles.sep}><Text style={styles.dash}>–</Text></View>
            <ScoreStepper label={selected.away_team} flag={selected.away_flag} value={away} onChange={setAway} />
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <Button title="Cancel" variant="secondary" onPress={() => setSelected(null)} style={styles.action} />
            <Button title={saving ? 'Saving…' : 'Save result'} onPress={save} loading={saving} style={styles.action} />
          </View>
        </View>
      )}

      <StageFilter value={stage} onChange={setStage} />

      <FlatList
        data={filtered}
        keyExtractor={(m) => m.id}
        style={styles.fill}
        contentContainerStyle={[styles.list, { flexGrow: 1, paddingBottom: insets.bottom + 80 }]}
        ListEmptyComponent={<EmptyState emoji="📅" title="No matches" subtitle="Run the seed to load fixtures." />}
        renderItem={({ item }) => {
          const finished = item.status === 'finished';
          const active = selected?.id === item.id;
          return (
            <Pressable
              onPress={() => pick(item)}
              style={[styles.row, active && styles.rowActive]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.teams} numberOfLines={1}>
                  {item.home_flag} {item.home_team} vs {item.away_team} {item.away_flag}
                </Text>
                <Text style={styles.meta}>{item.stage} · {kickoffLabel(item.kickoff)}</Text>
              </View>
              <View style={styles.rightCol}>
                <Text style={[styles.score, finished && styles.scoreFinished]}>
                  {finished ? `${item.home_score}–${item.away_score}` : '—'}
                </Text>
                <Text style={styles.status}>{statusLabel(item)}</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.color.bg },
  fill: { flex: 1 },
  list: { padding: 16, paddingTop: 8, gap: 10 },
  editor: {
    backgroundColor: theme.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
    padding: 16,
    gap: 12,
  },
  editorStage: { color: theme.color.muted, fontSize: theme.font.small, fontWeight: '700', textAlign: 'center' },
  steppers: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sep: { width: 18, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6 },
  dash: { color: theme.color.muted, fontSize: 28, fontWeight: '800', textAlign: 'center', alignSelf: 'center' },
  actions: { flexDirection: 'row', gap: 12 },
  action: { flex: 1 },
  error: { color: theme.color.danger, fontSize: theme.font.small, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    padding: 14,
    gap: 12,
  },
  rowActive: { borderColor: theme.color.primary },
  teams: { color: theme.color.text, fontSize: theme.font.body, fontWeight: '700' },
  meta: { color: theme.color.muted, fontSize: theme.font.small, marginTop: 4 },
  rightCol: { alignItems: 'flex-end' },
  score: { color: theme.color.muted, fontSize: theme.font.h3, fontWeight: '800' },
  scoreFinished: { color: theme.color.accent },
  status: { color: theme.color.muted, fontSize: theme.font.small, marginTop: 2 },
});
