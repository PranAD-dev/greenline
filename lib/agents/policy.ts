import Anthropic from "@anthropic-ai/sdk";
import clauses from "@/data/policy-clauses.json";
import targets from "@/data/policy-targets.json";

export interface PolicyClause {
  id: string;
  target_id: string;
  category: string;
  title: string;
  text: string;
  keywords: string[];
  authority: string;
}

export interface PolicyTarget {
  id: string;
  category: string;
  label: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: number;
  description: string;
  department: string;
  status: string;
}

export interface PolicyResult {
  clauses: PolicyClause[];
  applicable_targets: PolicyTarget[];
  summary: string;
}

function keywordSearch(query: string, category?: string): PolicyClause[] {
  const words = query.toLowerCase().split(/\s+/);
  return (clauses as PolicyClause[])
    .filter((c) => {
      if (category && c.category !== category) return false;
      const text = (c.title + " " + c.text + " " + c.keywords.join(" ")).toLowerCase();
      return words.some((w) => w.length > 3 && text.includes(w));
    })
    .slice(0, 4);
}

function getTargetsByCategory(category: string): PolicyTarget[] {
  return (targets as PolicyTarget[]).filter((t) => t.category === category);
}

export async function searchPolicy(query: string, category?: string): Promise<PolicyResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const matchedClauses = keywordSearch(query, category);
  const matchedTargets = category
    ? getTargetsByCategory(category)
    : (targets as PolicyTarget[]).filter((t) =>
        matchedClauses.some((c) => c.target_id === t.id)
      );

  if (!apiKey || apiKey === "your-key-here") {
    return {
      clauses: matchedClauses,
      applicable_targets: matchedTargets,
      summary: `Found ${matchedClauses.length} relevant policy clauses and ${matchedTargets.length} applicable targets for: "${query}".`,
    };
  }

  const client = new Anthropic({ apiKey });

  const tools: Anthropic.Tool[] = [
    {
      name: "search_policy_docs",
      description: "Search the city climate action plan for relevant policy clauses",
      input_schema: {
        type: "object" as const,
        properties: {
          query: { type: "string" },
          category: { type: "string" },
        },
        required: ["query"],
      },
    },
    {
      name: "get_target_by_category",
      description: "Get the current progress and targets for a given sustainability category",
      input_schema: {
        type: "object" as const,
        properties: {
          category: {
            type: "string",
            enum: ["emissions", "energy", "green-infrastructure", "transport", "buildings", "waste", "water"],
          },
        },
        required: ["category"],
      },
    },
  ];

  let foundClauses = matchedClauses;
  let foundTargets = matchedTargets;
  let summary = "";

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    system: `You are a policy research agent for a city sustainability office. Given a query or case context, identify the most relevant policy clauses and targets from the city's Climate Action Plan.

Use search_policy_docs to find relevant clauses, then get_target_by_category for applicable targets.`,
    messages: [
      {
        role: "user",
        content: `Find relevant policies for: "${query}"${category ? ` (category: ${category})` : ""}`,
      },
    ],
    tools,
  });

  for (const block of response.content) {
    if (block.type === "tool_use" && block.name === "search_policy_docs") {
      const input = block.input as { query: string; category?: string };
      foundClauses = keywordSearch(input.query, input.category);
    }
    if (block.type === "tool_use" && block.name === "get_target_by_category") {
      const input = block.input as { category: string };
      const catTargets = getTargetsByCategory(input.category);
      foundTargets = Array.from(new Map([...foundTargets, ...catTargets].map((t) => [t.id, t])).values());
    }
    if (block.type === "text") {
      summary = block.text;
    }
  }

  return {
    clauses: foundClauses,
    applicable_targets: foundTargets,
    summary: summary || `Found ${foundClauses.length} relevant policy clauses.`,
  };
}
