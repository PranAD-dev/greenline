"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  type MapRef,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "@/lib/utils";
import type { GlobeLocation } from "@/lib/agents/globe";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

const IMPACT_COLORS: Record<string, string> = {
  positive: "#10b981",
  negative: "#ef4444",
  mixed:    "#f59e0b",
  neutral:  "#64748b",
};

const IMPACT_LABELS: Record<string, string> = {
  positive: "Positive",
  negative: "Negative",
  mixed:    "Mixed",
  neutral:  "Neutral",
};

interface MapboxGlobeProps {
  locations: GlobeLocation[];
  selectedId: string | null;
  onLocationClick: (loc: GlobeLocation) => void;
  /** When true renders as a compact embed (no legend, smaller markers) */
  compact?: boolean;
}

export default function MapboxGlobe({
  locations,
  selectedId,
  onLocationClick,
  compact = false,
}: MapboxGlobeProps) {
  const mapRef = useRef<MapRef>(null);
  const [hovered, setHovered] = useState<GlobeLocation | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Fly to selected location
  useEffect(() => {
    if (!mapLoaded || !selectedId) return;
    const loc = locations.find((l) => l.id === selectedId);
    if (loc && mapRef.current) {
      mapRef.current.flyTo({
        center: [loc.lng, loc.lat],
        zoom: 4,
        duration: 1200,
        essential: true,
      });
    }
  }, [selectedId, locations, mapLoaded]);

  // Fit bounds to all markers when locations update
  useEffect(() => {
    if (!mapLoaded || locations.length === 0 || !mapRef.current) return;
    if (locations.length === 1) {
      mapRef.current.flyTo({ center: [locations[0].lng, locations[0].lat], zoom: 4, duration: 800 });
      return;
    }
    const lngs = locations.map((l) => l.lng);
    const lats = locations.map((l) => l.lat);
    mapRef.current.fitBounds(
      [[Math.min(...lngs) - 5, Math.min(...lats) - 5], [Math.max(...lngs) + 5, Math.max(...lats) + 5]],
      { padding: compact ? 20 : 60, duration: 1000 }
    );
  }, [locations, mapLoaded, compact]);

  const handleMarkerClick = useCallback(
    (loc: GlobeLocation, e: React.MouseEvent) => {
      e.stopPropagation();
      setHovered(null);
      onLocationClick(loc);
    },
    [onLocationClick]
  );

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-xl border border-slate-700">
        <div className="text-center px-6">
          <div className="text-2xl mb-2">🗺️</div>
          <p className="text-sm font-medium text-white mb-1">Mapbox token required</p>
          <p className="text-xs text-slate-400">
            Add <code className="bg-slate-800 px-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> to{" "}
            <code className="bg-slate-800 px-1 rounded">.env.local</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{ longitude: -98, latitude: 39, zoom: compact ? 2.8 : 3 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        projection="globe"
        fog={{
          color: "rgb(2, 6, 23)",
          "high-color": "rgb(15, 23, 42)",
          "horizon-blend": 0.02,
          "star-intensity": 0.6,
        }}
        onLoad={() => setMapLoaded(true)}
        onClick={() => setHovered(null)}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {locations.map((loc) => {
          const isSelected = selectedId === loc.id;
          const color = IMPACT_COLORS[loc.impactType] || IMPACT_COLORS.neutral;
          const size = compact ? (isSelected ? 18 : 13) : (isSelected ? 22 : 16);

          return (
            <Marker
              key={loc.id}
              longitude={loc.lng}
              latitude={loc.lat}
              anchor="center"
            >
              <div
                className="cursor-pointer relative group"
                onMouseEnter={() => setHovered(loc)}
                onMouseLeave={() => setHovered(null)}
                onClick={(e) => handleMarkerClick(loc, e)}
                style={{ width: size, height: size }}
              >
                {/* Pulse ring */}
                {isSelected && (
                  <span
                    className="absolute inset-0 rounded-full animate-ping opacity-60"
                    style={{ backgroundColor: color }}
                  />
                )}
                {/* Outer ring */}
                <span
                  className="absolute inset-0 rounded-full opacity-30"
                  style={{ backgroundColor: color }}
                />
                {/* Core dot */}
                <span
                  className="absolute rounded-full border-2 border-slate-900"
                  style={{
                    backgroundColor: color,
                    inset: "20%",
                    boxShadow: isSelected ? `0 0 12px ${color}` : `0 0 6px ${color}80`,
                  }}
                />
              </div>
            </Marker>
          );
        })}

        {/* Hover popup */}
        {hovered && !selectedId && (
          <Popup
            longitude={hovered.lng}
            latitude={hovered.lat}
            anchor="bottom"
            offset={20}
            closeButton={false}
            closeOnClick={false}
            style={{ zIndex: 10 }}
          >
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs max-w-[220px] shadow-xl">
              <div className="font-semibold text-white mb-0.5">{hovered.name}</div>
              <div className="text-slate-400 leading-relaxed">{hovered.summary}</div>
              <div
                className="mt-2 text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: IMPACT_COLORS[hovered.impactType] }}
              >
                {IMPACT_LABELS[hovered.impactType]}
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Legend */}
      {!compact && (
        <div className="absolute bottom-8 left-4 bg-slate-900/85 backdrop-blur-sm border border-slate-700/60 rounded-xl px-4 py-3 pointer-events-none">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
            Impact
          </div>
          {Object.entries(IMPACT_LABELS).map(([type, label]) => (
            <div key={type} className="flex items-center gap-2 mb-1 last:mb-0">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: IMPACT_COLORS[type] }}
              />
              <span className="text-xs text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Count badge */}
      {locations.length > 0 && (
        <div className={cn(
          "absolute bg-slate-900/85 backdrop-blur-sm border border-slate-700/60 rounded-lg px-3 py-1.5 pointer-events-none",
          compact ? "top-2 right-2" : "top-4 right-12"
        )}>
          <span className="text-xs text-slate-400">
            <span className="text-white font-semibold">{locations.length}</span> locations
          </span>
        </div>
      )}
    </div>
  );
}
