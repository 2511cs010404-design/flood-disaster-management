import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/floodguard/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  rainfallSeries,
  rainfallWindows,
  districtRainfall,
  historicalRainfall,
  DATA_SOURCE,
  LAST_UPDATED,
} from "@/lib/floodguard-data";

export const Route = createFileRoute("/rainfall")({
  head: () => ({
    meta: [
      { title: "Rainfall Monitoring & District Rainfall | FloodGuard" },
      {
        name: "description",
        content: "Live rainfall accumulation, intensity charts, district-wise departure tables and historical rainfall trends.",
      },
      { property: "og:title", content: "Rainfall Monitoring | FloodGuard" },
      { property: "og:description", content: "Hourly to monthly rainfall totals, district departure and rainfall intensity mapping." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Rainfall,
});

const statusTone: Record<string, string> = {
  "Highly Excess": "text-danger",
  Excess: "text-high",
  "Above Normal": "text-warn",
  Normal: "text-safe",
  "Below Normal": "text-muted-foreground",
};

function intensityBand(mm: number) {
  if (mm >= 15) return { label: "Very heavy", tone: "bg-danger" };
  if (mm >= 10) return { label: "Heavy", tone: "bg-high" };
  if (mm >= 5) return { label: "Moderate", tone: "bg-warn" };
  return { label: "Low", tone: "bg-safe" };
}

function Rainfall() {
  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Rainfall monitoring</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Source: {DATA_SOURCE} · Updated: {LAST_UPDATED} · Type: Observation · Unit: mm
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {rainfallWindows.map((r) => (
          <Card key={r.label} className="glass">
            <CardContent className="p-4">
              <p className="text-xs tracking-widest text-muted-foreground uppercase">{r.label}</p>
              <p className="mt-1 text-2xl font-bold">{r.value} mm</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Rainfall accumulation (last 24 hours)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rainfallSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                <Bar dataKey="rainfall" fill="var(--chart-1)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Rainfall intensity (mm/hr)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rainfallSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                <Line type="monotone" dataKey="intensity" stroke="var(--chart-4)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 glass">
        <CardHeader>
          <CardTitle>District-wise rainfall</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>District</TableHead>
                <TableHead>Actual</TableHead>
                <TableHead>Normal</TableHead>
                <TableHead>Departure</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {districtRainfall.map((d) => (
                <TableRow key={d.district}>
                  <TableCell className="font-medium">{d.district}</TableCell>
                  <TableCell>{d.actual} mm</TableCell>
                  <TableCell>{d.normal} mm</TableCell>
                  <TableCell>
                    {d.departure > 0 ? "+" : ""}
                    {d.departure}%
                  </TableCell>
                  <TableCell className={statusTone[d.status]}>{d.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Rainfall intensity map (demo layer)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {districtRainfall.map((d) => {
                const band = intensityBand(d.actual / 8);
                return (
                  <div key={d.district} className="rounded-lg border border-border p-3 text-center">
                    <div className={`mx-auto h-8 w-8 rounded-full ${band.tone}`} aria-hidden />
                    <p className="mt-2 text-xs font-medium">{d.district}</p>
                    <p className="text-xs text-muted-foreground">{band.label}</p>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Demonstration layer — colour plus text label is always shown so danger is never communicated by colour alone.
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Historical annual rainfall</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalRainfall}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="year" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                <Bar dataKey="rain" fill="var(--chart-2)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
