"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { Radar, ChevronDown, Layers, ShieldAlert, Cpu } from "lucide-react";
import { AnimatedNumber } from "@/components/animated-number";
import { FloatingTransactionChips } from "@/components/floating-transaction-chips";
import { TiltCard } from "@/components/tilt-card";

const DataMeshScene = dynamic(
  () => import("./three/data-mesh-scene").then((m) => m.DataMeshScene),
  { ssr: false }
);

const STATS = [
  { value: 283726, label: "Transactions analyzed", icon: Layers },
  { value: 473, label: "Fraud cases modeled", icon: ShieldAlert },
  { value: 3, label: "Ensemble models", icon: Cpu },
];

export function HeroSection() {
  return (
    <section className="relative flex min-h-[86dvh] w-full flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <DataMeshScene />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_25%,_var(--background)_88%)]" />

      <FloatingTransactionChips />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 text-center sm:px-6">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] tracking-[0.25em] text-cyan-300/80 uppercase backdrop-blur"
        >
          <Radar className="size-3.5" /> Real-time inference
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="font-heading text-4xl leading-[1.05] font-semibold tracking-tight sm:text-6xl"
        >
          Detect fraud <br className="hidden sm:block" />
          before it <span className="gradient-text">settles</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18 }}
          className="max-w-lg text-sm text-muted-foreground sm:text-base"
        >
          An ensemble of Logistic Regression, Random Forest, and XGBoost scoring
          transactions in real time — one at a time, or thousands via CSV.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-4 grid w-full grid-cols-3 gap-3 sm:max-w-xl"
        >
          {STATS.map((stat) => (
            <TiltCard key={stat.label} maxTilt={6}>
              <div className="glass-panel-hover glass-panel flex flex-col items-center gap-1.5 rounded-2xl px-2 py-4">
                <span className="flex size-8 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
                  <stat.icon className="size-4" />
                </span>
                <span className="font-heading text-xl font-semibold text-cyan-200 tabular-nums sm:text-2xl">
                  <AnimatedNumber value={stat.value} />
                </span>
                <span className="text-center text-[10px] text-muted-foreground uppercase tracking-wide sm:text-[11px]">
                  {stat.label}
                </span>
              </div>
            </TiltCard>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-muted-foreground/60"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="size-5" />
        </motion.div>
      </motion.div>
    </section>
  );
}
