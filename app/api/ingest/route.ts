import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

function extractJson(stdout: string): unknown {
  // Senso CLI prints a header + success message before the JSON — find the first {
  const idx = stdout.indexOf("{");
  if (idx === -1) throw new Error("No JSON in response: " + stdout);
  return JSON.parse(stdout.slice(idx));
}

export async function POST(request: Request) {
  if (!process.env.SENSO_API_KEY) {
    return Response.json({ error: "SENSO_API_KEY not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { title, text } = body;

    if (!title || !text) {
      return Response.json({ error: "title and text are required" }, { status: 400 });
    }

    const data = JSON.stringify({ title, text: `# ${title}\n\n${text}` });
    const env = { ...process.env, SENSO_API_KEY: process.env.SENSO_API_KEY };

    const { stdout } = await execAsync(
      `senso kb create-raw --data '${data.replace(/'/g, "'\\''")}'`,
      { env }
    );

    const result = extractJson(stdout);
    return Response.json({ success: true, result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ status: "ok" });
}
