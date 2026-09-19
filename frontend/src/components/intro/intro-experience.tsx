"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Sparkles as SparkleIcon } from "lucide-react";

const OrbScene = dynamic(() => import("./orb-scene").then((m) => m.OrbScene), {
  ssr: false,
});

const BOOT_LINES = [
  "Initializing neural fraud engine…",
  "Loading Logistic Regression · Random Forest · XGBoost…",
  "Calibrating anomaly thresholds…",
  "Establishing secure link to inference API…",
];

const DURATION_MS = 3600;

export function IntroExperience({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const completedRef = useRef(false);

  const complete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const startedAt = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const p = Math.min(1, (now - startedAt) / DURATION_MS);
      setProgress(p);
      if (p >= 1) {
        complete();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [complete]);

  const pct = Math.round(progress * 100);
  const lineIndex = Math.min(BOOT_LINES.length - 1, Math.floor(progress * BOOT_LINES.length));

  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(1.5px 1.5px at 20% 30%, white 100%, transparent), radial-gradient(1.5px 1.5px at 75% 15%, white 100%, transparent), radial-gradient(1px 1px at 45% 65%, white 100%, transparent), radial-gradient(1px 1px at 88% 55%, white 100%, transparent), radial-gradient(1.5px 1.5px at 10% 80%, white 100%, transparent), radial-gradient(1px 1px at 60% 85%, white 100%, transparent), radial-gradient(1px 1px at 92% 90%, white 100%, transparent), radial-gradient(1.5px 1.5px at 33% 12%, white 100%, transparent)",
          backgroundSize: "100% 100%",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-1 px-6 text-center">
        <div className="pointer-events-none relative size-56 sm:size-72">
          <div className="absolute inset-6 rounded-full bg-cyan-400/25 blur-[70px]" />
          <OrbScene />
        </div>

        <span className="-mt-2 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs tracking-[0.3em] text-cyan-300/80 uppercase backdrop-blur">
          <SparkleIcon className="size-3.5" /> Neural Fraud Intelligence
        </span>

        <h1 className="font-heading gradient-text pt-4 text-5xl font-semibold tracking-tight sm:text-7xl">
          SENTINEL
        </h1>

        <p className="max-w-md pt-2 text-sm text-muted-foreground sm:text-base">
          A real-time inference console guarding every transaction with ensemble machine
          intelligence.
        </p>

        <div className="mt-8 flex w-72 flex-col items-center gap-3 sm:w-96">
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 shadow-[0_0_12px_rgba(56,189,248,0.8)] transition-[width] duration-150 ease-linear"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex w-full items-center justify-between font-mono text-[11px] text-muted-foreground">
            <AnimatePresence mode="wait">
              <motion.span
                key={lineIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
              >
                {BOOT_LINES[lineIndex]}
              </motion.span>
            </AnimatePresence>
            <span>{pct}%</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={complete}
        className="absolute right-6 bottom-8 z-10 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-muted-foreground backdrop-blur transition hover:border-cyan-400/40 hover:text-cyan-200 sm:right-8"
      >
        Skip intro <ArrowRight className="size-3.5" />
      </button>
    </div>
  );
}
