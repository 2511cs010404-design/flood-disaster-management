import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import {
  MAP_CENTER,
  blockedRoads,
  damPoints,
  evacuationRoutes,
  floodZones,
  hospitalPoints,
  responderPoints,
  riverPoints,
  severityColor,
  shelterPoints,
  type MapPoint,
} from "@/lib/floodguard-geo";

type BaseKey = "street" | "satellite" | "terrain" | "dark";

const baseLayers: { key: BaseKey; label: string; url: string; attribution: string }[] = [
  {
    key: "street",
    label: "Street",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
  },
  {
    key: "satellite",
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Imagery &copy; Esri, Maxar, Earthstar Geographics",
  },
  {
    key: "terrain",
    label: "Terrain",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri topographic",
  },
  {
    key: "dark",
    label: "Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap contributors, &copy; CARTO",
  },
];

type OverlayKey =
  | "radar"
  | "clouds"
  | "flood"
  | "shelters"
  | "hospitals"
  | "responders"
  | "rivers"
  | "dams"
  | "blocked"
  | "evacuation";

const overlayMeta: { key: OverlayKey; label: string }[] = [
  { key: "radar", label: "Live rain radar" },
  { key: "clouds", label: "Satellite clouds" },
  { key: "flood", label: "Flood zones" },
  { key: "shelters", label: "Shelters" },
  { key: "hospitals", label: "Hospitals" },
  { key: "responders", label: "Police / fire / SDRF" },
  { key: "rivers", label: "River gauges" },
  { key: "dams", label: "Dams" },
  { key: "blocked", label: "Blocked roads" },
  { key: "evacuation", label: "Evacuation routes" },
];

function pinIcon(emoji: string, color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9999px;background:${color};color:#fff;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,.45)">${emoji}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function markerGroup(points: MapPoint[], emoji: string, color: string) {
  return L.layerGroup(
    points.map((p) =>
      L.marker(p.position, { icon: pinIcon(emoji, color), title: p.name }).bindPopup(
        `<strong>${p.name}</strong><br/>${p.detail}`,
      ),
    ),
  );
}

export default function LiveMap({ height = 520 }: { height?: number }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseRef = useRef<L.TileLayer | null>(null);
  const overlayRefs = useRef<Partial<Record<OverlayKey, L.Layer>>>({});
  const radarFramesRef = useRef<string[]>([]);
  const radarLayerRef = useRef<L.TileLayer | null>(null);

  const [base, setBase] = useState<BaseKey>("street");
  const [active, setActive] = useState<Record<OverlayKey, boolean>>({
    radar: true,
    clouds: false,
    flood: true,
    shelters: true,
    hospitals: false,
    responders: false,
    rivers: true,
    dams: true,
    blocked: true,
    evacuation: false,
  });
  const [playing, setPlaying] = useState(true);
  const [frameLabel, setFrameLabel] = useState("Loading radar…");
  const [status, setStatus] = useState("Connecting to live radar feed…");
  const [feedVersion, setFeedVersion] = useState(0);

  // init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { center: MAP_CENTER, zoom: 10, scrollWheelZoom: true });
    mapRef.current = map;

    const cfg = baseLayers[0]!;
    baseRef.current = L.tileLayer(cfg.url, { attribution: cfg.attribution, maxZoom: 19 }).addTo(map);

    overlayRefs.current.flood = L.layerGroup(
      floodZones.flatMap((z) => [
        L.circle(z.position, {
          radius: z.radius,
          color: severityColor[z.severity],
          fillColor: severityColor[z.severity],
          fillOpacity: 0.28,
          weight: 2,
        }).bindPopup(
          `<strong>${z.name}</strong><br/>${z.detail}<br/>Water depth: ${z.depth}<br/>Severity: ${z.severity.toUpperCase()}`,
        ),
      ]),
    );
    overlayRefs.current.shelters = markerGroup(shelterPoints, "🏠", "#22c55e");
    overlayRefs.current.hospitals = markerGroup(hospitalPoints, "🏥", "#0ea5e9");
    overlayRefs.current.responders = markerGroup(responderPoints, "🚓", "#6366f1");
    overlayRefs.current.rivers = markerGroup(riverPoints, "🌊", "#0891b2");
    overlayRefs.current.dams = markerGroup(damPoints, "🛢", "#7c3aed");
    overlayRefs.current.blocked = L.layerGroup(
      blockedRoads.map((r) =>
        L.polyline(r.path, { color: "#ef4444", weight: 6, dashArray: "10 8" }).bindPopup(`🚧 ${r.name}`),
      ),
    );
    overlayRefs.current.evacuation = L.layerGroup(
      evacuationRoutes.map((r) =>
        L.polyline(r.path, { color: "#22c55e", weight: 5 }).bindPopup(`🟢 Safe route: ${r.name}`),
      ),
    );

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // base layer switching
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const cfg = baseLayers.find((b) => b.key === base)!;
    if (baseRef.current) map.removeLayer(baseRef.current);
    baseRef.current = L.tileLayer(cfg.url, { attribution: cfg.attribution, maxZoom: 19 }).addTo(map);
    baseRef.current.bringToBack();
  }, [base]);

  // overlay toggles
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    (Object.keys(active) as OverlayKey[]).forEach((key) => {
      if (key === "radar") return;
      const layer = overlayRefs.current[key];
      if (!layer) return;
      if (active[key]) map.addLayer(layer);
      else map.removeLayer(layer);
    });
  }, [active, feedVersion]);

  // live radar + satellite frames from RainViewer (free, no key)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("https://api.rainviewer.com/public/weather-maps.json");
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as {
          host: string;
          radar: { past: { time: number; path: string }[]; nowcast?: { time: number; path: string }[] };
          satellite?: { infrared?: { time: number; path: string }[] };
        };
        if (cancelled) return;
        const frames = [...json.radar.past, ...(json.radar.nowcast ?? [])];
        radarFramesRef.current = frames.map((f) => `${json.host}${f.path}/256/{z}/{x}/{y}/4/1_1.png`);

        const sat = json.satellite?.infrared ?? [];
        const latestSat = sat[sat.length - 1];
        if (latestSat) {
          const map = mapRef.current;
          const old = overlayRefs.current.clouds;
          if (map && old) map.removeLayer(old);
          overlayRefs.current.clouds = L.tileLayer(
            `${json.host}${latestSat.path}/256/{z}/{x}/{y}/0/0_0.png`,
            { opacity: 0.55, maxNativeZoom: 6, maxZoom: 19, zIndex: 350 },
          );
        }
        setStatus(`Live radar connected · ${frames.length} frames · refreshes every 10 minutes`);
        setFeedVersion((v) => v + 1);
      } catch {
        if (!cancelled) setStatus("Live radar feed unavailable right now — base maps and flood layers still work.");
      }
    }
    void load();
    const id = window.setInterval(load, 10 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  // radar animation
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let i = 0;
    function show() {
      const frames = radarFramesRef.current;
      if (!map || !active.radar || frames.length === 0) return;
      const url = frames[i % frames.length]!;
      const next = L.tileLayer(url, { opacity: 0.7, maxNativeZoom: 7, maxZoom: 19, zIndex: 400 }).addTo(map);
      const prev = radarLayerRef.current;
      radarLayerRef.current = next;
      window.setTimeout(() => prev && map.removeLayer(prev), 350);
      setFrameLabel(`Radar frame ${(i % frames.length) + 1} / ${frames.length}`);
      i += 1;
    }
    if (!active.radar) {
      if (radarLayerRef.current) map.removeLayer(radarLayerRef.current);
      radarLayerRef.current = null;
      return;
    }
    show();
    if (!playing) return;
    const id = window.setInterval(show, 900);
    return () => window.clearInterval(id);
  }, [active.radar, playing, feedVersion]);

  function locate() {
    const map = mapRef.current;
    if (!map || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const ll: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        map.setView(ll, 12);
        L.marker(ll, { icon: pinIcon("📍", "#e11d48") })
          .addTo(map)
          .bindPopup("<strong>Your location</strong><br/>Flood risk layers centred here.")
          .openPopup();
      },
      () => setStatus("Location permission denied — showing Hyderabad region."),
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-lg border border-border">
          {baseLayers.map((b) => (
            <button
              key={b.key}
              type="button"
              onClick={() => setBase(b.key)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                base === b.key ? "bg-primary text-primary-foreground" : "bg-surface-2 hover:bg-accent"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
        <Button size="sm" variant="secondary" onClick={() => setPlaying((p) => !p)}>
          {playing ? "⏸ Pause radar" : "▶ Play radar"}
        </Button>
        <Button size="sm" variant="outline" onClick={locate}>
          📍 Use my location
        </Button>
        <span className="text-xs text-muted-foreground">{frameLabel}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {overlayMeta.map((o) => (
          <label
            key={o.key}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-border px-3 py-1 text-xs"
          >
            <input
              type="checkbox"
              className="accent-primary"
              checked={active[o.key]}
              onChange={(e) => setActive((s) => ({ ...s, [o.key]: e.target.checked }))}
            />
            {o.label}
          </label>
        ))}
      </div>

      <div
        ref={containerRef}
        style={{ height }}
        className="w-full overflow-hidden rounded-xl border border-border"
        role="application"
        aria-label="Live flood and rainfall map"
      />
      <p className="text-xs text-muted-foreground">{status}</p>
    </div>
  );
}
