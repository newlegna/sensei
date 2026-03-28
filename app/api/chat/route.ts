import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { Unkey } from "@unkey/api";

const unkey = process.env.UNKEY_ROOT_KEY
  ? new Unkey({ rootKey: process.env.UNKEY_ROOT_KEY })
  : null;

async function verifyApiKey(request: Request): Promise<boolean> {
  if (!unkey) return true; // dev mode
  const key = request.headers.get("x-api-key");
  if (!key) return false;
  try {
    const result = await unkey.keys.verifyKey({ key });
    return result.data?.valid === true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const isValid = await verifyApiKey(request);
  if (!isValid) {
    return new Response(JSON.stringify({ error: "Invalid or missing API key" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const { messages: rawMessages, trendContext } = body;

  // Sanitize messages to match AI SDK format
  const messages = (rawMessages || []).map((m: { role: string; content: string | { type: string; text: string }[] }) => ({
    role: m.role as "user" | "assistant",
    content: typeof m.content === "string"
      ? m.content
      : Array.isArray(m.content)
        ? m.content.map((p: { type: string; text: string }) => p.type === "text" ? p.text : "").join("")
        : String(m.content),
  })).filter((m: { role: string; content: string }) => m.content && (m.role === "user" || m.role === "assistant"));

  const systemPrompt = `You are Trend Radar — an AI content strategist that helps creators act on trends before they peak.

${trendContext ? `## Current Trend Intelligence:\n${trendContext}\n\n` : ""}

Help the creator understand:
- Why a trend is rising and how long it will last
- What unique angle they can take given their content history
- How to structure content for maximum reach
- Which format works best (short video, long video, article, thread)

Be direct, specific, and actionable. No fluff.

Powered by: Railtracks 🚂 | Senso.ai 📚 | Unkey 🔑 | assistant-ui 💬 | Augment Code 🤖`;

  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: systemPrompt,
    messages,
    maxOutputTokens: 1000,
  });

  return result.toUIMessageStreamResponse();
}
