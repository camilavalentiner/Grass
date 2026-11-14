/** A minimal iCalendar parser: enough for assignment and event feeds. */
export type IcsEvent = {
  uid: string;
  summary: string;
  description?: string;
  url?: string;
  /** "YYYYMMDD" or "YYYYMMDDTHHMMSS" (with trailing Z when UTC) */
  start: string;
  end?: string;
  tzid?: string;
  allDay: boolean;
};

function unfold(text: string): string[] {
  return text.replace(/\r\n[ \t]|\n[ \t]/g, "").split(/\r?\n/);
}
const unescape = (v: string) => v.replace(/\\n/gi, "\n").replace(/\\,/g, ",").replace(/\;/g, ";").replace(/\\\\/g, "\\");

export function parseIcs(text: string): IcsEvent[] {
  const events: IcsEvent[] = [];
  let cur: Partial<IcsEvent> | null = null;
  for (const line of unfold(text)) {
    if (line === "BEGIN:VEVENT") { cur = {}; continue; }
    if (line === "END:VEVENT") { if (cur?.start && cur.summary !== undefined) events.push({ uid: cur.uid ?? `${cur.start}-${cur.summary}`, summary: cur.summary, description: cur.description, url: cur.url, start: cur.start, end: cur.end, tzid: cur.tzid, allDay: !!cur.allDay }); cur = null; continue; }
    if (!cur) continue;
    const i = line.indexOf(":"); if (i < 0) continue;
    const head = line.slice(0, i), value = line.slice(i + 1);
    const [name, ...params] = head.split(";");
    const p = Object.fromEntries(params.map((x) => x.split("=") as [string, string]));
    switch (name) {
      case "UID": cur.uid = value; break;
      case "SUMMARY": cur.summary = unescape(value); break;
      case "DESCRIPTION": cur.description = unescape(value); break;
      case "URL": cur.url = value; break;
      case "DTSTART": cur.start = value; cur.allDay = p.VALUE === "DATE" || /^\d{8}$/.test(value); if (p.TZID) cur.tzid = p.TZID; break;
      case "DTEND": cur.end = value; break;
    }
  }
  return events;
}

/** Turn an iCal date into a local Date. Floating times are read in the device's zone; TZID times are converted. */
export function icsToDate(value: string, tzid?: string, allDay = false): Date {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/);
  if (!m) return new Date(value);
  const [, Y, M, D, h = "23", mi = "59", s = "0", z] = m;
  if (allDay) return new Date(+Y, +M - 1, +D, 23, 59, 0);
  if (z) return new Date(Date.UTC(+Y, +M - 1, +D, +h, +mi, +s));
  if (tzid) {
    // find the offset of tzid at that wall time
    const guess = new Date(Date.UTC(+Y, +M - 1, +D, +h, +mi, +s));
    try {
      const parts = new Intl.DateTimeFormat("en-US", { timeZone: tzid, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(guess);
      const get = (t: string) => +(parts.find((x) => x.type === t)?.value ?? 0);
      const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
      return new Date(guess.getTime() - (asUtc - guess.getTime()));
    } catch { /* unknown zone: fall through to local */ }
  }
  return new Date(+Y, +M - 1, +D, +h, +mi, +s);
}
