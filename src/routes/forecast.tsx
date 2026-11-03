import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/floodguard/AppShell";
import { SeverityBadge } from "@/components/floodguard/severity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { daily, hourly, districtRainfall, DATA_SOURCE, LAST_UPDATED } from "@/lib/floodguard-data";

export const Route = createFileRoute("/forecast")({
  head: () => ({
    meta: [
      { title: "Weather Forecast & District Outlook | FloodGuard" },
      {
        name: "description",
        content: "Hourly 24-hour and 7-day weather forecasts, district-wise outlook and impact-based guidance.",
      },
      { property: "og:title", content: "Weather Forecast | FloodGuard" },
      { property: "og:description", content: "Hourly, daily and district-wise rainfall and temperature forecasts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Forecast,
});

function Forecast() {
  const [district, setDistrict] = useState(districtRainfall[0]!.district);
  const d = districtRainfall.find((x) => x.district === district)!;

  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Weather forecast</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Source: {DATA_SOURCE} · Updated: {LAST_UPDATED} · Type: Forecast
      </p>

      <Tabs defaultValue="hourly" className="mt-6">
        <TabsList>
          <TabsTrigger value="hourly">Hourly (24h)</TabsTrigger>
          <TabsTrigger value="daily">Daily (7 days)</TabsTrigger>
          <TabsTrigger value="district">District-wise</TabsTrigger>
          <TabsTrigger value="impact">Impact-based</TabsTrigger>
        </TabsList>

        <TabsContent value="hourly">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Next 24 hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                    <Area type="monotone" dataKey="rainfall" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="temp" stroke="var(--chart-4)" fill="var(--chart-4)" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Temp</TableHead>
                      <TableHead>Rain chance</TableHead>
                      <TableHead>Rainfall</TableHead>
                      <TableHead>Wind</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hourly.slice(0, 12).map((h) => (
                      <TableRow key={h.time}>
                        <TableCell>{h.time}</TableCell>
                        <TableCell>{h.temp}°C</TableCell>
                        <TableCell>{h.rainChance}%</TableCell>
                        <TableCell>{h.rainfall} mm</TableCell>
                        <TableCell>{h.wind} km/h</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {daily.map((day) => (
              <Card key={day.day} className="glass">
                <CardContent className="p-4">
                  <p className="font-semibold">{day.day}</p>
                  <p className="mt-2 text-2xl font-bold">
                    {day.max}° <span className="text-base text-muted-foreground">/ {day.min}°</span>
                  </p>
                  <p className="text-sm text-primary">{day.condition}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Rain {day.rain} mm · {day.chance}% chance · Wind {day.wind} km/h
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="district">
          <Card className="glass">
            <CardHeader>
              <CardTitle>District forecast — Telangana</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                aria-label="Select district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="rounded-md border border-input bg-surface-2 px-3 py-2 text-sm"
              >
                {districtRainfall.map((x) => (
                  <option key={x.district}>{x.district}</option>
                ))}
              </select>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold">30°C / 23°C</p>
                  <p className="text-sm">Rain probability 85% · {d.actual} mm recorded</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">Tomorrow</p>
                  <p className="text-2xl font-bold">29°C / 23°C</p>
                  <p className="text-sm">Rain probability 70% · departure {d.departure}%</p>
                </div>
              </div>
              <div className="mt-4">
                <SeverityBadge severity={d.departure > 40 ? "red" : d.departure > 10 ? "orange" : "yellow"} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Impact-based forecast</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs tracking-widest text-muted-foreground uppercase">Weather</p>
                <p className="mt-2 text-lg font-semibold">Very heavy rainfall</p>
              </div>
              <div>
                <p className="text-xs tracking-widest text-muted-foreground uppercase">Possible impact</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  <li>Urban flooding</li>
                  <li>Road waterlogging</li>
                  <li>Traffic disruption</li>
                  <li>Low-lying area flooding</li>
                </ul>
              </div>
              <div>
                <p className="text-xs tracking-widest text-muted-foreground uppercase">Action</p>
                <p className="mt-2 text-sm">Avoid unnecessary travel and keep emergency supplies ready.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
