import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';

// Subscribes to changes on public.matches and calls `onChange` (debounced) whenever
// a result lands. The whole tournament shares one row set, so a single channel drives
// every screen's refetch. Pass a stable callback (e.g. wrapped in useCallback).
//
// `matchId` optionally narrows the subscription to one match (used by the match screen).
export function useMatchesRealtime(onChange: () => void, matchId?: string) {
  // Keep the latest callback without resubscribing on every render.
  const cb = useRef(onChange);
  cb.current = onChange;

  useEffect(() => {
    const timer = { id: undefined as ReturnType<typeof setTimeout> | undefined };
    const fire = () => {
      if (timer.id) clearTimeout(timer.id);
      timer.id = setTimeout(() => cb.current(), 250); // coalesce bursts of results
    };

    const channel: RealtimeChannel = supabase
      .channel(matchId ? `matches:${matchId}` : 'matches')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          ...(matchId ? { filter: `id=eq.${matchId}` } : {}),
        },
        fire
      )
      .subscribe();

    return () => {
      if (timer.id) clearTimeout(timer.id);
      supabase.removeChannel(channel);
    };
  }, [matchId]);
}
