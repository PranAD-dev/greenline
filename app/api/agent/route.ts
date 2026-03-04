import { NextRequest } from "next/server";
import { runActionAgent, AgentEvent } from "@/lib/agents/action";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { query } = await request.json();

  if (!query?.trim()) {
    return new Response(JSON.stringify({ error: "Query is required" }), { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of runActionAgent(query)) {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));

          // Save completed cases to file
          if (event.type === "result") {
            try {
              const casesPath = path.join(process.cwd(), "data", "sample-cases.json");
              const existing = JSON.parse(fs.readFileSync(casesPath, "utf8"));
              const newCase = {
                id: `case-${Date.now()}`,
                text: query,
                category: event.data.triage.category,
                urgency: event.data.triage.urgency,
                status: "open",
                department: event.data.triage.department,
                timestamp: new Date().toISOString(),
                summary: event.data.triage.summary,
                recommendation: event.data.action_plan[0]?.action || "",
              };
              existing.unshift(newCase);
              fs.writeFileSync(casesPath, JSON.stringify(existing.slice(0, 50), null, 2));
            } catch {
              // Non-critical: file write failure doesn't break the response
            }
          }
        }
      } catch (err) {
        const errorEvent: AgentEvent = {
          type: "error",
          message: err instanceof Error ? err.message : "Stream error",
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
