import { Unkey } from "@unkey/api";
import { NextRequest } from "next/server";

const unkey = process.env.UNKEY_ROOT_KEY
  ? new Unkey({ rootKey: process.env.UNKEY_ROOT_KEY })
  : null;

async function verifyKey(req: NextRequest): Promise<boolean> {
  if (!unkey || !process.env.UNKEY_ROOT_KEY) return true; // dev mode
  const key = req.headers.get("x-api-key");
  if (!key) return false;
  try {
    const result = await unkey.keys.verifyKey({ key });
    return result.data?.valid === true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const valid = await verifyKey(req);
  if (!valid) {
    return Response.json({ error: "Invalid API key" }, { status: 401 });
  }

  const agentUrl = process.env.AGENT_URL || "http://localhost:8001";

  try {
    const res = await fetch(`${agentUrl}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(90_000), // Railtracks needs time
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: err }, { status: 502 });
    }

    const data = await res.json();
    return Response.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Agent unreachable";
    return Response.json({ error: msg, trends: [] }, { status: 503 });
  }
}

// GET returns the last scan (for demo: just triggers a fresh scan)
export async function GET(req: NextRequest) {
  return POST(req);
}
