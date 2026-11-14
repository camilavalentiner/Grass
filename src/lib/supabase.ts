"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** The project URL and publishable key are meant to ship in the app; row-level security protects the data. */
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://djoamqbtyvsjqpaplqin.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_EdgZS33fAcg_6M4_uRK0aw_OSCzjr6n";

let client: SupabaseClient | null = null;
export function supabase(): SupabaseClient | null {
  if (typeof window === "undefined" || !URL || !KEY) return null;
  client ??= createClient(URL, KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "grass.auth" } });
  return client;
}
