"use client";

import { X, MapPin, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GlobeLocation } from "@/lib/agents/globe";

interface LocationPanelProps {
  location: GlobeLocation;
  onClose: () => void;
}

const IMPACT_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  positive: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    label: "Positive Impact",
  },
  negative: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
    label: "Negative Impact",
  },
  mixed: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    label: "Mixed Impact",
  },
  neutral: {
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/30",
    label: "Neutral",
  },
};

const IMPACT_DOT: Record<string, string> = {
  positive: "bg-emerald-400",
  negative: "bg-red-400",
  mixed: "bg-amber-400",
  neutral: "bg-slate-400",
};

export default function LocationPanel({ location, onClose }: LocationPanelProps) {
  const style = IMPACT_STYLES[location.impactType] || IMPACT_STYLES.neutral;

  return (
    <div className="absolute inset-y-0 right-0 w-96 bg-slate-900/95 backdrop-blur-md border-l border-slate-700 flex flex-col shadow-2xl animate-slide-in z-20">
      {/* Header */}
      <div className={cn("px-5 py-4 border-b", style.border, style.bg)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", IMPACT_DOT[location.impactType])} />
              <span className={cn("text-xs font-semibold uppercase tracking-wide", style.text)}>
                {style.label}
              </span>
            </div>
            <h2 className="text-base font-bold text-white leading-tight">{location.name}</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={11} className="text-slate-500" />
              <span className="text-xs text-slate-500">
                {location.lat.toFixed(2)}°, {location.lng.toFixed(2)}°
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0 mt-0.5"
          >
            <X size={16} />
          </button>
        </div>

        {/* Summary */}
        <p className="text-sm text-slate-300 mt-3 leading-relaxed">{location.summary}</p>
      </div>

      {/* Explanation */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Impact Analysis
          </h3>
          <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {location.explanation}
          </div>
        </div>

        {/* Policy clauses */}
        {location.policyClauses.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <FileText size={11} />
              Relevant Policy Clauses
            </h3>
            <div className="space-y-1.5">
              {location.policyClauses.map((clause, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs text-slate-400 bg-slate-800 rounded-lg px-3 py-2"
                >
                  <span className="text-emerald-500 flex-shrink-0 mt-0.5">§</span>
                  <span>{clause}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coordinates */}
        <div className="pt-2 border-t border-slate-800">
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div>
              <span className="block text-slate-500 mb-0.5">Latitude</span>
              {location.lat.toFixed(4)}°
            </div>
            <div>
              <span className="block text-slate-500 mb-0.5">Longitude</span>
              {location.lng.toFixed(4)}°
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
