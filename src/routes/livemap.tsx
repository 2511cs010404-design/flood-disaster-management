import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/floodguard/AppShell";
import { LiveMapPanel } from "@/components/floodguard/LiveMapPanel";
import { LiveDetect } from "@/components/floodguard/LiveDetect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge } from "@/components/floodguard/severity";
import { floodZones } from "@/lib/floodguard-geo";
import { DATA_SOURCE, LAST_UPDATED } from "@/lib/floodguard-data";

export const Route = createFileRoute("/livemap")({
  head: () => ({
    meta: [
      { title: "Live Rain Radar & Satellite Flood Map | FloodGuard" },
      {
        name: "description",
        content:
          "Live animated rain radar, satellite imagery, flood zones, shelters, blocked roads and evacuation routes on one interactive disaster map.",
      },
      { property: "og:title", content: "Live Radar & Satellite Flood Map | FloodGuard" },
      {
        property: "og:description",
        content: "Track rainfall in real time with radar animation, satellite base maps and flood risk layers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LiveMapPage,
});

function LiveMapPage() {
  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Live maps & satellite detection</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Radar: RainViewer live feed · Base maps: OpenStreetMap / Esri satellite · Flood layers: {DATA_SOURCE} · Updated:{" "}
        {LAST_UPDATED}
      </p>

      <div className="mt-6">
        <LiveDetect />
      </div>

      <Card className="mt-6 glass">
        <CardHeader>
          <CardTitle>Interactive disaster map</CardTitle>
        </CardHeader>
        <CardContent>
          <LiveMapPanel height={560} />
        </CardContent>
      </Card>

      <Card className="mt-6 glass">
        <CardHeader>
          <CardTitle>Detected flood hotspots</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {floodZones.map((z) => (
            <div key={z.id} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{z.name}</p>
                <SeverityBadge severity={z.severity}>{z.severity.toUpperCase()}</SeverityBadge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{z.detail}</p>
              <p className="mt-1 text-xs text-muted-foreground">Water depth: {z.depth}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-warn">
        Radar imagery is live third-party data. Flood zones, shelters and routes are demonstration data and are not
        official warnings — always follow instructions from authorities.
      </p>
    </AppShell>
  );
}
