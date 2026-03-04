"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import targetsData from "@/data/policy-targets.json";
import SimulateForm from "@/components/simulate/SimulateForm";
import LocationPanel from "@/components/globe/LocationPanel";
import { FlaskConical, Globe } from "lucide-react";
import type { GlobeLocation } from "@/lib/agents/globe";

// Mapbox globe — no SSR (WebGL)
const MapboxGlobe = dynamic(() => import("@/components/map/MapboxGlobe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-xl">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

interface PolicyTarget {
  id: string;
  category: string;
  label: string;
  status: string;
}

interface SimulationResult {
  target: { id: string; label: string; unit: string; deadline: number; category: string };
  lever: string;
  change_pct: number;
  current: number;
  projected: number;
  target_value: number;
  unit: string;
  years_saved: number;
  on_track_before: boolean;
  on_track_after: boolean;
  impact_narrative: string;
  timeline_data: Array<{ year: number; baseline: number; accelerated: number; required: number }>;
}

export default function SimulatePage() {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<GlobeLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<GlobeLocation | null>(null);

  const targets = targetsData as unknown as PolicyTarget[];

  async function handleSimulate(targetId: string, lever: string, changePct: number) {
    setLoading(true);
    setError(null);
    setResult(null);
    setLocations([]);
    setSelectedLocation(null);

    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId, lever, changePct }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Simulation failed");
      const data: SimulationResult = await res.json();
      setResult(data);

      // Fetch geographic impact locations in parallel
      fetchLocations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function fetchLocations(sim: SimulationResult) {
    setLocationsLoading(true);
    try {
      const res = await fetch("/api/simulate-locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId: sim.target.id,
          category: sim.target.category,
          label: sim.target.label,
          lever: sim.lever,
          change_pct: sim.change_pct,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setLocations(data.locations || []);
    } catch {
      // non-fatal
    } finally {
      setLocationsLoading(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left panel: form */}
      <div className="w-72 flex-shrink-0 border-r border-slate-800 overflow-y-auto p-5">
        <div className="mb-5">
          <h1 className="text-base font-semibold text-white flex items-center gap-2">
            <FlaskConical size={16} className="text-emerald-400" />
            Policy Simulator
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Model policy lever impact on climate targets and see global effects on the map.
          </p>
        </div>
        <SimulateForm targets={targets} onSimulate={handleSimulate} loading={loading} />

        {/* Location list under form */}
        {locations.length > 0 && (
          <div className="mt-5">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Globe size={11} />
              Affected Locations
            </div>
            <div className="space-y-1">
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc)}
                  className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    selectedLocation?.id === loc.id
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        loc.impactType === "positive" ? "#10b981"
                        : loc.impactType === "negative" ? "#ef4444"
                        : loc.impactType === "mixed" ? "#f59e0b"
                        : "#64748b",
                    }}
                  />
                  <span className="truncate">{loc.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right area: split into top (results) + bottom (map) when result exists */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!result && !loading && !error ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <FlaskConical size={24} className="text-emerald-400" />
              </div>
              <h2 className="text-base font-semibold text-white mb-1">Run a simulation</h2>
              <p className="text-sm text-slate-500 max-w-xs">
                Select a target, choose a policy lever, and see the projected impact — with affected locations shown on a globe.
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">Running simulation...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-5">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
              {error}
            </div>
          </div>
        ) : result ? (
          <div className="flex-1 relative min-h-0">
            {/* Header bar */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2.5 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Globe size={13} className="text-emerald-400" />
                <span className="text-xs font-semibold text-white">Global Impact</span>
                <span className="text-xs text-slate-500">— {result.target.label}</span>
              </div>
              {locationsLoading && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <div className="w-3 h-3 border border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  Mapping locations...
                </div>
              )}
            </div>

            {/* Map — full panel */}
            <div className="absolute inset-0 pt-9">
              <MapboxGlobe
                locations={locations}
                selectedId={selectedLocation?.id || null}
                onLocationClick={setSelectedLocation}
                compact
              />
            </div>

            {/* Location detail panel */}
            {selectedLocation && (
              <LocationPanel
                location={selectedLocation}
                onClose={() => setSelectedLocation(null)}
              />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
