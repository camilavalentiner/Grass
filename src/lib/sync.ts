"use client";
import { useSyncExternalStore } from "react";
import { getState, replaceState, setLocalChangeHandler, type AppState } from "./store";
import { supabase } from "./supabase";
import { applyDoc, mergeDocs, toDoc, type SyncDoc } from "./merge";
import { sampleClasses, sampleSessions, sampleTasks } from "./sample";

export type SyncStatus = { phase: "off" | "signed-out" | "code-sent" | "syncing" | "synced" | "error"; email?: string; lastSync?: string; error?: string };

let status: SyncStatus = { phase: "off" };
const subs = new Set<() => void>();
const set = (p: Partial<SyncStatus>) => { status = { ...status, ...p }; subs.forEach((f) => f()); };
export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => status, () => status);
}

const SAMPLE_IDS = new Set([...sampleClasses, ...sampleTasks, ...sampleSessions].map((x) => x.id));
/** The first time a device joins an account, untouched sample items are left behind. */
function withoutSamples(s: AppState): AppState {
  const keep = <T extends { id: string }>(arr: T[], key: string) => arr.filter((x) => !SAMPLE_IDS.has(x.id) || s.sync.stamps[`${key}:${x.id}`]);
  return { ...s, classes: keep(s.classes, "classes"), tasks: keep(s.tasks, "tasks"), sessions: keep(s.sessions, "sessions") };
}

let running = false, again = false, timer: ReturnType<typeof setTimeout> | null = null;

/** Pull the cloud copy, merge it with this device, save the result in both places. */
export async function syncNow(): Promise<void> {
  const sb = supabase();
  if (!sb) return;
  if (running) { again = true; return; }
  running = true;
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { set({ phase: status.phase === "code-sent" ? "code-sent" : "signed-out", email: undefined }); return; }
    set({ phase: "syncing", email: session.user.email ?? undefined, error: undefined });
    const uid = session.user.id;
    const { data, error } = await sb.from("app_state").select("data").eq("user_id", uid).limit(1);
    if (error) throw new Error(error.message);
    const remote = (data?.[0]?.data as SyncDoc | undefined) ?? null;
    let local = getState();
    if (local.sync.userId !== uid) local = withoutSamples(local);
    const merged = mergeDocs(toDoc(local), remote && remote.v === 1 ? remote : null);
    const lastSync = new Date().toISOString();
    replaceState(applyDoc(local, merged, { userId: uid, lastSync }));
    if (!remote || JSON.stringify(remote) !== JSON.stringify(merged)) {
      const { error: upErr } = await sb.from("app_state").upsert({ user_id: uid, data: merged, updated_at: lastSync });
      if (upErr) throw new Error(upErr.message);
    }
    set({ phase: "synced", lastSync });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    set({ phase: "error", error: /app_state/.test(msg) && /(find|exist)/i.test(msg) ? "The database table is missing. Run supabase/schema.sql in Supabase first." : msg });
  } finally {
    running = false;
    if (again) { again = false; void syncNow(); }
  }
}

function soon(ms = 1500) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => { timer = null; void syncNow(); }, ms);
}

let started = false;
/** Start listening for sign-in, local edits, coming back to the app, and a slow heartbeat. */
export function startSync() {
  const sb = supabase();
  if (!sb || started) return;
  started = true;
  set({ phase: "signed-out" });
  setLocalChangeHandler(() => soon());
  sb.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") set({ phase: "signed-out", email: undefined });
    else if (session) { set({ email: session.user.email ?? undefined }); soon(50); }
  });
  const wake = () => { if (document.visibilityState === "visible") soon(200); };
  document.addEventListener("visibilitychange", wake);
  window.addEventListener("focus", wake);
  window.addEventListener("online", wake);
  setInterval(() => { if (document.visibilityState === "visible") void syncNow(); }, 45_000);
  soon(100);
}

export async function sendSignInEmail(email: string) {
  const sb = supabase();
  if (!sb) return;
  const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
  if (error) { set({ phase: "error", error: error.message }); return false; }
  set({ phase: "code-sent", email, error: undefined });
  return true;
}

export async function verifyCode(email: string, token: string) {
  const sb = supabase();
  if (!sb) return;
  const { error } = await sb.auth.verifyOtp({ email, token, type: "email" });
  if (error) { set({ phase: "code-sent", error: error.message }); return false; }
  soon(50);
  return true;
}

/** Signing out keeps everything on this device; it just stops syncing. */
export async function signOut() {
  const sb = supabase();
  if (!sb) return;
  await sb.auth.signOut();
  set({ phase: "signed-out", email: undefined, lastSync: undefined });
}
