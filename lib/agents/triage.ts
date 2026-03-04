import Anthropic from "@anthropic-ai/sdk";

export interface TriageResult {
  category: string;
  urgency: number;
  department: string;
  summary: string;
  reasoning: string;
}

const CATEGORIES = [
  "emissions",
  "energy",
  "green-infrastructure",
  "transport",
  "buildings",
  "waste",
  "water",
];

const DEPARTMENT_MAP: Record<string, string> = {
  emissions: "Office of Climate Action",
  energy: "Department of Energy & Environment",
  "green-infrastructure": "Parks & Recreation / Urban Forestry",
  transport: "Department of Transportation",
  buildings: "Department of Buildings",
  waste: "Department of Sanitation",
  water: "Department of Water & Sewer",
};

function mockTriage(text: string): TriageResult {
  const lower = text.toLowerCase();
  let category = "emissions";
  if (lower.includes("tree") || lower.includes("park") || lower.includes("canopy") || lower.includes("flood") || lower.includes("stormwater")) {
    category = "green-infrastructure";
  } else if (lower.includes("solar") || lower.includes("energy") || lower.includes("electric") || lower.includes("renewable")) {
    category = "energy";
  } else if (lower.includes("bike") || lower.includes("ev") || lower.includes("charging") || lower.includes("bus") || lower.includes("transit") || lower.includes("traffic")) {
    category = "transport";
  } else if (lower.includes("building") || lower.includes("boiler") || lower.includes("retrofit") || lower.includes("insulation")) {
    category = "buildings";
  } else if (lower.includes("waste") || lower.includes("recycl") || lower.includes("compost") || lower.includes("landfill") || lower.includes("plastic")) {
    category = "waste";
  } else if (lower.includes("water") || lower.includes("sewage") || lower.includes("drain")) {
    category = "water";
  }

  const urgency = lower.includes("health") || lower.includes("hospital") || lower.includes("emergency") || lower.includes("danger") ? 5
    : lower.includes("months") || lower.includes("weeks") || lower.includes("permit") ? 4
    : lower.includes("broken") || lower.includes("violation") ? 3
    : 2;

  return {
    category,
    urgency,
    department: DEPARTMENT_MAP[category],
    summary: text.slice(0, 120) + (text.length > 120 ? "..." : ""),
    reasoning: `Classified as ${category} based on keyword analysis. Urgency ${urgency}/5 due to ${urgency >= 4 ? "health or compliance implications" : "operational impact"}.`,
  };
}

export async function triageCase(text: string): Promise<TriageResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-key-here") {
    return mockTriage(text);
  }

  const client = new Anthropic({ apiKey });

  const tools: Anthropic.Tool[] = [
    {
      name: "classify_case",
      description: "Classify a civic report into a sustainability category and assign urgency",
      input_schema: {
        type: "object" as const,
        properties: {
          category: {
            type: "string",
            enum: CATEGORIES,
            description: "The primary sustainability category of the issue",
          },
          urgency: {
            type: "number",
            description: "Urgency score 1-5 (5=immediate health/safety risk, 1=low-priority request)",
          },
          department: {
            type: "string",
            description: "Responsible city department",
          },
          summary: {
            type: "string",
            description: "One-sentence summary of the issue (max 150 chars)",
          },
          reasoning: {
            type: "string",
            description: "Brief explanation of classification rationale",
          },
        },
        required: ["category", "urgency", "department", "summary", "reasoning"],
      },
    },
    {
      name: "check_priority_rules",
      description: "Check if any priority escalation rules apply (health impacts, vulnerable populations, repeat reports)",
      input_schema: {
        type: "object" as const,
        properties: {
          escalate: { type: "boolean" },
          reason: { type: "string" },
          adjusted_urgency: { type: "number" },
        },
        required: ["escalate", "reason"],
      },
    },
  ];

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    system: `You are a triage agent for a city sustainability office. Your job is to classify incoming citizen reports and staff queries, assigning them to the correct department and urgency level.

Categories: emissions, energy, green-infrastructure, transport, buildings, waste, water
Urgency: 5=immediate health/safety, 4=compliance deadline/active violation, 3=service failure, 2=improvement request, 1=low priority info

Always use the classify_case tool, then check_priority_rules.`,
    messages: [{ role: "user", content: `Triage this report: "${text}"` }],
    tools,
  });

  let result: TriageResult = mockTriage(text);

  for (const block of response.content) {
    if (block.type === "tool_use" && block.name === "classify_case") {
      const input = block.input as TriageResult;
      result = {
        category: input.category,
        urgency: input.urgency,
        department: input.department || DEPARTMENT_MAP[input.category],
        summary: input.summary,
        reasoning: input.reasoning,
      };
    }
    if (block.type === "tool_use" && block.name === "check_priority_rules") {
      const input = block.input as { escalate: boolean; reason: string; adjusted_urgency?: number };
      if (input.escalate && input.adjusted_urgency) {
        result.urgency = input.adjusted_urgency;
        result.reasoning += ` Escalated: ${input.reason}`;
      }
    }
  }

  return result;
}
