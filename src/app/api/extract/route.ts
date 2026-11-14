import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { NextResponse } from "next/server";
import { READER_SYSTEM } from "@/lib/readerPrompt";

const hasKey = () => !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

/** Whether the built-in reader is switched on (only when the server has a Claude API key). */
export async function GET() {
  return NextResponse.json({ enabled: hasKey() });
}

export const maxDuration = 120;

const ExtractionSchema = z.object({
  classes: z.array(z.object({
    name: z.string(),
    code: z.string().nullable(),
    term: z.string().nullable(),
    rubric: z.array(z.object({ name: z.string(), weight: z.number(), count: z.number().nullable() })),
  })),
  tasks: z.array(z.object({
    title: z.string(),
    classCode: z.string().nullable(),
    className: z.string().nullable(),
    rubricName: z.string().nullable(),
    due: z.string().nullable(),
    description: z.string().nullable(),
    kind: z.enum(["mandatory", "optional"]),
    nature: z.enum(["analytical", "creative", "mixed"]),
    estimateMin: z.number().nullable(),
    weight: z.number().nullable(),
  })),
  notes: z.string().nullable(),
});

const SYSTEM = READER_SYSTEM;

type Part = Anthropic.ContentBlockParam;

export async function POST(req: Request) {
  if (!hasKey()) {
    return NextResponse.json({ error: "The server has no Claude API key. Add ANTHROPIC_API_KEY to .env.local and restart." }, { status: 503 });
  }
  const form = await req.formData();
  const timeZone = String(form.get("timeZone") ?? "UTC");
  const today = String(form.get("today") ?? new Date().toISOString());
  const text = String(form.get("text") ?? "").trim();
  const parts: Part[] = [];
  for (const entry of form.getAll("files")) {
    if (!(entry instanceof File)) continue;
    const buf = Buffer.from(await entry.arrayBuffer());
    const b64 = buf.toString("base64");
    const mt = entry.type;
    if (mt === "application/pdf") parts.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 }, title: entry.name });
    else if (["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mt)) parts.push({ type: "image", source: { type: "base64", media_type: mt as "image/jpeg" | "image/png" | "image/webp" | "image/gif", data: b64 } });
    else parts.push({ type: "text", text: `File ${entry.name}:\n${buf.toString("utf8").slice(0, 60_000)}` });
  }
  if (text) parts.push({ type: "text", text: `Pasted text:\n${text.slice(0, 60_000)}` });
  if (!parts.length) return NextResponse.json({ error: "Nothing to read." }, { status: 400 });
  parts.push({ type: "text", text: `Today is ${today}. The student's time zone is ${timeZone}. Extract the classes, rubrics and tasks from the material above.` });

  const client = new Anthropic();
  try {
    const response = await client.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      output_config: { effort: "medium", format: zodOutputFormat(ExtractionSchema) },
      system: SYSTEM,
      messages: [{ role: "user", content: parts }],
    });
    if (response.stop_reason === "refusal") return NextResponse.json({ error: "The model declined to read this material." }, { status: 422 });
    if (!response.parsed_output) return NextResponse.json({ error: "Could not parse the extraction." }, { status: 502 });
    return NextResponse.json(response.parsed_output);
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) return NextResponse.json({ error: "The Claude API key was rejected." }, { status: 401 });
    if (err instanceof Anthropic.RateLimitError) return NextResponse.json({ error: "Rate limited by the Claude API. Try again in a minute." }, { status: 429 });
    if (err instanceof Anthropic.APIError) return NextResponse.json({ error: `Claude API error ${err.status}: ${err.message}` }, { status: 502 });
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
