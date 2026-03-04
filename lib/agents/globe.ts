import Anthropic from "@anthropic-ai/sdk";

export interface GlobeLocation {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  impactType: "positive" | "negative" | "mixed" | "neutral";
  summary: string;
  explanation: string;
  policyClauses: string[];
}

const MOCK_LOCATIONS: GlobeLocation[] = [
  {
    id: "new-york",
    name: "New York, USA",
    country: "United States",
    lat: 40.7128,
    lng: -74.006,
    impactType: "positive",
    summary: "Emissions reduction targets aligned with NYC Green New Deal",
    explanation:
      "The policy's 50% emissions reduction mandate by 2035 directly supports New York's Local Law 97, which requires large buildings to reduce carbon emissions or face significant fines. The city's existing clean energy infrastructure and renewable procurement agreements position it well to meet these targets. Estimated benefit: $2.4B in avoided climate damages through 2040.",
    policyClauses: ["§2.1 Citywide Carbon Neutrality", "§4.1 Renewable Portfolio Standard"],
  },
  {
    id: "jakarta",
    name: "Jakarta, Indonesia",
    country: "Indonesia",
    lat: -6.2088,
    lng: 106.8456,
    impactType: "negative",
    summary: "Sea level rise risk exceeds policy adaptation funding",
    explanation:
      "Jakarta faces severe negative exposure under current policy projections. The city is sinking 25cm/year while sea levels rise — existing adaptation funding allocated under this policy covers less than 30% of required flood infrastructure. Without accelerated investment in coastal barriers and managed retreat programs, 2.5 million residents face displacement risk by 2040.",
    policyClauses: ["§6.5 Green Infrastructure Standards"],
  },
  {
    id: "nairobi",
    name: "Nairobi, Kenya",
    country: "Kenya",
    lat: -1.2921,
    lng: 36.8219,
    impactType: "positive",
    summary: "Reforestation grants unlock $180M for urban canopy expansion",
    explanation:
      "The policy's urban forestry provisions create a direct funding pathway for Nairobi's 30% canopy coverage target. The reforestation grant program, combined with carbon credit mechanisms enabled by this policy, is projected to generate $180M in funding for tree planting in peri-urban zones. This will reduce urban temperatures by 2.3°C and improve air quality for 4.2 million residents.",
    policyClauses: ["§6.1 Urban Forestry Expansion", "§6.3 Tree Protection Ordinance"],
  },
  {
    id: "mumbai",
    name: "Mumbai, India",
    country: "India",
    lat: 19.076,
    lng: 72.8777,
    impactType: "mixed",
    summary: "Building retrofit programs benefit residents; coal transition creates job losses",
    explanation:
      "Mumbai faces a mixed impact. The building energy retrofit mandate (§3.1) will reduce cooling energy demand by an estimated 28% — significant in a city experiencing 50+ heat days annually. However, the rapid coal phase-out provisions threaten 340,000 jobs in the Dharavi informal manufacturing sector, where alternative employment pathways have not been adequately funded in the current policy framework.",
    policyClauses: ["§3.1 Building Performance Standards", "§5.4 Municipal Fleet Electrification"],
  },
  {
    id: "rotterdam",
    name: "Rotterdam, Netherlands",
    country: "Netherlands",
    lat: 51.9244,
    lng: 4.4777,
    impactType: "positive",
    summary: "Green stormwater infrastructure mandate aligns with Delta Programme",
    explanation:
      "Rotterdam's advanced climate adaptation infrastructure makes it a prime beneficiary of this policy's green stormwater provisions. The mandatory bioretention and permeable surface requirements (§6.5) align precisely with Rotterdam's existing Water Squares program and will unlock €340M in EU co-funding. The port city's experience managing below-sea-level infrastructure positions it as a global implementation model.",
    policyClauses: ["§6.5 Green Infrastructure Standards", "§2.1 Citywide Carbon Neutrality"],
  },
  {
    id: "sao-paulo",
    name: "São Paulo, Brazil",
    country: "Brazil",
    lat: -23.5505,
    lng: -46.6333,
    impactType: "negative",
    summary: "Deforestation penalties may conflict with agricultural supply chain commitments",
    explanation:
      "São Paulo's status as Brazil's largest agricultural commodity trading hub creates tension with this policy's deforestation penalties. The compliance requirements impose significant costs on soy and beef supply chains routed through the city's port and processing infrastructure — estimated at $4.1B in additional compliance costs. Without a just transition framework for smallholder farmers, enforcement risks driving deforestation into unmonitored areas.",
    policyClauses: ["§7.3 Single-Use Plastics Reduction", "§7.1 Zero Waste Strategy"],
  },
  {
    id: "beijing",
    name: "Beijing, China",
    country: "China",
    lat: 39.9042,
    lng: 116.4074,
    impactType: "mixed",
    summary: "Coal phase-out accelerates air quality gains; transition pace creates economic risk",
    explanation:
      "Beijing's air quality crisis (annual PM2.5 averaging 35 µg/m³) means the coal phase-out provisions will deliver major public health benefits — estimated at 18,000 fewer premature deaths annually by 2035. However, the transition timeline is aggressive: China's northern grid still relies on coal for 72% of winter heating, and the policy's renewable substitution requirements outpace current grid infrastructure capacity.",
    policyClauses: ["§4.1 Renewable Portfolio Standard", "§2.4 Industrial Emissions Compliance"],
  },
  {
    id: "lagos",
    name: "Lagos, Nigeria",
    country: "Nigeria",
    lat: 6.5244,
    lng: 3.3792,
    impactType: "positive",
    summary: "Clean cooking and solar access provisions reach 4M households",
    explanation:
      "Lagos is a significant positive beneficiary through the policy's clean energy access provisions. The community solar program (§4.5) and clean cooking transition funding will reach an estimated 4 million households currently relying on charcoal and kerosene. This will reduce indoor air pollution — responsible for 98,000 annual deaths in Nigeria — and lower household energy costs by 40%. The policy creates a viable implementation pathway through existing mobile payment infrastructure.",
    policyClauses: ["§4.5 Rooftop Solar Expansion", "§4.7 Solar-Ready Building Standards"],
  },
];

const SAMPLE_POLICY_TEXT = `
RIVERSIDE CITY CLIMATE ACTION PLAN 2022

Section 2.1 — Citywide Carbon Neutrality Commitment
The City commits to achieving a 50% reduction in net greenhouse gas emissions by 2035, measured against the 2020 baseline of 4.2 million metric tons CO2e. This includes Scope 1 and Scope 2 emissions from all city operations and community-wide sources.

Section 4.1 — Renewable Portfolio Standard
The City's municipal utility shall procure electricity from renewable sources at increasing thresholds: 70% by 2026, 85% by 2030, and 100% by 2040.

Section 6.1 — Urban Forestry Expansion Program
Urban Forestry shall plant no fewer than 5,000 trees annually. Priority planting areas include neighborhoods below 15% canopy coverage.

Section 5.2 — EV Charging Infrastructure Mandate
New commercial parking facilities with >50 spaces must install EV-ready conduit in 20% of spaces, with Level 2 charging in 10% of spaces.
`;

export async function analyzePolicy(text: string): Promise<GlobeLocation[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-key-here") {
    return MOCK_LOCATIONS;
  }

  const client = new Anthropic({ apiKey });

  const tools: Anthropic.Tool[] = [
    {
      name: "extract_policy_locations",
      description:
        "Extract all geographic locations (cities, regions, countries) affected by this policy document, along with how each is impacted",
      input_schema: {
        type: "object" as const,
        properties: {
          locations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string", description: "kebab-case unique id" },
                name: { type: "string", description: "City or region name with country, e.g. 'Jakarta, Indonesia'" },
                country: { type: "string" },
                lat: { type: "number" },
                lng: { type: "number" },
                impactType: {
                  type: "string",
                  enum: ["positive", "negative", "mixed", "neutral"],
                },
                summary: {
                  type: "string",
                  description: "One-sentence summary of the impact (shown on globe hover)",
                },
                explanation: {
                  type: "string",
                  description:
                    "2-3 paragraph explanation of how this policy affects this location — cite specific policy sections, quantify impacts where possible",
                },
                policyClauses: {
                  type: "array",
                  items: { type: "string" },
                  description: "Policy section references that apply to this location",
                },
              },
              required: ["id", "name", "country", "lat", "lng", "impactType", "summary", "explanation", "policyClauses"],
            },
            minItems: 4,
            maxItems: 15,
          },
        },
        required: ["locations"],
      },
    },
  ];

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    system: `You are a geopolitical policy analyst. Given a policy document, identify 6-12 specific cities or regions around the world that are materially affected by the policy's provisions. For each location, provide accurate latitude/longitude coordinates and a substantive explanation of how the policy impacts that place — positive, negative, or mixed. Be specific: cite policy sections, quantify impacts, reference local context.

If the policy is local (e.g., a city's climate plan), identify global cities that are analogous, partner cities, or part of the same supply chains/agreements. Always return real locations with accurate coordinates.`,
    messages: [
      {
        role: "user",
        content: `Analyze this policy document and extract affected geographic locations:\n\n${text.slice(0, 8000)}`,
      },
    ],
    tools,
  });

  for (const block of response.content) {
    if (block.type === "tool_use" && block.name === "extract_policy_locations") {
      const input = block.input as { locations: GlobeLocation[] };
      return input.locations;
    }
  }

  return MOCK_LOCATIONS;
}

export { SAMPLE_POLICY_TEXT };
