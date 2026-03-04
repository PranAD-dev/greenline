import Anthropic from "@anthropic-ai/sdk";

export interface DataPoint {
  source: string;
  value: string;
  date: string;
  relevance: string;
  url?: string;
}

export interface EvidenceResult {
  data_points: DataPoint[];
  summary: string;
}

const OPEN_DATA_BY_CATEGORY: Record<string, DataPoint[]> = {
  emissions: [
    {
      source: "EPA Air Quality Index — Downtown Monitor",
      value: "AQI 68 (Moderate) — PM2.5: 14.2 µg/m³",
      date: "2026-03-01",
      relevance: "Current air quality conditions in the area of concern",
      url: "https://www.airnow.gov/",
    },
    {
      source: "City GHG Inventory (2025 Annual Report)",
      value: "Transportation: 38% of emissions | Buildings: 31% | Industry: 22% | Waste: 9%",
      date: "2025-12-31",
      relevance: "Citywide emissions breakdown by sector",
    },
    {
      source: "State Environmental Agency — Construction Emissions Data",
      value: "Construction sector emits avg 4.7 lbs CO2e per $1,000 project value in region",
      date: "2025-09-15",
      relevance: "Benchmark for construction site emissions compliance",
    },
  ],
  energy: [
    {
      source: "City Utility — Monthly Generation Report",
      value: "Current renewable mix: 62% (wind 38%, solar 18%, hydro 6%)",
      date: "2026-02-01",
      relevance: "Current renewable energy grid status",
    },
    {
      source: "NREL Solar Resource Map",
      value: "City receives avg 4.8 peak sun hours/day — top 35th percentile nationally",
      date: "2025-01-01",
      relevance: "Solar resource potential for rooftop installations",
    },
    {
      source: "DOE State Energy Office",
      value: "Commercial solar payback period: avg 7.2 years; residential: 8.4 years (with IRA incentives)",
      date: "2025-11-01",
      relevance: "Economic case for solar expansion program",
    },
  ],
  "green-infrastructure": [
    {
      source: "Urban Forestry Division — Tree Inventory Update",
      value: "22.1% canopy coverage citywide; 12 neighborhoods below 15% threshold",
      date: "2025-10-01",
      relevance: "Current tree canopy baseline and priority areas",
    },
    {
      source: "EPA Urban Heat Island Monitor",
      value: "City core is 6.2°F warmer than surrounding rural areas on avg summer days",
      date: "2025-08-15",
      relevance: "Urban heat island severity driving need for tree canopy expansion",
    },
    {
      source: "Stormwater Management Report (2025)",
      value: "Green infrastructure reduced CSO overflow events by 23% since 2020; 847 bioretention cells installed",
      date: "2025-12-01",
      relevance: "Documented effectiveness of green infrastructure investment",
    },
  ],
  transport: [
    {
      source: "DOT Active Transportation Dashboard",
      value: "89 miles protected lanes installed (2031 target: 200 miles); bike mode share: 4.2%",
      date: "2026-01-15",
      relevance: "Current bicycle infrastructure progress",
    },
    {
      source: "EV Registration Database",
      value: "14.3% EV penetration (43,200 EVs registered); 487 public chargers operational",
      date: "2026-02-01",
      relevance: "Current EV adoption and charging infrastructure status",
    },
    {
      source: "Transit Authority Fleet Report",
      value: "Electric bus fleet: 34/320 buses (10.6%); 2 electric depots operational",
      date: "2025-12-31",
      relevance: "Municipal fleet electrification progress",
    },
  ],
  buildings: [
    {
      source: "Building Energy Benchmarking Database",
      value: "2,847 buildings reported; median Energy Use Intensity: 68 kBtu/sq ft; 31% below target",
      date: "2025-12-31",
      relevance: "Building energy performance across city portfolio",
    },
    {
      source: "Residential Retrofit Fund — Annual Report 2025",
      value: "1,180 homes retrofitted in 2025; avg energy savings 38%; 67% income-qualified",
      date: "2025-12-31",
      relevance: "Retrofit program performance and equity metrics",
    },
    {
      source: "State Weatherization Assistance Program",
      value: "Average home envelope retrofit reduces heating energy by 25-35%; cost $4,200-8,600",
      date: "2025-06-01",
      relevance: "Retrofit cost and energy savings benchmarks",
    },
  ],
  waste: [
    {
      source: "Department of Sanitation — Waste Stream Report Q4 2025",
      value: "Diversion rate: 67.3%; Recycling: 31%, Composting: 18%, Landfill: 32.7%",
      date: "2025-12-31",
      relevance: "Current waste diversion performance by stream",
    },
    {
      source: "Organics Collection Program — Expansion Status",
      value: "1,247 commercial accounts enrolled; estimated 8,400 tons/year diverted",
      date: "2026-01-01",
      relevance: "Commercial organics program growth and impact",
    },
    {
      source: "EPA WasteWise Benchmark",
      value: "Cities with 90%+ diversion typically require mandatory composting + construction debris recycling",
      date: "2025-03-01",
      relevance: "Policy requirements to reach 90% diversion target",
    },
  ],
  water: [
    {
      source: "Water & Sewer Department — Demand Report",
      value: "Per-capita water use: 87 gallons/day (down 12% from 2020); leak rate: 8.2%",
      date: "2025-12-31",
      relevance: "Water conservation progress and infrastructure condition",
    },
  ],
};

export async function gatherEvidence(category: string, query: string): Promise<EvidenceResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const dataPoints = OPEN_DATA_BY_CATEGORY[category] || OPEN_DATA_BY_CATEGORY["emissions"];

  if (!apiKey || apiKey === "your-key-here") {
    return {
      data_points: dataPoints,
      summary: `Retrieved ${dataPoints.length} data points from city and federal open data sources for ${category} category.`,
    };
  }

  const client = new Anthropic({ apiKey });

  const tools: Anthropic.Tool[] = [
    {
      name: "fetch_open_data",
      description: "Fetch relevant open data points from city databases and EPA sources for a given category",
      input_schema: {
        type: "object" as const,
        properties: {
          category: {
            type: "string",
            enum: ["emissions", "energy", "green-infrastructure", "transport", "buildings", "waste", "water"],
          },
          specific_metrics: {
            type: "array",
            items: { type: "string" },
            description: "Specific metrics or data types needed",
          },
        },
        required: ["category"],
      },
    },
  ];

  let foundData = dataPoints;
  let summary = "";

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 512,
    system: `You are an evidence gathering agent. Fetch relevant open data to support policy analysis for a city sustainability case.`,
    messages: [
      {
        role: "user",
        content: `Gather evidence for a ${category} case: "${query}"`,
      },
    ],
    tools,
  });

  for (const block of response.content) {
    if (block.type === "tool_use" && block.name === "fetch_open_data") {
      const input = block.input as { category: string };
      foundData = OPEN_DATA_BY_CATEGORY[input.category] || dataPoints;
    }
    if (block.type === "text") {
      summary = block.text;
    }
  }

  return {
    data_points: foundData,
    summary: summary || `Retrieved ${foundData.length} relevant data points.`,
  };
}
