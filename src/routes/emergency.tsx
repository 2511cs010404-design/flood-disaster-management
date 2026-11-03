import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Siren, Navigation, Phone } from "lucide-react";
import { AppShell } from "@/components/floodguard/AppShell";
import { SeverityBadge } from "@/components/floodguard/severity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { shelters, emergencyServices, safetyTips, citizenReports } from "@/lib/floodguard-data";

export const Route = createFileRoute("/emergency")({
  head: () => ({
    meta: [
      { title: "Emergency SOS, Shelters & Flood Reporting | FloodGuard" },
      {
        name: "description",
        content: "SOS assistance, nearest shelters, evacuation routes, emergency contacts, safety tips and citizen flood reporting.",
      },
      { property: "og:title", content: "Emergency & Shelters | FloodGuard" },
      { property: "og:description", content: "Find shelters, evacuation routes and emergency services, and report flooding in your area." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Emergency,
});

function Emergency() {
  const [sosOpen, setSosOpen] = useState(false);
  const [severity, setSeverity] = useState("Moderate");

  function shareLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation unavailable.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => toast.success(`Location shared: ${p.coords.latitude.toFixed(3)}, ${p.coords.longitude.toFixed(3)}`),
      () => toast.error("Location permission denied."),
    );
  }

  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Emergency</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Emergency services are never contacted automatically — you must confirm each action.
      </p>

      <Card className="mt-6 border-danger/50 glass">
        <CardContent className="flex flex-wrap items-center gap-6 p-6">
          <Button
            size="lg"
            variant="destructive"
            className="h-28 w-28 animate-alert-pulse rounded-full text-xl font-bold"
            onClick={() => setSosOpen((v) => !v)}
            aria-expanded={sosOpen}
          >
            <Siren className="mr-1 h-6 w-6" /> SOS
          </Button>
          <div className="flex-1">
            <p className="font-display text-xl font-bold text-danger">Need urgent help?</p>
            <p className="text-sm text-muted-foreground">
              Tap SOS to share your location, contact emergency services and find the nearest shelter.
            </p>
            {sosOpen && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={shareLocation}>Share my location</Button>
                <Button variant="secondary" asChild>
                  <a href="tel:108">Confirm call to 108</a>
                </Button>
                <Button variant="outline" onClick={() => toast("Nearest shelter: Govt. HS School, Kukatpally — 1.4 km")}>
                  Find nearest shelter
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Nearest safe shelters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {shelters.map((s) => (
              <div key={s.name} className="rounded-lg border border-border p-3">
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-muted-foreground">
                  {s.distance} km · {s.available} of {s.capacity} beds available
                </p>
                <p className="text-sm text-muted-foreground">{s.address}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" asChild>
                    <a href={`tel:${s.phone.replace(/\s/g, "")}`}>
                      <Phone className="mr-1 h-3.5 w-3.5" /> Call
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast("Route calculated avoiding flooded roads.")}>
                    <Navigation className="mr-1 h-3.5 w-3.5" /> Get directions
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Evacuation route</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>
                Your location → <strong>Govt. HS School, Kukatpally</strong>
              </p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>Distance: 1.4 km · Estimated time: 18 min on foot</li>
                <li className="text-danger">Blocked: Begumpet underpass (3 ft water)</li>
                <li className="text-high">Avoid: Kukatpally main road (waterlogged)</li>
                <li className="text-safe">Safe route: JNTU Road → KPHB Phase 3</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Emergency services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {emergencyServices.map((e) => (
                <div key={e.name} className="flex items-center justify-between gap-2 border-b border-border pb-2 last:border-0">
                  <span>
                    <span className="block font-medium">{e.name}</span>
                    <span className="text-xs text-muted-foreground">{e.type}</span>
                  </span>
                  <Button size="sm" variant="secondary" asChild>
                    <a href={`tel:${e.phone.replace(/[^\d+]/g, "")}`}>{e.phone}</a>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Report flooding in your area</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Flood report submitted for admin verification.");
                (e.target as HTMLFormElement).reset();
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" required maxLength={100} placeholder="Your name" />
                </div>
                <div>
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input id="mobile" required pattern="[0-9+ ]{8,15}" placeholder="+91 ..." />
                </div>
                <div>
                  <Label htmlFor="loc">Location</Label>
                  <Input id="loc" required maxLength={120} placeholder="Area / landmark" />
                </div>
                <div>
                  <Label htmlFor="depth">Water depth</Label>
                  <Input id="depth" placeholder="e.g. 1.5 ft" maxLength={20} />
                </div>
              </div>
              <div>
                <Label htmlFor="sev">Severity</Label>
                <select
                  id="sev"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-surface-2 px-3 py-2 text-sm"
                >
                  <option>Low</option>
                  <option>Moderate</option>
                  <option>High</option>
                  <option>Severe</option>
                </select>
              </div>
              <div>
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" maxLength={1000} placeholder="What is happening?" />
              </div>
              <div>
                <Label htmlFor="photo">Photo / video</Label>
                <Input id="photo" type="file" accept="image/*,video/*" />
              </div>
              <Button type="submit" variant="destructive" className="w-full">
                REPORT FLOOD
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Recent citizen reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {citizenReports.map((r) => (
                <div key={r.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">📍 {r.location}</p>
                    <SeverityBadge severity={r.severity}>{r.verified ? "Verified" : "Pending"}</SeverityBadge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Water depth {r.depth} · Reported {r.ago}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Safety tips</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3 text-sm">
              {(
                [
                  ["Before flood", safetyTips.before],
                  ["During flood", safetyTips.during],
                  ["After flood", safetyTips.after],
                ] as const
              ).map(([title, items]) => (
                <div key={title}>
                  <p className="font-semibold">{title}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">
                    {items.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
