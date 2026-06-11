import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, SectionList, Share, StyleSheet, Text, View } from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { useAuth } from '../../../lib/auth';
import { supabase } from '../../../lib/supabase';
import { theme } from '../../../lib/theme';
import { LeaderboardRow, League, Match, Prediction, Team } from '../../../lib/types';
import { MatchRow } from '../../../components/MatchRow';
import { Segmented } from '../../../components/Segmented';
import { EmptyState } from '../../../components/EmptyState';
import { StageFilter, ALL_STAGES } from '../../../components/StageFilter';
import { TournamentView } from '../../../components/TournamentView';
import { useMatchesRealtime } from '../../../lib/useMatchesRealtime';

type BoardTab = 'All' | 'Groups' | 'Finals';
const KNOCKOUT_CODES = ['r32', 'r16', 'qf', 'sf', 'third', 'final'];

export default function LeagueScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const [tab, setTab] = useState('Matches');
  const [league, setLeague] = useState<League | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [preds, setPreds] = useState<Record<string, Prediction>>({});
  const [board, setBoard] = useState<LeaderboardRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [matchStage, setMatchStage] = useState<string>(ALL_STAGES);
  const [boardTab, setBoardTab] = useState<BoardTab>('All');

  const loadBoard = useCallback(
    async (mode: BoardTab) => {
      if (!id) return;
      if (mode === 'Finals') {
        // Backend RPC filters a single stage_code; sum all knockout stages on the client.
        const parts = await Promise.all(
          KNOCKOUT_CODES.map((code) =>
            supabase.rpc('get_leaderboard', { p_league_id: id, p_stage: code })
          )
        );
        const acc = new Map<string, LeaderboardRow>();
        for (const part of parts) {
          for (const row of (part.data ?? []) as LeaderboardRow[]) {
            const cur =
              acc.get(row.user_id) ??
              { user_id: row.user_id, username: row.username, total_points: 0, exact_count: 0, played: 0 };
            cur.total_points += Number(row.total_points);
            cur.exact_count += Number(row.exact_count);
            cur.played += Number(row.played);
            acc.set(row.user_id, cur);
          }
        }
        setBoard(
          [...acc.values()].sort(
            (a, b) =>
              b.total_points - a.total_points ||
              b.exact_count - a.exact_count ||
              a.username.localeCompare(b.username)
          )
        );
        return;
      }
      const { data } = await supabase.rpc('get_leaderboard', {
        p_league_id: id,
        p_stage: mode === 'Groups' ? 'group' : null,
      });
      if (data) setBoard(data as LeaderboardRow[]);
    },
    [id]
  );

  const load = useCallback(async () => {
    if (!id) return;
    setRefreshing(true);
    const uid = session?.user.id;

    const [leagueRes, matchRes, teamRes, predRes] = await Promise.all([
      supabase.from('leagues').select('*').eq('id', id).single(),
      supabase.from('matches').select('*').order('stage_order', { ascending: true }).order('kickoff', { ascending: true }),
      supabase.from('teams').select('*').order('group_label', { ascending: true }),
      supabase.from('predictions').select('*').eq('user_id', uid),
    ]);

    if (leagueRes.data) setLeague(leagueRes.data as League);
    if (matchRes.data) setMatches(matchRes.data as Match[]);
    if (teamRes.data) setTeams(teamRes.data as Team[]);
    if (predRes.data) {
      const map: Record<string, Prediction> = {};
      for (const p of predRes.data as Prediction[]) map[p.match_id] = p;
      setPreds(map);
    }
    await loadBoard(boardTab);
    setRefreshing(false);
  }, [id, session, boardTab, loadBoard]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // v1.1: live updates — the hook bumps rtVersion on each result change; the effect
  // re-runs the existing load() (matches + predictions + leaderboard) with the current
  // closure. Focus-refetch above is the fallback for backgrounded reconnects.
  const rtVersion = useMatchesRealtime();
  useEffect(() => {
    if (rtVersion) {
      console.log('[realtime] league reload via version', rtVersion);
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rtVersion]);

  function onBoardTabChange(next: string) {
    const t = next as BoardTab;
    setBoardTab(t);
    loadBoard(t);
  }

  // Matches tab: filter by stage, then section by display label (Group A.. / Round of 16..).
  const sections = useMemo(() => {
    const ms = (m: Match) => new Date(m.kickoff).getTime();
    const filtered =
      matchStage === ALL_STAGES ? matches : matches.filter((m) => m.stage_code === matchStage);
    const map = new Map<string, { title: string; order: number; first: number; data: Match[] }>();
    for (const m of filtered) {
      const s = map.get(m.stage) ?? { title: m.stage, order: m.stage_order, first: ms(m), data: [] };
      s.data.push(m);
      s.first = Math.min(s.first, ms(m));
      map.set(m.stage, s);
    }
    const list = [...map.values()];
    // Always order matches inside a section from earliest to latest kickoff.
    for (const s of list) s.data.sort((a, b) => ms(a) - ms(b));
    return list.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  }, [matches, matchStage]);

  // "All" is a flat, ungrouped list ordered by kickoff (grouping lives in the Groups tab).
  const allSorted = useMemo(
    () => [...matches].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()),
    [matches]
  );

  async function shareInvite() {
    if (!league) return;
    const link = Linking.createURL('join', { queryParams: { code: league.invite_code } });
    await Share.share({
      message: `Join my World Cup league "${league.name}"!\nTap: ${link}\nor enter code: ${league.invite_code}`,
    });
  }

  const openMatch = (matchId: string) =>
    router.push({ pathname: '/(app)/match/[id]', params: { id: matchId } });

  const refresh = (
    <RefreshControl refreshing={refreshing} onRefresh={load} tintColor={theme.color.primary} />
  );

  // flexGrow:1 makes the content fill the scroll frame (top-anchored); paddingBottom
  // keeps the last row clear of the device's bottom inset / nav bar.
  const listContent = [styles.list, { flexGrow: 1, paddingBottom: insets.bottom + 80 }];

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
        <Segmented options={['Matches', 'Tournament', 'Leaderboard']} value={tab} onChange={setTab} />
      </View>

      {tab === 'Matches' && (
        <>
          <StageFilter value={matchStage} onChange={setMatchStage} />
          {matchStage === ALL_STAGES ? (
            <FlatList
              data={allSorted}
              keyExtractor={(m) => m.id}
              style={styles.fill}
              contentContainerStyle={listContent}
              refreshControl={refresh}
              ListEmptyComponent={<EmptyState emoji="📅" title="No matches" subtitle="Run the seed to load fixtures." />}
              renderItem={({ item }) => (
                <MatchRow match={item} prediction={preds[item.id]} onPress={() => openMatch(item.id)} />
              )}
            />
          ) : (
            <SectionList
              sections={sections}
              keyExtractor={(m) => m.id}
              style={styles.fill}
              contentContainerStyle={listContent}
              stickySectionHeadersEnabled={false}
              refreshControl={refresh}
              ListEmptyComponent={<EmptyState emoji="📅" title="No matches" subtitle="Try another stage or run the seed." />}
              renderSectionHeader={({ section }) => <Text style={styles.sectionHead}>{section.title}</Text>}
              renderItem={({ item }) => (
                <MatchRow match={item} prediction={preds[item.id]} onPress={() => openMatch(item.id)} />
              )}
            />
          )}
        </>
      )}

      {tab === 'Tournament' && (
        <TournamentView
          teams={teams}
          matches={matches}
          preds={preds}
          onPressMatch={openMatch}
          refreshing={refreshing}
          onRefresh={load}
        />
      )}

      {tab === 'Leaderboard' && (
        <>
          <View style={styles.tabs}>
            <Segmented options={['All', 'Groups', 'Finals']} value={boardTab} onChange={onBoardTabChange} />
          </View>
          <FlatList
            data={board}
            keyExtractor={(r) => r.user_id}
            style={styles.fill}
            contentContainerStyle={listContent}
            refreshControl={refresh}
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
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.color.bg },
  fill: { flex: 1 },
  share: { color: theme.color.accent, fontWeight: '700', fontSize: theme.font.body },
  tabs: { padding: 16, paddingBottom: 8 },
  list: { padding: 16, paddingTop: 8, gap: 10 },
  sectionHead: {
    color: theme.color.accent,
    fontSize: theme.font.h3,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 2,
  },
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
