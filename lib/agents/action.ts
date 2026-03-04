import Anthropic from "@anthropic-ai/sdk";
import { triageCase, TriageResult } from "./triage";
import { searchPolicy, PolicyResult } from "./policy";
import { gatherEvidence, EvidenceResult } from "./evidence";

export interface ActionPlanStep {
  department: string;
  action: string;
  timeline: string;
  priority: "immediate" | "short-term" | "medium-term";
}

export interface ActionResult {
  triage: TriageResult;
  policy: PolicyResult;
  evidence: EvidenceResult;
  action_plan: ActionPlanStep[];
  citizen_response: string;
  internal_notes: string;
}

export type AgentEvent =
  | { type: "step"; step: string; status: "running" | "done"; data?: unknown }
  | { type: "result"; data: ActionResult }
  | { type: "error"; message: string };

function mockActionPlan(triage: TriageResult, policy: PolicyResult): ActionPlanStep[] {
  const steps: ActionPlanStep[] = [];
  if (triage.urgency >= 4) {
    steps.push({
      department: triage.department,
      action: `Conduct immediate site inspection and issue compliance notice`,
      timeline: "Within 24-48 hours",
      priority: "immediate",
    });
  }
  steps.push({
    department: triage.department,
    action: `Review applicable policy requirements and verify compliance status`,
    timeline: "Within 3-5 business days",
    priority: "short-term",
  });
  if (policy.applicable_targets.length > 0) {
    steps.push({
      department: "Office of Climate Action",
      action: `Update progress tracking for ${policy.applicable_targets[0].label} target`,
      timeline: "Within 2 weeks",
      priority: "medium-term",
    });
  }
  return steps;
}

function mockCitizenResponse(triage: TriageResult, query: string): string {
  return `Thank you for your report. We've received your concern regarding ${triage.category.replace("-", " ")} in your neighborhood.

Your case has been classified as Priority ${triage.urgency}/5 and assigned to ${triage.department}.

**What happens next:**
${triage.urgency >= 4
  ? "• An inspector will be dispatched within 24-48 hours to assess the situation\n• You will receive a follow-up within 3 business days"
  : "• Your report has been added to the departmental queue\n• You will receive an update within 5-7 business days"
}

Your reference number is GRN-${Date.now().toString().slice(-6)}.

If this is an emergency, please call the City's 24/7 environmental hotline at (555) 311-0000.`;
}

export async function* runActionAgent(query: string): AsyncGenerator<AgentEvent> {
  try {
    // Step 1: Triage
    yield { type: "step", step: "triage", status: "running" };
    const triage = await triageCase(query);
    yield { type: "step", step: "triage", status: "done", data: triage };

    // Step 2: Policy search
    yield { type: "step", step: "policy", status: "running" };
    const policy = await searchPolicy(query, triage.category);
    yield { type: "step", step: "policy", status: "done", data: policy };

    // Step 3: Evidence gathering
    yield { type: "step", step: "evidence", status: "running" };
    const evidence = await gatherEvidence(triage.category, query);
    yield { type: "step", step: "evidence", status: "done", data: evidence };

    // Step 4: Action plan synthesis
    yield { type: "step", step: "action", status: "running" };

    const apiKey = process.env.ANTHROPIC_API_KEY;
    let action_plan: ActionPlanStep[] = mockActionPlan(triage, policy);
    let citizen_response = mockCitizenResponse(triage, query);
    let internal_notes = `Case triaged to ${triage.department}. ${policy.clauses.length} relevant policy clauses identified. Urgency: ${triage.urgency}/5.`;

    if (apiKey && apiKey !== "your-key-here") {
      const client = new Anthropic({ apiKey });

      const tools: Anthropic.Tool[] = [
        {
          name: "generate_action_plan",
          description: "Generate a structured action plan for resolving a sustainability case",
          input_schema: {
            type: "object" as const,
            properties: {
              steps: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    department: { type: "string" },
                    action: { type: "string" },
                    timeline: { type: "string" },
                    priority: { type: "string", enum: ["immediate", "short-term", "medium-term"] },
                  },
                  required: ["department", "action", "timeline", "priority"],
                },
              },
              internal_notes: { type: "string" },
            },
            required: ["steps", "internal_notes"],
          },
        },
        {
          name: "draft_response",
          description: "Draft a professional response to the citizen or staff who submitted the report",
          input_schema: {
            type: "object" as const,
            properties: {
              response: { type: "string" },
            },
            required: ["response"],
          },
        },
      ];

      const contextBlock = `
TRIAGE RESULT:
- Category: ${triage.category}
- Urgency: ${triage.urgency}/5
- Department: ${triage.department}
- Summary: ${triage.summary}

RELEVANT POLICY CLAUSES:
${policy.clauses.map((c) => `- ${c.authority}: "${c.title}" — ${c.text.slice(0, 200)}...`).join("\n")}

TARGETS AFFECTED:
${policy.applicable_targets.map((t) => `- ${t.label}: ${t.currentValue}${t.unit} (target: ${t.targetValue} by ${t.deadline})`).join("\n")}

EVIDENCE:
${evidence.data_points.map((d) => `- ${d.source}: ${d.value} (${d.date})`).join("\n")}
`;

      const response = await client.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 2048,
        system: `You are an action synthesis agent for a city sustainability office. Given triage results, policy context, and evidence, generate a specific, actionable response plan and draft a professional citizen response.

Be specific — cite policy clauses by section number. Reference actual data points. Give clear timelines.`,
        messages: [
          {
            role: "user",
            content: `Original report: "${query}"\n\n${contextBlock}\n\nGenerate an action plan and citizen response.`,
          },
        ],
        tools,
      });

      for (const block of response.content) {
        if (block.type === "tool_use" && block.name === "generate_action_plan") {
          const input = block.input as { steps: ActionPlanStep[]; internal_notes: string };
          action_plan = input.steps;
          internal_notes = input.internal_notes;
        }
        if (block.type === "tool_use" && block.name === "draft_response") {
          const input = block.input as { response: string };
          citizen_response = input.response;
        }
      }
    }

    yield { type: "step", step: "action", status: "done" };

    yield {
      type: "result",
      data: { triage, policy, evidence, action_plan, citizen_response, internal_notes },
    };
  } catch (err) {
    yield { type: "error", message: err instanceof Error ? err.message : "Unknown error" };
  }
}
