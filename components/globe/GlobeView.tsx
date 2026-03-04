"use client";

// GlobeView now delegates to the shared MapboxGlobe component.
// react-globe.gl has been replaced with Mapbox GL JS for both the
// /globe page and the /simulate page.

import MapboxGlobe from "@/components/map/MapboxGlobe";
import type { GlobeLocation } from "@/lib/agents/globe";

interface GlobeViewProps {
  locations: GlobeLocation[];
  selectedId: string | null;
  onLocationClick: (loc: GlobeLocation) => void;
}

export default function GlobeView(props: GlobeViewProps) {
  return <MapboxGlobe {...props} />;
}
