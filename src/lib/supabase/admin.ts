import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * The service-role client: it bypasses Row Level Security entirely. Server code only —
 * `import 'server-only'` makes any accidental import from a Client Component fail the build.
 *
 * Every write to the database goes through this client, from code that has already checked
 * the table code or the host PIN itself (RLS can't do that check for us here, since this key
 * ignores RLS by design).
 */
let cached: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  }
  cached = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
