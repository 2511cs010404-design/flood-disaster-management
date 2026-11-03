import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";

const LiveMap = lazy(() => import("@/components/floodguard/LiveMap"));

function Skeleton({ height }: { height: number }) {
  return (
    <div
      style={{ height }}
      className="flex w-full animate-pulse items-center justify-center rounded-xl border border-border bg-surface-2 text-sm text-muted-foreground"
    >
      Loading live map…
    </div>
  );
}

export function LiveMapPanel({ height = 520 }: { height?: number }) {
  return (
    <ClientOnly fallback={<Skeleton height={height} />}>
      <Suspense fallback={<Skeleton height={height} />}>
        <LiveMap height={height} />
      </Suspense>
    </ClientOnly>
  );
}
