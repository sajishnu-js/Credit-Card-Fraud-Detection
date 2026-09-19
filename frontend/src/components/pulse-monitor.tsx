"use client";

import dynamic from "next/dynamic";
import { Activity } from "lucide-react";
import type { HealthStatus } from "@/hooks/use-health";
import { cn } from "@/lib/utils";

const PulseScene = dynamic(() => import("./three/pulse-scene").then((m) => m.PulseScene), {
  ssr: false,
});

export function PulseMonitor({ status }: { status: HealthStatus }) {
  const online = status === "online";

  return (
    <div className="flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-2.5">
      <span className="flex shrink-0 items-center gap-1.5 text-[10px] tracking-[0.2em] text-cyan-300/70 uppercase">
        <Activity className="size-3.5" />
        Live signal
        <span
          className={cn(
            "size-1.5 rounded-full",
            online ? "animate-pulse bg-emerald-400" : "bg-rose-500"
          )}
          title={online ? "Receiving live predictions" : "API offline — no signal"}
        />
      </span>
      <div className="h-8 min-w-0 flex-1">
        <PulseScene online={online} />
      </div>
    </div>
  );
}
