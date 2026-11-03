import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/floodguard/AppShell";
import { SeverityBadge, severityLabel } from "@/components/floodguard/severity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { warnings, nowcast, languages, DATA_SOURCE, LAST_UPDATED } from "@/lib/floodguard-data";
import type { Severity } from "@/lib/floodguard-data";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Weather Warnings, Nowcast & Notifications | FloodGuard" },
      {
        name: "description",
        content: "Colour-coded weather warnings, short-range nowcast, lightning and cyclone bulletins with notification preferences.",
      },
      { property: "og:title", content: "Warnings & Alerts | FloodGuard" },
      { property: "og:description", content: "Green to red warning levels with impacts, safety actions and multi-channel notifications." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Alerts,
});

const prefs = [
  "Rain alert", "Flood alert", "Lightning alert", "Cyclone alert", "Extreme weather alert", "Emergency notification",
];

const legend: Severity[] = ["green", "yellow", "orange", "red"];

function Alerts() {
  const [lang, setLang] = useState<keyof typeof languages>("en");

  function speak(text: string) {
    if ("speechSynthesis" in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }

  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Warnings & alerts</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Source: {DATA_SOURCE} · Updated: {LAST_UPDATED} · Type: Warning bulletin
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        {legend.map((s) => (
          <SeverityBadge key={s} severity={s}>
            {severityLabel[s]}
          </SeverityBadge>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {warnings.map((w) => (
          <Card key={w.id} className="glass">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SeverityBadge severity={w.severity} />
                <span className="text-xs text-muted-foreground">
                  Issued {w.issued} · Valid till {w.validTill}
                </span>
              </div>
              <h2 className="mt-3 text-xl font-bold">{w.type}</h2>
              <p className="text-sm text-muted-foreground">{w.location}</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs tracking-widest text-muted-foreground uppercase">Expected rainfall</p>
                  <p className="mt-1 text-sm">{w.rainfall}</p>
                </div>
                <div>
                  <p className="text-xs tracking-widest text-muted-foreground uppercase">Expected impact</p>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                    {w.impacts.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs tracking-widest text-muted-foreground uppercase">Safety instruction</p>
                  <p className="mt-1 text-sm">{w.action}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => speak(`${w.type}. ${w.action}`)}>
                  🔊 Listen to alert
                </Button>
                <span className="text-xs text-muted-foreground">Source: {w.source}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Nowcast</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nowcast.map((n) => (
              <div key={n.window} className="rounded-lg border border-border p-3">
                <SeverityBadge severity={n.level}>{n.window}</SeverityBadge>
                <p className="mt-2 text-sm text-muted-foreground">{n.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Lightning & cyclone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-lg border border-high/40 bg-high/10 p-3">
              <p className="font-semibold text-high">⚡ HIGH LIGHTNING RISK</p>
              <p className="mt-1 text-muted-foreground">
                Activity detected 6 km to the south-west, moving north-east. Take shelter indoors; avoid trees and open fields.
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="font-semibold">🌪 Cyclone watch — "Meghna"</p>
              <p className="mt-1 text-muted-foreground">
                Category 1 · 620 km east-south-east · Winds 95 km/h · Moving west-north-west · Expected landfall in 48 hours.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Notification preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {prefs.map((p) => (
              <div key={p} className="flex items-center justify-between">
                <Label htmlFor={p} className="text-sm">
                  {p}
                </Label>
                <Switch id={p} defaultChecked />
              </div>
            ))}
            <div className="pt-2">
              <select
                aria-label="Alert language"
                value={lang}
                onChange={(e) => setLang(e.target.value as keyof typeof languages)}
                className="w-full rounded-md border border-input bg-surface-2 px-3 py-2 text-sm"
              >
                {Object.entries(languages).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 rounded-md bg-surface-2 p-2 text-sm">{languages[lang].alert}</p>
            </div>
            <Button
              className="w-full"
              onClick={() => toast.success("Preferences saved. Browser, email and SMS channels enabled.")}
            >
              Save preferences
            </Button>
            <p className="text-xs text-muted-foreground">
              Channels: browser push, in-app, email and SMS. You can unsubscribe at any time.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
