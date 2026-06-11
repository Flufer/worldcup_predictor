import { useEffect, useState } from 'react';
import { useAuth } from './auth';
import { supabase } from './supabase';

// Reads the current user's is_admin flag from their profile. UI gating only —
// the real check is enforced server-side inside set_result().
export function useIsAdmin(): boolean {
  const { session } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const uid = session?.user.id;
    if (!uid) {
      setIsAdmin(false);
      return;
    }
    let active = true;
    supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', uid)
      .single()
      .then(({ data }) => {
        if (active) setIsAdmin(Boolean(data?.is_admin));
      });
    return () => {
      active = false;
    };
  }, [session]);

  return isAdmin;
}
