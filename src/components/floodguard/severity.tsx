import type { Severity } from "@/lib/floodguard-data";

export const severityLabel: Record<Severity, string> = {
  green: "GREEN — NORMAL",
  yellow: "YELLOW — BE AWARE",
  orange: "ORANGE — BE PREPARED",
  red: "RED — TAKE ACTION",
};

export const severityText: Record<Severity, string> = {
  green: "text-safe",
  yellow: "text-warn",
  orange: "text-high",
  red: "text-danger",
};

export const severityChip: Record<Severity, string> = {
  green: "bg-safe/15 text-safe border-safe/40",
  yellow: "bg-warn/15 text-warn border-warn/40",
  orange: "bg-high/15 text-high border-high/40",
  red: "bg-danger/20 text-danger border-danger/50",
};

export const severityDot: Record<Severity, string> = {
  green: "bg-safe",
  yellow: "bg-warn",
  orange: "bg-high",
  red: "bg-danger",
};

export function SeverityBadge({ severity, children }: { severity: Severity; children?: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase ${severityChip[severity]}`}
    >
      <span className={`h-2 w-2 rounded-full ${severityDot[severity]}`} aria-hidden />
      {children ?? severityLabel[severity]}
    </span>
  );
}
