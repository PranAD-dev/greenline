import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { GlobeLocation } from "@/lib/agents/globe";

// Bay Area fallback locations per category (used when no API key)
const CATEGORY_LOCATIONS: Record<string, GlobeLocation[]> = {
  emissions: [
    { id: "richmond", name: "Richmond, CA", country: "United States", lat: 37.9358, lng: -122.3478, impactType: "negative", summary: "Chevron refinery faces accelerated compliance costs under tightened emissions rules", explanation: "Richmond's Chevron refinery is the largest stationary emissions source in the Bay Area. Tightened industrial emissions standards increase compliance costs by ~$180M and accelerate the refinery's timeline to reduce flaring by 40% by 2028.", policyClauses: ["§2.4 Industrial Emissions Compliance"] },
    { id: "san-jose-downtown", name: "Downtown San José", country: "United States", lat: 37.3382, lng: -121.8863, impactType: "positive", summary: "Tech campus emission mandates drive $2.1B in building decarbonization", explanation: "San José's dense tech corridor — home to Adobe, Cisco, and Samsung campuses — is the largest source of commercial building emissions in Santa Clara County. The emissions standard accelerates retrofits across 14M sq ft of office space, cutting scope 1 & 2 emissions by 35% by 2030.", policyClauses: ["§2.1 Citywide Carbon Neutrality"] },
    { id: "fremont", name: "Fremont, CA", country: "United States", lat: 37.5485, lng: -121.9886, impactType: "positive", summary: "Tesla Fremont factory transitions to 100% renewable power under new mandate", explanation: "The Tesla Fremont plant produces 550,000 EVs/year and is Fremont's largest electricity consumer. The accelerated clean energy mandate requires on-site renewable procurement, triggering a $340M solar + battery investment that makes the factory grid-positive during daylight hours.", policyClauses: ["§2.1 Citywide Carbon Neutrality", "§4.1 Renewable Portfolio Standard"] },
    { id: "east-palo-alto", name: "East Palo Alto, CA", country: "United States", lat: 37.4689, lng: -122.1411, impactType: "mixed", summary: "Frontline community gains air quality benefits but risks green gentrification", explanation: "East Palo Alto, a low-income community surrounded by Palo Alto and Menlo Park, has disproportionately high asthma rates from Highway 101 traffic. The emissions reduction lever improves local air quality but also raises property values, accelerating displacement pressure on the 30,000 residents.", policyClauses: ["§2.7 Construction Site Emissions Standards"] },
    { id: "san-francisco-port", name: "Port of San Francisco", country: "United States", lat: 37.7955, lng: -122.3937, impactType: "positive", summary: "Shore power mandate eliminates cruise ship idling emissions at Pier 27", explanation: "Cruise ships idling at Pier 27 emit diesel particulates equivalent to 72,000 cars per visit. The accelerated shore power mandate requires all vessels to plug into grid power while docked — eliminating an estimated 4,200 tonnes of NOx annually from the Embarcadero waterfront.", policyClauses: ["§2.4 Industrial Emissions Compliance"] },
  ],
  energy: [
    { id: "san-jose-solar", name: "East San José, CA", country: "United States", lat: 37.3496, lng: -121.8305, impactType: "positive", summary: "Community solar closes 180 MW gap in low-income neighborhoods", explanation: "East San José has the highest solar potential in the county but the lowest adoption rate — only 4% of eligible rooftops — due to renter and language barriers. The accelerated solar incentive closes a 180 MW installation gap, reducing household electricity bills by $720/year for 48,000 families.", policyClauses: ["§4.5 Rooftop Solar Expansion"] },
    { id: "san-jose-airport", name: "Mineta San José Airport Area", country: "United States", lat: 37.3639, lng: -121.9289, impactType: "positive", summary: "Airport microgrid expansion adds 85 MW of on-site solar + storage", explanation: "The SJC airport complex and adjacent industrial zone consumes 12% of San José's commercial electricity. The renewable mandate triggers an 85 MW solar canopy over parking structures and a 40 MWh battery system, making the complex 70% self-sufficient and selling excess power back to the grid.", policyClauses: ["§4.3 Municipal Buildings Net-Zero Energy", "§4.5 Rooftop Solar Expansion"] },
    { id: "san-francisco-bayview", name: "Bayview-Hunters Point, SF", country: "United States", lat: 37.7317, lng: -122.3863, impactType: "positive", summary: "Decommissioned power plant site converted to 60 MW community solar farm", explanation: "The former Hunters Point Power Plant site — a Superfund-adjacent brownfield — is redeveloped as a 60 MW community solar facility under the accelerated renewable mandate. The project provides electricity at 15% below market rate to 22,000 Bayview households, one of SF's most pollution-burdened communities.", policyClauses: ["§4.1 Renewable Portfolio Standard", "§4.5 Rooftop Solar Expansion"] },
    { id: "santa-clara-pge", name: "Santa Clara, CA", country: "United States", lat: 37.3541, lng: -121.9552, impactType: "mixed", summary: "Silicon Valley Power grid transition accelerates but increases short-term rate pressure", explanation: "Santa Clara operates its own municipal utility (Silicon Valley Power), which already sources 40% renewables. The accelerated mandate requires 80% by 2028, requiring $420M in new procurement contracts. Short-term rate increases of 8–12% create affordability pressure for small businesses in the city's industrial corridor.", policyClauses: ["§4.1 Renewable Portfolio Standard"] },
    { id: "palo-alto-energy", name: "Palo Alto, CA", country: "United States", lat: 37.4419, lng: -122.143, impactType: "positive", summary: "First Bay Area city to reach 100% carbon-free electricity under accelerated timeline", explanation: "Palo Alto Utilities already sources 72% carbon-free power and is positioned to reach 100% two years ahead of schedule under the accelerated mandate. The city becomes a proof-of-concept that attracts $85M in state incentive funds and positions its municipal utility model for replication in 12 neighboring cities.", policyClauses: ["§4.1 Renewable Portfolio Standard", "§4.3 Municipal Buildings Net-Zero Energy"] },
  ],
  "green-infrastructure": [
    { id: "east-palo-alto-trees", name: "East Palo Alto, CA", country: "United States", lat: 37.4689, lng: -122.1411, impactType: "positive", summary: "Urban heat island relief through 12,000 new street trees in equity priority zone", explanation: "East Palo Alto has 6% tree canopy coverage versus Palo Alto's 28% directly across Highway 101. The accelerated urban forestry program plants 12,000 trees prioritized in the hottest census tracts, reducing peak summer temperatures by 3.8°F and cutting cooling energy costs by $2.4M/year for low-income residents.", policyClauses: ["§6.1 Urban Forestry Expansion"] },
    { id: "coyote-creek", name: "Coyote Creek Corridor, San José", country: "United States", lat: 37.298, lng: -121.845, impactType: "positive", summary: "Creek restoration adds 8.4 miles of green corridor reducing flood risk for 14,000 homes", explanation: "Coyote Creek flooded 14,000 homes in 2017. The accelerated green infrastructure mandate funds restoration of 8.4 miles of riparian corridor with native vegetation, reducing peak floodwater velocity by 22% and creating a contiguous wildlife corridor from Alum Rock Park to the Bay.", policyClauses: ["§6.5 Green Infrastructure Standards", "§6.1 Urban Forestry Expansion"] },
    { id: "embarcadero-sf", name: "Embarcadero Waterfront, SF", country: "United States", lat: 37.7955, lng: -122.3937, impactType: "positive", summary: "Living shoreline pilot protects $4.2B in waterfront real estate from sea level rise", explanation: "SF's Embarcadero faces 1.1m sea level rise by 2070. The green infrastructure mandate funds a 2.3-mile living shoreline pilot using oyster reefs, tidal marshes, and biodiverse breakwaters — providing more resilient flood protection than seawalls at 40% lower lifecycle cost while sequestering 8,400 tonnes CO₂/year.", policyClauses: ["§6.5 Green Infrastructure Standards"] },
    { id: "san-jose-guadalupe", name: "Guadalupe River Park, San José", country: "United States", lat: 37.3348, lng: -121.8937, impactType: "positive", summary: "Park expansion doubles green canopy in downtown core; reduces stormwater runoff 30%", explanation: "The Guadalupe River Park expansion adds 42 acres of urban forest and bioswales through downtown San José — doubling the green canopy in the city center. The green infrastructure reduces combined sewer overflow events by 30% and cuts downtown temperatures by 2.6°F on 90°F+ days.", policyClauses: ["§6.1 Urban Forestry Expansion", "§6.5 Green Infrastructure Standards"] },
    { id: "san-mateo-bay", name: "San Mateo Bayfront, CA", country: "United States", lat: 37.5631, lng: -122.2622, impactType: "mixed", summary: "Tidal marsh restoration conflicts with 3 approved waterfront development projects", explanation: "San Mateo's 340-acre bayfront tidal marsh restoration would sequester 28,000 tonnes CO₂/year and provide habitat for 45 at-risk bird species. However, the program requires renegotiation of 3 approved mixed-use development agreements worth $1.2B, creating a tension between climate infrastructure and housing production goals.", policyClauses: ["§6.5 Green Infrastructure Standards", "§6.3 Tree Protection Ordinance"] },
  ],
  transport: [
    { id: "san-jose-bike", name: "San José Bike Network", country: "United States", lat: 37.3382, lng: -121.8863, impactType: "positive", summary: "Protected lane buildout adds 38 miles targeting the Almaden–Downtown corridor", explanation: "San José's bike network has a critical gap between the dense Almaden Valley residential area and downtown employment centers. The accelerated bike infrastructure lever funds 38 miles of protected lanes along the Guadalupe River Trail and Capitol Expressway corridor, projected to add 22,000 daily cycling trips by 2027.", policyClauses: ["§5.6 Protected Bicycle Network Buildout"] },
    { id: "caltrain-corridor", name: "Caltrain Corridor (SF–SJ)", country: "United States", lat: 37.5534, lng: -122.2891, impactType: "positive", summary: "Electrification complete; EV charging hubs at 6 stations serve 14M passengers/year", explanation: "Caltrain's electrification eliminated 110,000 gallons/day of diesel consumption. The transport lever builds on this by adding EV charging hubs at 6 major stations (SF, Millbrae, Redwood City, Palo Alto, Mountain View, San José Diridon) — serving 14M annual passengers and anchoring last-mile EV adoption in station neighborhoods.", policyClauses: ["§5.2 EV Charging Infrastructure Mandate", "§5.4 Municipal Fleet Electrification"] },
    { id: "east-bay-ev", name: "Oakland & Alameda EV Corridors", country: "United States", lat: 37.8044, lng: -122.2712, impactType: "positive", summary: "Port of Oakland truck fleet electrification cuts drayage emissions by 45%", explanation: "The Port of Oakland moves 2.4M TEUs/year using 1,800 diesel drayage trucks. The EV fleet mandate converts 600 trucks to electric by 2027 — reducing diesel particulates in West Oakland (one of CA's most pollution-burdened zip codes) by 45% and qualifying the port for $220M in federal clean ports funding.", policyClauses: ["§5.4 Municipal Fleet Electrification", "§5.2 EV Charging Infrastructure Mandate"] },
    { id: "vta-fleet", name: "VTA Bus Fleet, Santa Clara County", country: "United States", lat: 37.3318, lng: -121.8905, impactType: "positive", summary: "Full electric bus fleet achieved 2 years ahead of schedule", explanation: "VTA operates 1,040 buses across Santa Clara County. The accelerated fleet electrification lever provides $180M in additional funding to complete the transition to electric buses by 2026 — two years ahead of the baseline timeline — eliminating 28M lbs of CO₂/year and reducing operating costs by $12M annually through lower fuel and maintenance expenses.", policyClauses: ["§5.4 Municipal Fleet Electrification"] },
    { id: "highway-101-corridor", name: "Highway 101 / El Camino Real", country: "United States", lat: 37.4148, lng: -122.0688, impactType: "mixed", summary: "EV mandate accelerates adoption but reveals charging desert in dense apartment zones", explanation: "The 101/El Camino corridor is the Bay Area's densest EV ownership zone, but 68% of residents live in apartments without dedicated parking. The EV mandate accelerates public charger deployment but surfaces a structural gap: 120,000 apartment-dwelling potential EV owners in the corridor lack a viable overnight charging solution, requiring a $45M curbside charging program.", policyClauses: ["§5.2 EV Charging Infrastructure Mandate"] },
  ],
  buildings: [
    { id: "san-jose-downtown-b", name: "Downtown San José Office District", country: "United States", lat: 37.3382, lng: -121.8863, impactType: "positive", summary: "22 office towers complete deep energy retrofits under accelerated performance standard", explanation: "Downtown San José's commercial office stock — 8.4M sq ft built predominantly 1985–2005 — is 40% less efficient than current code. The accelerated building performance standard requires 22 towers over 100,000 sq ft to complete deep retrofits by 2028, cutting commercial building emissions by 31% and generating 2,800 construction jobs in Santa Clara County.", policyClauses: ["§3.1 Existing Building Performance Standards"] },
    { id: "san-francisco-residential", name: "Mission District, San Francisco", country: "United States", lat: 37.759, lng: -122.4148, impactType: "mixed", summary: "Gas appliance ban accelerates induction adoption but creates retrofit cost burden", explanation: "The Mission District's 42,000 rental units — largely owned by small landlords — face the highest retrofit burden from the gas appliance ban under the accelerated standard. Induction stove and heat pump water heater requirements add $4,200 per unit in upgrade costs, with only 35% covered by available rebates, creating a compliance affordability gap for 12,000 low-income households.", policyClauses: ["§3.4 Residential Retrofit Incentive Program"] },
    { id: "palo-alto-commercial", name: "Stanford Research Park, Palo Alto", country: "United States", lat: 37.4064, lng: -122.1474, impactType: "positive", summary: "Tech campus net-zero mandates pioneer prefab retrofit methods for 6M sq ft", explanation: "Stanford Research Park's 150 buildings represent one of the densest concentrations of commercial space in the Bay Area. The building performance standard accelerates deep retrofits across 6M sq ft, with Stanford and tenant companies co-developing prefabricated HVAC replacement modules that reduce retrofit time from 6 months to 3 weeks — creating an exportable methodology.", policyClauses: ["§3.1 Existing Building Performance Standards", "§4.3 Municipal Buildings Net-Zero Energy"] },
    { id: "east-san-jose-residential", name: "East San José Residential Zones", country: "United States", lat: 37.3496, lng: -121.8305, impactType: "positive", summary: "Retrofit incentive program reaches 8,400 low-income households with full-cost coverage", explanation: "East San José's residential stock — primarily 1960s–1980s single-family homes — has the worst energy performance in the county. The residential retrofit incentive program is expanded under this lever to offer 100% cost coverage for households below 80% AMI, reaching 8,400 homes and reducing energy costs by $840/year per family while cutting residential emissions by 18%.", policyClauses: ["§3.4 Residential Retrofit Incentive Program"] },
    { id: "mountain-view-b", name: "North Bayshore, Mountain View", country: "United States", lat: 37.4195, lng: -122.0853, impactType: "positive", summary: "Google campus net-zero mandate sets new standard for large tech campuses", explanation: "Google's 3.1M sq ft North Bayshore campus consumes 8% of Mountain View's total electricity. The building performance standard requires net-zero operations by 2027, triggering $280M in on-site solar, geothermal heat pumps, and battery storage — making North Bayshore the largest net-zero commercial district in California.", policyClauses: ["§3.1 Existing Building Performance Standards", "§4.7 Solar-Ready Building Standards"] },
  ],
  waste: [
    { id: "sf-waste", name: "Recology SF Processing, San Francisco", country: "United States", lat: 37.7353, lng: -122.4105, impactType: "positive", summary: "Mandatory food scrap composting closes SF's final 12% waste diversion gap", explanation: "San Francisco reaches 78% waste diversion but has stalled due to multi-family and restaurant food scrap non-compliance. The accelerated waste mandate enforces composting in 4,200 restaurants and 11,000 apartment buildings, closing the final 12% gap and enabling SF to shutter its last remaining transfer station by 2030.", policyClauses: ["§7.1 Zero Waste Strategy"] },
    { id: "san-jose-waste", name: "Zanker Road MRF, San José", country: "United States", lat: 37.4094, lng: -121.9378, impactType: "positive", summary: "Materials recovery facility expansion processes 200 additional tonnes/day", explanation: "The Zanker Road MRF is Santa Clara County's primary sorting facility. The waste diversion mandate funds a $42M expansion adding optical sorting robots and a textile recovery line — increasing throughput by 200 tonnes/day and capturing $18M/year in secondary materials revenue that currently goes to landfill.", policyClauses: ["§7.1 Zero Waste Strategy"] },
    { id: "palo-alto-zero-waste", name: "Palo Alto Zero Waste Program", country: "United States", lat: 37.4419, lng: -122.143, impactType: "positive", summary: "Zero waste pilot achieves 92% diversion; becomes statewide replication model", explanation: "Palo Alto's zero waste program leads the Bay Area at 81% diversion. The accelerated mandate provides $8M to close the final gap through commercial food scrap enforcement and a reuse center expansion — reaching 92% diversion and triggering AB 1826 compliance credits worth $3.2M to the city.", policyClauses: ["§7.1 Zero Waste Strategy", "§7.3 Single-Use Plastics Reduction"] },
    { id: "east-bay-waste", name: "West Oakland, CA", country: "United States", lat: 37.8124, lng: -122.2978, impactType: "mixed", summary: "Transfer station closure reduces truck traffic but displaces informal recyclers", explanation: "West Oakland's Waste Management transfer station processes 1,200 tonnes/day of Bay Area waste, generating 800 diesel truck trips through residential neighborhoods daily. The waste diversion mandate reduces throughput by 40%, cutting truck traffic significantly — but the reduction in recyclable material flow eliminates livelihoods for 340 informal recyclers who work the station.", policyClauses: ["§7.1 Zero Waste Strategy", "§7.3 Single-Use Plastics Reduction"] },
    { id: "fremont-anaerobic", name: "Fremont Anaerobic Digester", country: "United States", lat: 37.5485, lng: -121.9886, impactType: "positive", summary: "New food waste digester generates 12 MW of biogas for 9,000 homes", explanation: "Fremont's new anaerobic digestion facility — funded under the accelerated waste mandate — processes 180 tonnes/day of food scraps from Alameda County's restaurants and grocers. The facility generates 12 MW of biogas-powered electricity for 9,000 homes and produces 28,000 tonnes/year of compost for East Bay agriculture.", policyClauses: ["§7.1 Zero Waste Strategy"] },
  ],
};

export async function POST(request: NextRequest) {
  try {
    const { targetId, category, label, lever, change_pct } = await request.json();

    if (!category) {
      return NextResponse.json({ error: "category is required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // No API key → return pre-built locations for this category
    if (!apiKey || apiKey === "your-key-here") {
      const locations = CATEGORY_LOCATIONS[category] || CATEGORY_LOCATIONS["emissions"];
      return NextResponse.json({ locations });
    }

    // With API key → ask Claude to generate location-specific impact for this exact simulation
    const client = new Anthropic({ apiKey });

    const tools: Anthropic.Tool[] = [
      {
        name: "extract_policy_locations",
        description: "Return geographic locations affected by this specific policy simulation",
        input_schema: {
          type: "object" as const,
          properties: {
            locations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  country: { type: "string" },
                  lat: { type: "number" },
                  lng: { type: "number" },
                  impactType: { type: "string", enum: ["positive", "negative", "mixed", "neutral"] },
                  summary: { type: "string" },
                  explanation: { type: "string" },
                  policyClauses: { type: "array", items: { type: "string" } },
                },
                required: ["id", "name", "country", "lat", "lng", "impactType", "summary", "explanation", "policyClauses"],
              },
            },
          },
          required: ["locations"],
        },
      },
    ];

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: `You are a climate policy analyst for the Silicon Valley / San Francisco Bay Area. Given a policy simulation, identify exactly 5 specific neighborhoods, cities, or districts within the Bay Area (Santa Clara County, San Mateo County, Alameda County, San Francisco, Contra Costa County) that are most affected by this policy lever. Use precise lat/lng coordinates for each location. Keep explanations concise (2-3 sentences max).`,
      messages: [{
        role: "user",
        content: `Policy: "${label}" | Lever: "${lever?.replace("X%", `${change_pct}%`)}" | Category: ${category}

Return 5 Bay Area locations most affected. Be specific — name the exact neighborhood or district, not just "San Jose".`,
      }],
      tools,
    });

    for (const block of response.content) {
      if (block.type === "tool_use" && block.name === "extract_policy_locations") {
        const input = block.input as { locations: GlobeLocation[] };
        return NextResponse.json({ locations: input.locations });
      }
    }

    // Fallback to pre-built
    const locations = CATEGORY_LOCATIONS[category] || CATEGORY_LOCATIONS["emissions"];
    return NextResponse.json({ locations });

  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to get locations" },
      { status: 500 }
    );
  }
}
