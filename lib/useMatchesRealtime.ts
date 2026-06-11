import { useEffect, useState } from 'react';
import { supabase } from './supabase';

// Subscribes to changes on public.matches and returns a `version` counter that
// increments on every result change (debounced ~250 ms). Screens refetch with:
//
//   const rtVersion = useMatchesRealtime();
//   useEffect(() => { if (rtVersion) load(); }, [rtVersion]);
//
// Why a counter instead of invoking a callback directly: this project runs with the
// React Compiler enabled, so mutating a ref during render to keep a callback "fresh"
// can be optimized away and fire a STALE load() — leaving the UI unchanged even though
// the realtime event arrived. Driving the refetch from React state avoids that entirely.
//
// `matchId` optionally narrows the subscription to a single match (the match screen).
export function useMatchesRealtime(matchId?: string): number {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    console.log('[realtime] subscribe →', matchId ? `matches:${matchId}` : 'matches');
    let timer: ReturnType<typeof setTimeout> | undefined;

    const channel = supabase
      .channel(matchId ? `matches:${matchId}` : 'matches')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          ...(matchId ? { filter: `id=eq.${matchId}` } : {}),
        },
        (payload) => {
          const rowId = (payload.new as any)?.id ?? (payload.old as any)?.id;
          console.log('[realtime] event received:', payload.eventType, rowId);
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => {
            console.log('[realtime] reload trigger (version bump)');
            setVersion((v) => v + 1);
          }, 250); // coalesce bursts of results into one refetch
        }
      )
      .subscribe((status) => console.log('[realtime] channel status:', status));

    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  return version;
}
