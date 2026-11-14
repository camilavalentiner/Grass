import type { AppState, SyncMeta } from "./store";
import { SYNCED_COLLECTIONS, SYNCED_FIELDS } from "./store";

/** What is stored in the cloud row. */
export type SyncDoc = Pick<AppState, (typeof SYNCED_COLLECTIONS)[number] | (typeof SYNCED_FIELDS)[number]> & {
  v: 1;
  stamps: Record<string, number>;
  tombstones: Record<string, number>;
};

const KEEP_TOMBSTONES_MS = 90 * 864e5;

export function toDoc(s: AppState): SyncDoc {
  return { v: 1, classes: s.classes, tasks: s.tasks, sessions: s.sessions, documents: s.documents, name: s.name, term: s.term, drive: s.drive, stamps: s.sync.stamps, tombstones: s.sync.tombstones };
}

function maxMap(a: Record<string, number>, b: Record<string, number>) {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) if (!(k in out) || v > out[k]) out[k] = v;
  return out;
}

/**
 * Merge two copies of the planner. For every item the most recent change wins;
 * a deletion wins over any change made before it. Order follows the local copy,
 * with items that only exist remotely added at the end.
 */
export function mergeDocs(local: SyncDoc, remote: SyncDoc | null, now = Date.now()): SyncDoc {
  if (!remote) return local;
  const stamps = maxMap(local.stamps, remote.stamps);
  const tombstones = Object.fromEntries(Object.entries(maxMap(local.tombstones, remote.tombstones)).filter(([, t]) => now - t < KEEP_TOMBSTONES_MS));
  const out = { ...local, stamps, tombstones } as SyncDoc;

  for (const key of SYNCED_COLLECTIONS) {
    const l = local[key] as { id: string }[], r = (remote[key] ?? []) as { id: string }[];
    const rById = new Map(r.map((x) => [x.id, x]));
    const lIds = new Set(l.map((x) => x.id));
    const pick = (id: string) => {
      const k = `${key}:${id}`;
      const ls = local.stamps[k] ?? 0, rs = remote.stamps[k] ?? 0;
      const lItem = l.find((x) => x.id === id), rItem = rById.get(id);
      if ((tombstones[k] ?? 0) > Math.max(ls, rs)) return null;
      if (lItem && rItem) return ls >= rs ? lItem : rItem;
      // present on one side only: keep it unless the other side deleted it later
      return lItem ?? rItem ?? null;
    };
    const merged: { id: string }[] = [];
    for (const x of l) { const v = pick(x.id); if (v) merged.push(v); }
    for (const x of r) if (!lIds.has(x.id)) { const v = pick(x.id); if (v) merged.push(v); }
    (out as unknown as Record<string, unknown>)[key] = merged;
  }
  for (const f of SYNCED_FIELDS) {
    const ls = local.stamps[`field:${f}`] ?? 0, rs = remote.stamps[`field:${f}`] ?? 0;
    (out as unknown as Record<string, unknown>)[f] = rs > ls ? remote[f] : local[f];
  }
  return out;
}

export function applyDoc(s: AppState, d: SyncDoc, sync: Partial<SyncMeta>): AppState {
  return { ...s, classes: d.classes, tasks: d.tasks, sessions: d.sessions, documents: d.documents, name: d.name, term: d.term, drive: d.drive, sync: { ...s.sync, ...sync, stamps: d.stamps, tombstones: d.tombstones } };
}
