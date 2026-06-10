import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../lib/theme';
import { Match, Prediction, Team } from '../lib/types';
import { KNOCKOUT_STAGES } from '../lib/format';
import { Segmented } from './Segmented';
import { GroupCard } from './GroupCard';
import { MatchRow } from './MatchRow';
import { EmptyState } from './EmptyState';

const GROUP_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

// Tournament tab content: Groups (teams per group) and Bracket (knockout rounds).
export function TournamentView({
  teams,
  matches,
  preds,
  onPressMatch,
  refreshing,
  onRefresh,
}: {
  teams: Team[];
  matches: Match[];
  preds: Record<string, Prediction>;
  onPressMatch: (id: string) => void;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const [sub, setSub] = useState('Groups');
  const insets = useSafeAreaInsets();
  const listContent = [styles.list, { flexGrow: 1, paddingBottom: insets.bottom + 80 }];

  const refresh = (
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.color.primary} />
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.subTabs}>
        <Segmented options={['Groups', 'Bracket']} value={sub} onChange={setSub} />
      </View>

      {sub === 'Groups' ? (
        <ScrollView style={styles.fill} contentContainerStyle={listContent} refreshControl={refresh}>
          {teams.length === 0 ? (
            <EmptyState emoji="🏟️" title="No teams yet" subtitle="Run the tournament seed to load groups." />
          ) : (
            GROUP_LABELS.map((g) => {
              const groupTeams = teams.filter((t) => t.group_label === g);
              if (groupTeams.length === 0) return null;
              return <GroupCard key={g} label={g} teams={groupTeams} />;
            })
          )}
        </ScrollView>
      ) : (
        <ScrollView style={styles.fill} contentContainerStyle={listContent} refreshControl={refresh}>
          {KNOCKOUT_STAGES.map((s) => {
            const stageMatches = matches.filter((m) => m.stage_code === s.code);
            if (stageMatches.length === 0) return null;
            return (
              <View key={s.code} style={{ gap: 10 }}>
                <Text style={styles.sectionHead}>{s.name}</Text>
                {stageMatches.map((m) => (
                  <MatchRow
                    key={m.id}
                    match={m}
                    prediction={preds[m.id]}
                    onPress={() => onPressMatch(m.id)}
                  />
                ))}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  subTabs: { paddingHorizontal: 16, paddingBottom: 8 },
  list: { padding: 16, paddingTop: 8, gap: 12 },
  sectionHead: {
    color: theme.color.accent,
    fontSize: theme.font.h3,
    fontWeight: '800',
    marginTop: 4,
  },
});
