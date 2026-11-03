import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/floodguard/AppShell";
import { SeverityBadge } from "@/components/floodguard/severity";
import { LiveMapPanel } from "@/components/floodguard/LiveMapPanel";
import { RiskGauge } from "@/components/floodguard/RiskGauge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  rivers,
  reservoirs,
  floodRiskInputs,
  FLOOD_RISK_SCORE,
  riskBand,
  bandSeverity,
  citizenReports,
  DATA_SOURCE,
  LAST_UPDATED,
} from "@/lib/floodguard-data";

export const Route = createFileRoute("/flood")({
  head: () => ({
    meta: [
      { title: "Flood Risk Engine, Rivers & Reservoirs | FloodGuard" },
      {
        name: "description",
        content: "Flood risk scoring from rainfall, river levels and reservoir storage, plus a live flood map and citizen reports.",
      },
      { property: "og:title", content: "Flood Risk Engine | FloodGuard" },
      { property: "og:description", content: "0–100 flood risk score with river monitoring, reservoir storage and live flood map layers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Flood,
});


function riverStatus(r: (typeof rivers)[number]) {
  if (r.current >= r.danger) return "red" as const;
  if (r.current >= r.warning) return "orange" as const;
  if (r.current >= r.warning * 0.9) return "yellow" as const;
  return "green" as const;
}

function Flood() {
  const score = FLOOD_RISK_SCORE;
  const band = riskBand(score);

  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Flood risk & water monitoring</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Source: {DATA_SOURCE} · Updated: {LAST_UPDATED} · Type: System-generated estimate
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Flood risk score</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskGauge score={score} />
            <div className="mt-4 text-center">
              <SeverityBadge severity={bandSeverity(band)}>{band}</SeverityBadge>
            </div>
            <p className="mt-4 text-xs text-warn">
              System-generated risk estimate — not an official warning. Follow instructions issued by authorities.
            </p>
          </CardContent>
        </Card>

        <Card className="glass lg:col-span-2">
          <CardHeader>
            <CardTitle>Contributing factors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {floodRiskInputs.map((f) => (
              <div key={f.label}>
                <div className="flex justify-between text-sm">
                  <span>{f.label}</span>
                  <span className="text-muted-foreground">
                    {f.value} · +{f.weight}
                  </span>
                </div>
                <Progress value={f.weight * 4} className="mt-1 h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-danger/50 glass">
        <CardContent className="p-6">
          <p className="font-display text-2xl font-bold text-danger">🚨 FLOOD ALERT</p>
          <p className="mt-2">Your area is under HIGH FLOOD RISK.</p>
          <p className="text-sm text-muted-foreground">Expected rainfall 85–120 mm over the next 6 hours.</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            <li>Avoid low-lying areas and underpasses</li>
            <li>Do not cross flooded roads</li>
            <li>Keep emergency supplies ready</li>
            <li>Follow evacuation instructions</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="destructive">
              <Link to="/emergency">Emergency help</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/emergency">Find shelter</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/emergency">View safe route</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle>River water levels</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>River</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>Warning</TableHead>
                  <TableHead>Danger</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rivers.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell className="font-medium">
                      {r.name}
                      <span className="block text-xs text-muted-foreground">
                        {r.flow} cusecs · {r.trend}
                      </span>
                    </TableCell>
                    <TableCell>{r.current} m</TableCell>
                    <TableCell>{r.warning} m</TableCell>
                    <TableCell>{r.danger} m</TableCell>
                    <TableCell>
                      <SeverityBadge severity={riverStatus(r)}>
                        {riverStatus(r) === "red" ? "DANGER" : riverStatus(r) === "orange" ? "HIGH" : riverStatus(r) === "yellow" ? "WATCH" : "NORMAL"}
                      </SeverityBadge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Dam / reservoir monitoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reservoirs.map((r) => (
              <div key={r.name}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{r.name}</span>
                  <span className={r.storage > 80 ? "text-danger" : r.storage > 70 ? "text-high" : "text-safe"}>
                    {r.storage}% · {r.storage > 80 ? "Very high" : r.storage > 70 ? "High" : "Normal"}
                  </span>
                </div>
                <Progress value={r.storage} className="mt-1 h-2.5" />
                <p className="mt-1 text-xs text-muted-foreground">
                  Level {r.level} m / {r.capacity} m · Inflow {r.inflow} cusecs · Outflow {r.outflow} cusecs
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 glass">
        <CardHeader>
          <CardTitle>Live radar & satellite flood map</CardTitle>
        </CardHeader>
        <CardContent>
          <LiveMapPanel height={460} />
          <div className="mt-4 flex flex-wrap gap-2">
            {citizenReports.map((r) => (
              <span
                key={r.id}
                className="flex items-center gap-2 rounded-md border border-border bg-surface px-2 py-1 text-xs"
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${r.severity === "red" ? "bg-danger" : r.severity === "orange" ? "bg-high" : "bg-warn"}`}
                />
                📍 {r.location} · {r.depth} · {r.ago}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
