"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import { labelForModel } from "@/lib/constants";

const ScanScene = dynamic(() => import("./three/scan-scene").then((m) => m.ScanScene), {
  ssr: false,
});

const STAGES = [
  "Extracting feature vector…",
  "Scaling Time & Amount…",
  "Scoring with {model}…",
  "Aggregating probability…",
];

export function PredictLoadingOverlay({ model }: { model: string }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStage((s) => Math.min(STAGES.length - 1, s + 1));
    }, 420);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel glow-ring relative h-64 overflow-hidden rounded-2xl"
    >
      <div className="absolute inset-0">
        <ScanScene />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_var(--background)_92%)]" />

      <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={stage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="rounded-full border border-white/10 bg-background/70 px-3 py-1 font-mono text-xs text-cyan-200/90 backdrop-blur"
          >
            {STAGES[stage].replace("{model}", labelForModel(model))}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
