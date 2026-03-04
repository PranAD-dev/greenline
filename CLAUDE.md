# CLAUDE.md — Project: Greenline

## What This Is

Greenline is an agentic civic intelligence platform that helps city sustainability teams **track, analyze, and act on climate action plans**. Think: a city's climate pledges are ambitious PDFs — Greenline turns them into a live operational system with AI agents that triage citizen reports, pull real-time environmental data, simulate policy tradeoffs, and surface progress against hard targets.

This is a **1–2 day build**. Scope ruthlessly. Ship a polished, working product — not a half-built ambitious one.

---
// I dont have API keys rn
## Core Concept

Cities publish climate action plans with concrete targets (e.g., "50% emissions reduction by 2035", "30% tree canopy coverage by 2030", "100% renewable grid by 2040"). These plans sit in PDFs and nobody operationalizes them. Greenline does.

**The loop:** Citizen/staff input → AI triage → policy retrieval → evidence gathering → action recommendation → impact simulation → dashboard tracking.

---

## Architecture

### Stack
- **Frontend:** Next.js 14 (App Router) + Tailwind + shadcn/ui
- **Backend:** Next.js API routes (or FastAPI if you prefer — pick one, don't mix)
- **AI Layer:** Anthropic Claude API (tool-calling agents)
- **Database:** PostgreSQL via Supabase (or SQLite for speed)
- **Deployment:** Vercel (frontend) + Supabase (DB) — must be deployed, not localhost

### Key Directories
```
/app              → Next.js pages and layouts
/app/api          → API routes (agent endpoints, data endpoints)
/app/dashboard    → Analytics dashboard page
/app/chat         → Agent chat interface
/app/simulate     → Policy simulation page
/components       → Reusable UI components
/lib              → Agent logic, policy parsing, DB helpers
/lib/agents       → Individual agent definitions + tool schemas
/lib/policy       → Policy document ingestion + retrieval
/lib/simulation   → Forecasting models
/data             → Seed data: sample climate action plan, sample cases
/public           → Static assets, map tiles if needed
```

---

## Agents to Build

Build these as **tool-calling Claude agents** with clear system prompts and JSON tool schemas. Each agent is a focused function, not a monolith.

### 1. Triage Agent
- **Input:** citizen report or staff query (free text)
- **Output:** category (emissions, energy, transport, green infrastructure, waste, water), urgency score (1-5), suggested department
- **Tools:** `classify_case`, `check_priority_rules`

### 2. Policy Agent
- **Input:** a question or case context
- **Output:** relevant policy clauses with citations, applicable targets, deadlines
- **Tools:** `search_policy_docs`, `get_target_by_category`
- **How:** Pre-process the climate action plan into structured chunks (target, metric, deadline, responsible dept). Store in DB or JSON. Retrieval via keyword/semantic match.

### 3. Evidence Agent
- **Input:** a policy area or specific question
- **Output:** relevant real-world data points, recent news, open data stats
- **Tools:** `web_search` (Claude's built-in), `fetch_open_data`
- **Keep it simple:** Use web search or a couple of hardcoded API endpoints (e.g., EPA AQI, local open data portal). Don't over-engineer this.

### 4. Action Agent
- **Input:** triaged case + policy context + evidence
- **Output:** recommended actions (department-specific), draft citizen response, compliance notes
- **Tools:** `generate_action_plan`, `draft_response`
- **This is the orchestrator.** It calls the other agents' outputs and synthesizes.

### 5. Simulator Agent (stretch — build if time allows)
- **Input:** a policy lever (e.g., "increase solar incentive budget by 20%")
- **Output:** projected impact on targets (simple linear/proportional models are fine)
- **Keep models dead simple.** Progress % = current / target × 100. Rate = (target - current) / years remaining. That's enough.

---

## Dashboard

Single-page analytics view showing:

- **KPI cards** for each major target (emissions %, renewable %, canopy %, etc.) with current vs goal
- **Progress bars or gauges** — are we on track, behind, ahead?
- **Timeline chart** — projected trajectory vs required pace
- **Category breakdown** — which areas are lagging
- **Recent cases** — last 5-10 triaged items with status

Use **Recharts** for charts. Keep it clean — no chart spam. Every viz must tie to a real target from the policy doc.

---

## Sample Policy Data

Seed the app with a fictional but realistic climate action plan. Example targets:

| Category | Target | Deadline | Current |
|---|---|---|---|
| Emissions | -50% from 2020 baseline | 2035 | -18% |
| Renewable Energy | 100% clean grid | 2040 | 62% |
| Tree Canopy | 30% coverage | 2030 | 22% |
| EV Adoption | 50% of registered vehicles | 2035 | 14% |
| Building Retrofits | 10,000 buildings | 2033 | 3,200 |
| Waste Diversion | 90% diversion rate | 2032 | 67% |
| Bike Infrastructure | 200 miles protected lanes | 2031 | 89 miles |
| Solar Installation | 500 MW rooftop capacity | 2034 | 185 MW |

Store this as structured JSON in `/data/policy-targets.json`. The Policy Agent reads from this.

---

## Demo Flow (for reference)

1. **Open the app** — show the dashboard with live KPI tracking
2. **Submit a case** — e.g., "Residents on Oak Street are complaining about poor air quality near the new construction site"
3. **Watch the agent work** — triage → policy lookup → evidence fetch → action plan
4. **Show the recommendation** — specific, cited, actionable
5. **Show simulation** — "what if we accelerate the tree canopy program by 2 years?"
6. **Return to dashboard** — show how the case feeds into the bigger picture

---

## Design Principles

- **Ship > perfect.** If a feature isn't working in 2 hours, cut it.
- **Polish the edges.** Loading states, error handling, empty states, smooth transitions. These signal "this person ships production software."
- **Real data feel.** Use realistic numbers, realistic case text, realistic policy language. No "lorem ipsum" anywhere.
- **Cite everything.** When the agent references policy, show the clause. When it uses data, show the source. This is what makes it feel like a real tool vs a chatbot wrapper.
- **Mobile-responsive.** Dashboard should look good on desktop and tablet at minimum.

---

## What NOT to Build

- No auth/login system — waste of time for a demo
- No real database migrations — seed data is fine
- No 3D map unless you already have a Three.js setup ready to go — a clean 2D map or no map is better than a broken 3D one
- No multi-tenancy or org management
- No file upload for policy docs — hardcode the policy data
- No real PII handling — just mention it in the README as a production consideration

---

## Quality Bar

Before calling it done, check:
- [ ] Dashboard loads with real-looking data
- [ ] Chat/agent interface works end-to-end (input → triage → policy → action)
- [ ] At least 3 agents are functional with tool-calling
- [ ] Charts render correctly and tell a clear story
- [ ] No console errors, no broken layouts
