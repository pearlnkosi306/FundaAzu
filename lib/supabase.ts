import { createClient } from "@supabase/supabase-js";

const env = import.meta.env;
const supabaseUrl = env.VITE_SUPABASE_URL?.trim();
const supabaseKey = (env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.VITE_SUPABASE_ANON_KEY)?.trim();

export const isConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = createClient(
  supabaseUrl || "http://127.0.0.1:54321",
  supabaseKey || "local-development-placeholder",
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);

export function configurationError(): string {
  return "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your .env file, then restart Vite.";
}
