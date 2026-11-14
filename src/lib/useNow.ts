"use client";
import { useEffect, useState } from "react";

/** The current time, read only in the browser (so the prerender stays static) and refreshed every `everyMs`. */
export function useNow(everyMs = 30_000): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, everyMs);
    return () => { clearTimeout(first); clearInterval(id); };
  }, [everyMs]);
  return now;
}
