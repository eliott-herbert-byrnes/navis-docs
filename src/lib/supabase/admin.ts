import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Service-role Supabase client. The generated `Database` type in `types.ts` is
 * imported only here and in `storage/supabase-adapter.ts` — nothing else under `src/`
 * references `@/lib/supabase/types` (self-hosting prep 2f audit). You can remove this
 * file when nothing imports `supabaseAdmin`; keep `types.ts` until the Supabase
 * storage adapter is gone or its client is typed without `Database`.
 */
let _client: SupabaseClient<Database> | null = null;

function getSupabaseAdmin(): SupabaseClient<Database> {
  if (_client) return _client;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for Supabase admin client",
    );
  }
  _client = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop) {
    return (getSupabaseAdmin() as unknown as Record<string, unknown>)[
      prop as string
    ];
  },
});
