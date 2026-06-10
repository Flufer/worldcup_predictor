import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../lib/auth';
import { supabase } from '../../../lib/supabase';
import { theme } from '../../../lib/theme';
import { Match, Prediction } from '../../../lib/types';
import { isLocked, kickoffLabel } from '../../../lib/format';
import { pointsLabel } from '../../../lib/scoring';
import { Button } from '../../../components/Button';
import { ScoreStepper } from '../../../components/ScoreStepper';

export default function MatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useAuth();
  const [match, setMatch] = useState<Match | null>(null);
  const [pred, setPred] = useState<Prediction | null>(null);
  const [home, setHome] = useState(0);
  const [away, setAway] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const uid = session?.user.id;
    const [matchRes, predRes] = await Promise.all([
      supabase.from('matches').select('*').eq('id', id).single(),
      supabase.from('predictions').select('*').eq('user_id', uid).eq('match_id', id).maybeSingle(),
    ]);
    if (matchRes.data) setMatch(matchRes.data as Match);
    if (predRes.data) {
      const p = predRes.data as Prediction;
      setPred(p);
      setHome(p.home_pred);
      setAway(p.away_pred);
    }
    setLoading(false);
  }, [id, session]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function save() {
    if (!match || !session) return;
    setError(null);
    setSaving(true);
    try {
      const { error } = await supabase.from('predictions').upsert(
        {
          user_id: session.user.id,
          match_id: match.id,
          home_pred: home,
          away_pred: away,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,match_id' }
      );
      if (error) throw error;
      setSaved(true);
      setTimeout(() => router.back(), 600);
    } catch (e: any) {
      // RLS rejects writes after kickoff — surface that clearly.
      setError(
        e?.message?.includes('row-level security') || e?.code === '42501'
          ? 'This match has kicked off — predictions are locked.'
          : (e?.message ?? 'Could not save.')
      );
      setSaving(false);
    }
  }

  if (loading || !match) {
    return (
      <View style={[styles.wrap, styles.center]}>
        <ActivityIndicator color={theme.color.primary} size="large" />
      </View>
    );
  }

  const locked = isLocked(match);
  const finished = match.status === 'finished';

  return (
    <View style={styles.wrap}>
      <Text style={styles.stage}>{match.stage}</Text>

      <View style={styles.steppers}>
        <ScoreStepper label={match.home_team} flag={match.home_flag} value={home} onChange={setHome} disabled={locked} />
        <View style={styles.sep}>
          <Text style={styles.dash}>–</Text>
        </View>
        <ScoreStepper label={match.away_team} flag={match.away_flag} value={away} onChange={setAway} disabled={locked} />
      </View>

      <View style={styles.statusBox}>
        {finished ? (
          <>
            <Text style={styles.statusMain}>
              Result: {match.home_score} – {match.away_score}
            </Text>
            {pred?.points != null && <Text style={styles.statusSub}>Your pick {pred.home_pred}–{pred.away_pred} · {pointsLabel(pred.points)}</Text>}
          </>
        ) : locked ? (
          <Text style={styles.statusMain}>🔒 Locked — kicked off</Text>
        ) : (
          <Text style={styles.statusSub}>Kickoff {kickoffLabel(match.kickoff)}</Text>
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!locked && (
        <Button
          title={saved ? 'Saved ✓' : pred ? 'Update prediction' : 'Save prediction'}
          onPress={save}
          loading={saving}
          disabled={saved}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.color.bg, padding: 24, gap: 24 },
  center: { alignItems: 'center', justifyContent: 'center' },
  stage: { color: theme.color.muted, fontSize: theme.font.body, fontWeight: '600', textAlign: 'center' },
  // Align to the bottom so the separator lines up with the +/- control rows (team
  // labels sit above them); fixed-width column keeps it from overlapping the buttons.
  steppers: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 12 },
  sep: { width: 18, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6 },
  dash: { color: theme.color.muted, fontSize: 28, fontWeight: '800', textAlign: 'center', alignSelf: 'center' },
  statusBox: { alignItems: 'center', gap: 4 },
  statusMain: { color: theme.color.text, fontSize: theme.font.h3, fontWeight: '700' },
  statusSub: { color: theme.color.muted, fontSize: theme.font.body },
  error: { color: theme.color.danger, fontSize: theme.font.small, textAlign: 'center' },
});
