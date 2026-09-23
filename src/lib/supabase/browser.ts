import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * A browser client scoped by one of our short-lived custom tokens (see src/lib/live/token.ts)
 * instead of a Supabase Auth session — there isn't one. The token is what lets Realtime and
 * reads past RLS see only this table or event; see supabase/migrations/0001_init.sql.
 *
 * Callers should build this once per token with `useMemo`, not on every render.
 */
export function createLiveClient(accessToken: string): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.');
  }
  return createClient(url, anonKey, {
    accessToken: () => Promise.resolve(accessToken),
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
