/** Session clock. `window.__grassSpeed` speeds time up for tests; it is 1 in normal use. */
export const speed = () => (typeof window !== "undefined" && (window as unknown as { __grassSpeed?: number }).__grassSpeed) || 1;
/** Real milliseconds a block of `minutes` takes on the wall clock. */
export const msFor = (minutes: number) => (minutes * 60_000) / speed();
