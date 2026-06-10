import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Share, StyleSheet, Text, View } from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useAuth } from '../../../lib/auth';
import { supabase } from '../../../lib/supabase';
import { theme } from '../../../lib/theme';
import { LeaderboardRow, League, Match, Prediction } from '../../../lib/types';
import { MatchRow } from '../../../components/MatchRow';
import { Segmented } from '../../../components/Segmented';
import { EmptyState } from '../../../components/EmptyState';

export default function LeagueScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useAuth();
  const [tab, setTab] = useState('Matches');
  const [league, setLeague] = useState<League | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [preds, setPreds] = useState<Record<string, Prediction>>({});
  const [board, setBoard] = useState<LeaderboardRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setRefreshing(true);
    const uid = session?.user.id;

    const [leagueRes, matchRes, predRes, boardRes] = await Promise.all([
      supabase.from('leagues').select('*').eq('id', id).single(),
      supabase.from('matches').select('*').order('kickoff', { ascending: true }),
      supabase.from('predictions').select('*').eq('user_id', uid),
      supabase.rpc('get_leaderboard', { p_league_id: id }),
    ]);

    if (leagueRes.data) setLeague(leagueRes.data as League);
    if (matchRes.data) setMatches(matchRes.data as Match[]);
    if (predRes.data) {
      const map: Record<string, Prediction> = {};
      for (const p of predRes.data as Prediction[]) map[p.match_id] = p;
      setPreds(map);
    }
    if (boardRes.data) setBoard(boardRes.data as LeaderboardRow[]);
    setRefreshing(false);
  }, [id, session]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function shareInvite() {
    if (!league) return;
    const link = Linking.createURL('join', { queryParams: { code: league.invite_code } });
    await Share.share({
      message: `Join my World Cup league "${league.name}"!\nTap: ${link}\nor enter code: ${league.invite_code}`,
    });
  }

  return (
    <View style={styles.wrap}>
      <Stack.Screen
        options={{
          title: league?.name ?? 'League',
          headerRight: () => (
            <Pressable onPress={shareInvite} hitSlop={12}>
              <Text style={styles.share}>Share</Text>
            </Pressable>
          ),
        }}
      />

      <View style={styles.tabs}>
        <Segmented options={['Matches', 'Leaderboard']} value={tab} onChange={setTab} />
      </View>

      {tab === 'Matches' ? (
        <FlatList
          data={matches}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={theme.color.primary} />}
          ListEmptyComponent={<EmptyState emoji="📅" title="No matches yet" subtitle="They'll appear here soon." />}
          renderItem={({ item }) => (
            <MatchRow
              match={item}
              prediction={preds[item.id]}
              onPress={() => router.push({ pathname: '/(app)/match/[id]', params: { id: item.id } })}
            />
          )}
        />
      ) : (
        <FlatList
          data={board}
          keyExtractor={(r) => r.user_id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={theme.color.primary} />}
          ListHeaderComponent={
            <View style={styles.boardHead}>
              <Text style={[styles.hCell, { width: 36 }]}>#</Text>
              <Text style={[styles.hCell, { flex: 1 }]}>Player</Text>
              <Text style={[styles.hCell, styles.num]}>Pts</Text>
              <Text style={[styles.hCell, styles.num]}>Exact</Text>
              <Text style={[styles.hCell, styles.num]}>Played</Text>
            </View>
          }
          ListEmptyComponent={<EmptyState emoji="📊" title="No standings yet" subtitle="Points appear after matches finish." />}
          renderItem={({ item, index }) => {
            const me = item.user_id === session?.user.id;
            return (
              <View style={[styles.boardRow, me && styles.boardRowMe]}>
                <Text style={[styles.cell, { width: 36 }, index < 3 && styles.medal]}>{index + 1}</Text>
                <Text style={[styles.cell, { flex: 1, fontWeight: me ? '800' : '600' }]} numberOfLines={1}>
                  {item.username}{me ? ' (you)' : ''}
                </Text>
                <Text style={[styles.cell, styles.num, styles.points]}>{item.total_points}</Text>
                <Text style={[styles.cell, styles.num]}>{item.exact_count}</Text>
                <Text style={[styles.cell, styles.num]}>{item.played}</Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.color.bg },
  share: { color: theme.color.accent, fontWeight: '700', fontSize: theme.font.body },
  tabs: { padding: 16, paddingBottom: 8 },
  list: { padding: 16, paddingTop: 8, gap: 10 },
  boardHead: { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 6 },
  hCell: { color: theme.color.muted, fontSize: theme.font.small, fontWeight: '700' },
  boardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  boardRowMe: { borderColor: theme.color.primary },
  cell: { color: theme.color.text, fontSize: theme.font.body },
  num: { width: 56, textAlign: 'center' },
  medal: { color: theme.color.accent, fontWeight: '800' },
  points: { color: theme.color.accent, fontWeight: '800' },
});
