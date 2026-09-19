"use client";

import { motion } from "motion/react";
import { Progress } from "@/components/ui/progress";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import type { PredictResponse } from "@/lib/api";
import { labelForModel } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function PredictionResult({ result }: { result: PredictResponse }) {
  const isFraud = result.prediction === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "glass-panel flex items-start gap-4 rounded-2xl p-5",
        isFraud ? "glow-ring-danger" : "glow-ring"
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          isFraud ? "bg-rose-500/15 text-rose-400" : "bg-emerald-500/15 text-emerald-400"
        )}
      >
        {isFraud ? <ShieldAlert className="size-5" /> : <ShieldCheck className="size-5" />}
      </span>

      <div className="flex flex-1 flex-col gap-2.5">
        <p className="font-heading text-base font-semibold">
          {isFraud ? "Fraudulent transaction detected" : "Legitimate transaction"}
        </p>
        <p className="text-sm text-muted-foreground">
          Fraud probability:{" "}
          <strong className={cn("font-semibold", isFraud ? "text-rose-300" : "text-emerald-300")}>
            {result.fraud_probability.toFixed(2)}%
          </strong>{" "}
          · Model: {labelForModel(result.model_used)}
        </p>
        <Progress
          value={result.fraud_probability}
          className={cn(
            "[&_[data-slot=progress-track]]:bg-white/10",
            isFraud
              ? "[&_[data-slot=progress-indicator]]:bg-rose-400"
              : "[&_[data-slot=progress-indicator]]:bg-emerald-400"
          )}
        />
      </div>
    </motion.div>
  );
}
