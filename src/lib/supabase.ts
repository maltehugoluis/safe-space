import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Safe check: If credentials aren't defined yet, do not throw an error during build or preview.
// This allows the prototype to work seamlessly in demo mode with localStorage.
export const supabase = 
  supabaseUrl && supabaseAnonKey && supabaseUrl !== "your-supabase-url"
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

if (!supabase) {
  console.warn(
    "Supabase credentials missing or default placeholder detected. Operating in local-only demo mode."
  );
}
