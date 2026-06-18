// EvidenceVault AI assistant — Supabase Edge Function (Deno).
//
// Calls the Claude Messages API to summarize incidents, detect patterns, and
// draft attorney-ready reports. The ANTHROPIC_API_KEY lives as an Edge Function
// secret and never ships in the mobile app:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// Auth: the caller must pass a valid Supabase user JWT (Authorization: Bearer).
// We only ever receive data the client already had decrypted, and process it
// with the user's explicit consent (premium feature).

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Task = "summarize" | "patterns" | "report";

interface RequestBody {
  task: Task;
  /** Plain-text corpus the client assembled from incidents/evidence/etc. */
  context: string;
  /** Optional date range label for report-style tasks. */
  rangeLabel?: string;
}

const SYSTEM_PROMPT = `You are an assistant inside EvidenceVault, an app people use to document harassment and personal-safety incidents.
You help the user make sense of their own records. Be precise, factual, and neutral.
- Never invent facts, names, dates, or events that are not in the provided records.
- When information is missing, say so plainly rather than guessing.
- Write in clear, plain language suitable for sharing with an attorney or investigator.
- Do not give legal advice or opinions on guilt; summarize and organize what the records say.
- Lead with the outcome the reader needs, then supporting detail.`;

function taskInstruction(task: Task, rangeLabel?: string): string {
  switch (task) {
    case "summarize":
      return "Summarize the following incident records into a concise narrative overview. Group related events and note any recurring people, vehicles, locations, or times.";
    case "patterns":
      return "Analyze the following records for patterns: recurring people, vehicles, license plates, locations, times of day, days of week, and escalation over time. Present findings as a short, evidence-anchored list. Cite the dates that support each pattern.";
    case "report":
      return `Produce an attorney-ready chronological report${
        rangeLabel ? ` for the period ${rangeLabel}` : ""
      }. Include: (1) a one-paragraph summary, (2) a dated chronology of incidents, (3) noted patterns, and (4) a list of evidence and reports referenced. Keep it factual and well structured.`;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing Authorization header." }, 401);
    }

    // Verify the user JWT against the project.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      return json({ error: "Invalid session." }, 401);
    }

    const body = (await req.json()) as RequestBody;
    if (!body?.context?.trim()) {
      return json({ error: "Nothing to analyze." }, 400);
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured on the server." }, 500);

    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      output_config: { effort: "medium" },
      messages: [
        {
          role: "user",
          content: `${taskInstruction(body.task, body.rangeLabel)}\n\n--- RECORDS ---\n${body.context}`,
        },
      ],
    });

    if (message.stop_reason === "refusal") {
      return json({ error: "The assistant declined to process this request." }, 422);
    }

    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    return json({ text });
  } catch (e) {
    return json({ error: (e as Error).message ?? "Unexpected error." }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
