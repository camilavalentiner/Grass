import { NextResponse } from "next/server";
import { parseIcs } from "@/lib/ics";


/** Fetches a calendar feed (Google Calendar secret address, Outlook published calendar, Canvas feed) and returns its events. */
export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("url") ?? "";
  const url = raw.replace(/^webcal:\/\//i, "https://");
  if (!/^https:\/\//i.test(url)) return NextResponse.json({ error: "Feed URL must start with https:// or webcal://" }, { status: 400 });
  try {
    const r = await fetch(url, { headers: { Accept: "text/calendar, text/plain, */*" } });
    if (!r.ok) return NextResponse.json({ error: `The feed replied ${r.status}` }, { status: 502 });
    const text = await r.text();
    if (!/BEGIN:VCALENDAR/i.test(text)) return NextResponse.json({ error: "That URL did not return a calendar." }, { status: 422 });
    return NextResponse.json({ events: parseIcs(text) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not fetch the feed" }, { status: 502 });
  }
}
