import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, LogIn, ShieldCheck, UserPlus } from "lucide-react";
import { AppShell } from "@/components/floodguard/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { districtRainfall } from "@/lib/floodguard-data";
import { demoRoles, getDemoUser, setDemoUser, type DemoRole } from "@/lib/demo-auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — FloodGuard Early Warning Portal" },
      {
        name: "description",
        content:
          "Sign in or register for FloodGuard to receive district-wise rainfall, flood risk and emergency alerts.",
      },
      { property: "og:title", content: "Sign in — FloodGuard Early Warning Portal" },
      {
        property: "og:description",
        content: "Access personalised flood and rainfall alerts for your district.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("Hyderabad");
  const [role, setRole] = useState<DemoRole>("citizen");
  const [existing, setExisting] = useState<string | null>(null);

  useEffect(() => {
    setExisting(getDemoUser()?.name ?? null);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (mode === "register" && !name.trim())) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      setDemoUser({
        name: name.trim() || email.split("@")[0] || "Citizen",
        email: email.trim(),
        phone: phone.trim(),
        district,
        role,
        signedInAt: new Date().toISOString(),
      });
      setBusy(false);
      toast.success(mode === "login" ? "Signed in (demo mode)" : "Account created (demo mode)");
      navigate({ to: role === "admin" ? "/admin" : "/" });
    }, 700);
  }

  return (
    <AppShell>
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <section className="animate-in fade-in slide-in-from-left-6 duration-700">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            FloodGuard access
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">
            Stay a step ahead of the storm.
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Sign in to personalise rainfall, flood-risk and cyclone alerts for your district, save
            emergency contacts and access the control-room console.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "District-wise red / orange / yellow warnings",
              "Browser, SMS and voice alert preferences",
              "Shelter locator and one-tap SOS",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" /> {t}
              </li>
            ))}
          </ul>
          {existing && (
            <p className="mt-6 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm">
              Last session: <span className="font-semibold">{existing}</span>
            </p>
          )}
        </section>

        <section className="glass animate-in fade-in slide-in-from-bottom-6 rounded-2xl p-6 duration-700 sm:p-8">
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-2 p-1">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition-all ${
                  mode === m
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "login" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "register" && (
              <div className="animate-in fade-in slide-in-from-top-2 space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Asha Reddy" maxLength={80} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" maxLength={72} />
            </div>
            {mode === "register" && (
              <div className="animate-in fade-in grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile (for SMS alerts)</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 90000 00000" maxLength={20} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <select
                    id="district"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-surface-2 px-3 text-sm"
                  >
                    {districtRainfall.map((d) => (
                      <option key={d.district} value={d.district}>
                        {d.district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Account type</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {demoRoles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`rounded-lg border p-3 text-left text-xs transition-all hover:-translate-y-0.5 ${
                      role === r.value
                        ? "border-primary bg-primary/10"
                        : "border-border bg-surface-2"
                    }`}
                  >
                    <span className="block text-sm font-semibold">{r.label}</span>
                    <span className="text-muted-foreground">{r.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : mode === "login" ? (
                <LogIn className="mr-2 h-4 w-4" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Demo mode — no real accounts are created and any credentials are accepted. Details are
              stored only in this browser.
            </p>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
