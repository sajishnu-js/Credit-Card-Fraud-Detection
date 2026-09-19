"use client";

import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CheckCircle2, XCircle, Loader2, CircleSlash } from "lucide-react";
import type { HealthResponse } from "@/lib/api";
import type { HealthStatus } from "@/hooks/use-health";
import { MODEL_LABELS, labelForModel } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ApiStatusBadge({
  status,
  health,
}: {
  status: HealthStatus;
  health: HealthResponse | null;
}) {
  if (status === "loading") {
    return (
      <Badge
        variant="secondary"
        className="h-7 gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-[11px] backdrop-blur"
      >
        <Loader2 className="size-3 animate-spin" />
        Checking API…
      </Badge>
    );
  }

  if (status === "offline") {
    return (
      <Badge className="glow-ring-danger h-7 gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 text-[11px] text-rose-300">
        <XCircle className="size-3" />
        API offline
      </Badge>
    );
  }

  const loaded = health?.models_loaded ?? [];
  const allModels = Object.keys(MODEL_LABELS);

  return (
    <HoverCard>
      <HoverCardTrigger
        delay={100}
        closeDelay={80}
        render={
          <Badge className="h-7 cursor-default gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 text-[11px] text-emerald-300 shadow-[0_0_18px_-4px_rgba(52,211,153,0.5)]" />
        }
      >
        <CheckCircle2 className="size-3" />
        API online · {loaded.length} models
      </HoverCardTrigger>
      <HoverCardContent
        align="end"
        className="glass-panel w-64 rounded-2xl border-white/10 p-4"
      >
        <p className="mb-3 text-xs tracking-[0.2em] text-cyan-300/70 uppercase">
          Inference Engine Status
        </p>
        <ul className="flex flex-col gap-2">
          {allModels.map((key) => {
            const isLoaded = loaded.includes(key);
            return (
              <li key={key} className="flex items-center justify-between text-sm">
                <span className="text-foreground/90">{labelForModel(key)}</span>
                {isLoaded ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-300">
                    <CheckCircle2 className="size-3.5" /> Ready
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CircleSlash className="size-3.5" /> Unavailable
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        <div
          className={cn(
            "mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-xs",
            health?.scaler_loaded ? "text-muted-foreground" : "text-rose-300"
          )}
        >
          <span>Feature scaler</span>
          <span>{health?.scaler_loaded ? "Loaded" : "Missing"}</span>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
