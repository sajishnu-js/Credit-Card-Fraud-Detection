"use client";

import { motion } from "motion/react";
import { BarChart3 } from "lucide-react";
import { MODEL_METRICS, type ModelMetric } from "@/lib/model-metrics";
import { labelForModel } from "@/lib/constants";
import { themeForModel } from "@/lib/model-themes";
import { ModelMotif } from "@/components/model-motif";
import { TiltCard } from "@/components/tilt-card";
import { AnimatedNumber } from "@/components/animated-number";
import { cn } from "@/lib/utils";

const STATS: { key: "accuracy" | "precision" | "recall" | "f1" | "rocAuc"; label: string }[] = [
  { key: "accuracy", label: "Accuracy" },
  { key: "precision", label: "Precision" },
  { key: "recall", label: "Recall" },
  { key: "f1", label: "F1" },
  { key: "rocAuc", label: "ROC AUC" },
];

export function ModelMetricsPanel({ selectedModel }: { selectedModel: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs tracking-[0.2em] text-cyan-300/70 uppercase">
          <BarChart3 className="size-3.5" />
          Model Performance
        </div>
        <p className="text-sm text-muted-foreground">
          Benchmarked on a held-out 20% split of 283,726 transactions (0.17% fraud rate).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {MODEL_METRICS.map((metric, i) => (
          <ModelCard
            key={metric.key}
            metric={metric}
            isActive={metric.key === selectedModel}
            delay={i * 0.08}
          />
        ))}
      </div>
    </motion.div>
  );
}

function ModelCard({
  metric,
  isActive,
  delay,
}: {
  metric: ModelMetric;
  isActive: boolean;
  delay: number;
}) {
  const theme = themeForModel(metric.key);
  const Icon = theme.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <TiltCard maxTilt={6} className="h-full">
        <div
          className={cn(
            "glass-panel relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl p-5 transition-shadow duration-300"
          )}
          style={{ boxShadow: isActive ? theme.glowShadow : undefined }}
        >
          <div
            className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br", theme.gradient)}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24" style={{ color: theme.accent }}>
            <ModelMotif motif={theme.motif} />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <span
              className="flex size-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: theme.accentSoft, color: theme.accent }}
            >
              <Icon className="size-4.5" />
            </span>
            {isActive && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] tracking-wide uppercase"
                style={{ backgroundColor: theme.accentSoft, color: theme.accent }}
              >
                Selected
              </span>
            )}
          </div>

          <div className="relative z-10 flex flex-col gap-0.5">
            <h3 className="font-heading text-sm font-semibold">{labelForModel(metric.key)}</h3>
            <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
              {theme.tagline}
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-x-4 gap-y-2.5">
            {STATS.map((stat) => (
              <div key={stat.key} className="flex flex-col gap-1">
                <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
                  {stat.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-heading text-sm font-semibold tabular-nums">
                    <AnimatedNumber value={metric[stat.key]} />%
                  </span>
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: theme.accent }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${metric[stat.key]}%` }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.9, delay: delay + 0.15, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="relative z-10 text-xs text-muted-foreground">{metric.note}</p>
        </div>
      </TiltCard>
    </motion.div>
  );
}
