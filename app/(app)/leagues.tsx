import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { theme } from '../../lib/theme';
import { League } from '../../lib/types';
import { useIsAdmin } from '../../lib/useIsAdmin';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';

type Row = League & { member_count: number };

export default function Leagues() {
  const { session, signOut } = useAuth();
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const insets = useSafeAreaInsets();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const uid = session?.user.id;
    if (!uid) return;
    // Leagues I belong to (RLS lets me read only those).
    const { data: memberships } = await supabase
      .from('league_members')
      .select('league:leagues(*)')
      .eq('user_id', uid);

    const leagues: League[] = (memberships ?? [])
      .map((m: any) => m.league)
      .filter(Boolean);

    // Member counts for those leagues in one query.
    const ids = leagues.map((l) => l.id);
    const counts: Record<string, number> = {};
    if (ids.length) {
      const { data: members } = await supabase
        .from('league_members')
        .select('league_id')
        .in('league_id', ids);
      for (const m of members ?? []) counts[m.league_id] = (counts[m.league_id] ?? 0) + 1;
    }

    setRows(leagues.map((l) => ({ ...l, member_count: counts[l.id] ?? 1 })));
    setLoading(false);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.wrap}>
      <FlatList
        data={rows}
        keyExtractor={(l) => l.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={theme.color.primary} />}
        ListHeaderComponent={
          <View style={styles.headerRow}>
            {isAdmin ? (
              <Pressable onPress={() => router.push('/(app)/admin')} hitSlop={8}>
                <Text style={styles.adminText}>⚙︎ Admin</Text>
              </Pressable>
            ) : (
              <View />
            )}
            <Pressable onPress={signOut} style={styles.signout}>
              <Text style={styles.signoutText}>Sign out</Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          loading ? null : (
            <EmptyState emoji="🏆" title="No leagues yet" subtitle="Create one and invite friends, or join with a code." />
          )
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/(app)/league/[id]', params: { id: item.id } })}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.member_count} member{item.member_count === 1 ? '' : 's'} · code {item.invite_code}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        )}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button title="Create league" onPress={() => router.push('/(app)/create-league')} />
        <Button title="Join with code" variant="secondary" onPress={() => router.push('/(app)/join')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.color.bg },
  list: { padding: 16, gap: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  adminText: { color: theme.color.accent, fontSize: theme.font.small, fontWeight: '700', paddingVertical: 6 },
  signout: { paddingVertical: 6 },
  signoutText: { color: theme.color.muted, fontSize: theme.font.small, fontWeight: '600' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    padding: 16,
  },
  name: { color: theme.color.text, fontSize: theme.font.h3, fontWeight: '700' },
  meta: { color: theme.color.muted, fontSize: theme.font.small, marginTop: 4 },
  chevron: { color: theme.color.muted, fontSize: 28 },
  footer: { padding: 16, gap: 12, borderTopWidth: 1, borderTopColor: theme.color.border, backgroundColor: theme.color.bg },
});
