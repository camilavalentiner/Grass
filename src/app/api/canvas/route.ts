import { NextResponse } from "next/server";


/**
 * Tiny proxy to the Canvas LMS REST API, because browsers cannot call Canvas directly (CORS).
 * The student's token travels in a header and is never stored on the server.
 * Follows pagination (Link: rel="next") up to ten pages.
 */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const base = u.searchParams.get("base") ?? "";
  const path = u.searchParams.get("path") ?? "";
  const token = req.headers.get("x-canvas-token") ?? "";
  if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(?::\d+)?$/i.test(base)) return NextResponse.json({ error: "Canvas URL must look like https://school.instructure.com" }, { status: 400 });
  if (!path.startsWith("/courses") && !path.startsWith("/users/self")) return NextResponse.json({ error: "Path not allowed" }, { status: 400 });
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 401 });

  let url: string | null = `${base}/api/v1${path}${path.includes("?") ? "&" : "?"}per_page=100`;
  const out: unknown[] = [];
  for (let i = 0; i < 10 && url; i++) {
    const r: Response = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
    if (!r.ok) return NextResponse.json({ error: `Canvas replied ${r.status}` }, { status: r.status === 401 ? 401 : 502 });
    const data: unknown = await r.json();
    if (Array.isArray(data)) out.push(...data); else return NextResponse.json(data);
    const link = r.headers.get("link") ?? "";
    const m = link.match(/<([^>]+)>;\s*rel="next"/);
    url = m ? m[1] : null;
  }
  return NextResponse.json(out);
}
