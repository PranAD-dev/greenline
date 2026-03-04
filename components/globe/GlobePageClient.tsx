"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import PolicyDropzone from "./PolicyDropzone";
import LocationPanel from "./LocationPanel";
import type { GlobeLocation } from "@/lib/agents/globe";

// MapboxGlobe must be dynamically imported (WebGL / browser-only)
const GlobeView = dynamic(() => import("@/components/map/MapboxGlobe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-zinc-500">Loading map...</p>
      </div>
    </div>
  ),
});

export default function GlobePageClient() {
  const [locations, setLocations] = useState<GlobeLocation[]>([]);
  const [selected, setSelected] = useState<GlobeLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = useCallback(async (text: string) => {
    setLoading(true);
    setError(null);
    setSelected(null);

    try {
      const res = await fetch("/api/policy-globe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      const data = await res.json();
      setLocations(data.locations);
      setHasAnalyzed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Left panel */}
      <div className="w-80 flex-shrink-0 border-r border-zinc-800 overflow-y-auto p-5 flex flex-col z-10 bg-[#0f0f0f]">
        <PolicyDropzone onAnalyze={handleAnalyze} loading={loading} />

        {error && (
          <div className="mt-3 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {hasAnalyzed && !loading && (
          <div className="mt-3 space-y-1">
            <p className="text-xs text-zinc-500 mb-2 font-medium">
              {locations.length} locations identified — click a marker to explore
            </p>
            {locations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => setSelected(loc)}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                  selected?.id === loc.id
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor:
                      loc.impactType === "positive" ? "#10b981"
                      : loc.impactType === "negative" ? "#ef4444"
                      : loc.impactType === "mixed" ? "#f59e0b"
                      : "#52525b",
                  }}
                />
                <span className="truncate">{loc.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Globe area */}
      <div className="flex-1 relative bg-[#0a0a0a]">
        {!hasAnalyzed && !loading ? (
          // Empty state
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
            <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5">
              <svg className="w-9 h-9 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Visualize Policy Impact</h2>
            <p className="text-sm text-zinc-500 max-w-xs">
              Upload or paste a policy document on the left. Claude will identify every city and region it affects — and explain exactly how.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center max-w-sm">
              {[
                { color: "#10b981", label: "Positive", desc: "Benefits this area" },
                { color: "#f59e0b", label: "Mixed", desc: "Trade-offs exist" },
                { color: "#ef4444", label: "Negative", desc: "Adverse effects" },
              ].map((item) => (
                <div key={item.label} className="bg-zinc-900 rounded-xl p-3 border border-zinc-800">
                  <div className="w-3 h-3 rounded-full mx-auto mb-1.5" style={{ backgroundColor: item.color }} />
                  <div className="text-xs font-medium text-white">{item.label}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <GlobeView
            locations={locations}
            selectedId={selected?.id || null}
            onLocationClick={setSelected}
          />
        )}

        {/* Location panel — overlaid on globe */}
        {selected && (
          <LocationPanel location={selected} onClose={() => setSelected(null)} />
        )}
      </div>
    </div>
  );
}
