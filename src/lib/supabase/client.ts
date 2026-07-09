import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getSupabaseBrowserEnv } from "@/lib/supabase/env";

export function createClient() {
  const { url, anonKey } = getSupabaseBrowserEnv();
  return createBrowserClient<Database>(url, anonKey);
}