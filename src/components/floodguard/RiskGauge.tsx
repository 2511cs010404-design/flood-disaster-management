import { riskBand, bandSeverity } from "@/lib/floodguard-data";

export function RiskGauge({ score }: { score: number }) {
  const band = riskBand(score);
  const sev = bandSeverity(band);
  const color = { green: "var(--safe)", yellow: "var(--warn)", orange: "var(--high)", red: "var(--danger)" }[sev];
  const angle = (score / 100) * 360;
  return (
    <div className="flex flex-col items-center">
      <div
        className="grid h-40 w-40 place-items-center rounded-full"
        style={{
          background: `conic-gradient(${color} ${angle}deg, color-mix(in oklab, var(--muted) 70%, transparent) 0deg)`,
        }}
        role="img"
        aria-label={`Flood risk ${score} percent, ${band}`}
      >
        <div className="grid h-32 w-32 place-items-center rounded-full bg-surface">
          <span className="font-display text-4xl font-bold">{score}%</span>
          <span className="text-xs tracking-widest text-muted-foreground uppercase">{band}</span>
        </div>
      </div>
    </div>
  );
}
