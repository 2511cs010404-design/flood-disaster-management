import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/floodguard/AppShell";
import { SeverityBadge } from "@/components/floodguard/severity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { citizenReports, rainfallSeries, warnings } from "@/lib/floodguard-data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | FloodGuard" },
      {
        name: "description",
        content: "Admin console to publish warnings, verify citizen flood reports, manage shelters and review system analytics.",
      },
      { property: "og:title", content: "Admin Dashboard | FloodGuard" },
      { property: "og:description", content: "Create alerts, verify reports and monitor FloodGuard analytics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Admin,
});

const stats = [
  { label: "Total users", value: "12,480" },
  { label: "Active users (24h)", value: "3,914" },
  { label: "Active alerts", value: String(warnings.length) },
  { label: "Flood reports", value: String(citizenReports.length) },
  { label: "Verified reports", value: String(citizenReports.filter((r) => r.verified).length) },
  { label: "High-risk locations", value: "6" },
];

function Admin() {
  const [reports, setReports] = useState(citizenReports);
  const [confirmRed, setConfirmRed] = useState(false);
  const [sev, setSev] = useState("red");

  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Admin dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Demo console — connect Lovable Cloud to add real admin authentication, roles and persistence.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label} className="glass">
            <CardContent className="p-4">
              <p className="text-xs tracking-widest text-muted-foreground uppercase">{s.label}</p>
              <p className="mt-1 text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Create alert</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (sev === "red" && !confirmRed) {
                  toast.error("Confirm the RED alert checkbox before sending.");
                  return;
                }
                toast.success("Alert published and dispatched to subscribed residents.");
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="type">Alert type</Label>
                  <Input id="type" required placeholder="Very heavy rainfall" maxLength={80} />
                </div>
                <div>
                  <Label htmlFor="aloc">Location</Label>
                  <Input id="aloc" required placeholder="District / mandal" maxLength={120} />
                </div>
                <div>
                  <Label htmlFor="start">Start time</Label>
                  <Input id="start" type="datetime-local" required />
                </div>
                <div>
                  <Label htmlFor="end">End time</Label>
                  <Input id="end" type="datetime-local" required />
                </div>
                <div>
                  <Label htmlFor="rain">Expected rainfall</Label>
                  <Input id="rain" placeholder="120 mm+" maxLength={40} />
                </div>
                <div>
                  <Label htmlFor="asev">Severity</Label>
                  <select
                    id="asev"
                    value={sev}
                    onChange={(e) => setSev(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-surface-2 px-3 py-2 text-sm"
                  >
                    <option value="green">Green — normal</option>
                    <option value="yellow">Yellow — be aware</option>
                    <option value="orange">Orange — be prepared</option>
                    <option value="red">Red — take action</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="instr">Safety instructions</Label>
                <Textarea id="instr" maxLength={600} placeholder="Move away from low-lying areas..." />
              </div>
              {sev === "red" && (
                <label className="flex items-center gap-2 rounded-md border border-danger/50 bg-danger/10 p-2 text-sm">
                  <input type="checkbox" checked={confirmRed} onChange={(e) => setConfirmRed(e.target.checked)} />
                  I confirm this RED alert should be sent to all subscribed residents.
                </label>
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => toast("Preview generated.")}>
                  Preview
                </Button>
                <Button type="submit" variant="destructive">
                  Send alert
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Verify citizen reports</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Depth</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.location}</TableCell>
                      <TableCell>{r.depth}</TableCell>
                      <TableCell>
                        <SeverityBadge severity={r.severity}>{r.verified ? "Verified" : "Pending"}</SeverityBadge>
                      </TableCell>
                      <TableCell>
                        {!r.verified && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setReports((prev) => prev.map((x) => (x.id === r.id ? { ...x, verified: true } : x)));
                              toast.success("Report verified.");
                            }}
                          >
                            Verify
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Rainfall events (24h)</CardTitle>
            </CardHeader>
            <CardContent className="h-56">
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
        </div>
      </div>
    </AppShell>
  );
}
