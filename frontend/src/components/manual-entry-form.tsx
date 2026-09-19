"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RotateCcw, Zap, Waypoints, Wand2, Info } from "lucide-react";
import { toast } from "sonner";
import { predict, ApiError, type PredictResponse } from "@/lib/api";
import { FEATURE_COLUMNS } from "@/lib/constants";
import { delay } from "@/lib/utils";
import { emitSignal } from "@/lib/signal-bus";
import { PredictionResult } from "@/components/prediction-result";
import { PredictLoadingOverlay } from "@/components/predict-loading-overlay";
import { MagneticButton } from "@/components/magnetic-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const MIN_SCAN_MS = 1500;

const EMPTY_VALUES: Record<string, string> = Object.fromEntries(
  FEATURE_COLUMNS.map((col) => [col, "0"])
);

const PCA_COLUMNS = FEATURE_COLUMNS.filter((c) => c.startsWith("V"));

// Illustrative sample vectors (not real cardholder data) shaped to nudge the
// models toward each outcome, based on the dataset's published feature
// importances — V14, V4, V12 and Amount are the strongest fraud signals.
const SAMPLE_LEGIT: Record<string, string> = {
  ...EMPTY_VALUES,
  Time: "40000",
  Amount: "24.99",
  V1: "-1.1",
  V3: "1.4",
  V4: "0.3",
  V10: "0.2",
  V12: "0.4",
  V14: "0.5",
  V17: "0.2",
};

const SAMPLE_FRAUD: Record<string, string> = {
  ...EMPTY_VALUES,
  Time: "80000",
  Amount: "1.0",
  V1: "-3.2",
  V2: "2.9",
  V3: "-4.6",
  V4: "4.1",
  V10: "-5.3",
  V11: "3.7",
  V12: "-6.2",
  V14: "-8.1",
  V17: "-5.4",
};

export function ManualEntryForm({
  model,
  disabled = false,
}: {
  model: string;
  disabled?: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>(EMPTY_VALUES);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictResponse | null>(null);

  function handleChange(field: string, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleReset() {
    setValues(EMPTY_VALUES);
    setResult(null);
  }

  function handleSample(sample: Record<string, string>) {
    setValues(sample);
    setResult(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const features = Object.fromEntries(
        FEATURE_COLUMNS.map((col) => [col, Number(values[col] || 0)])
      );
      const [response] = await Promise.all([predict(model, features), delay(MIN_SCAN_MS)]);
      setResult(response);
      emitSignal({ outcome: response.prediction === 1 ? "fraud" : "legit" });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to reach the API.";
      toast.error(message);
      emitSignal({ outcome: "error" });
    } finally {
      setLoading(false);
    }
  }

  const isDisabled = disabled || loading;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs tracking-[0.2em] text-cyan-300/70 uppercase">
            <Zap className="size-3.5" />
            Transaction
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSample(SAMPLE_LEGIT)}
              disabled={isDisabled}
              className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-emerald-400/30 hover:text-emerald-300 disabled:pointer-events-none disabled:opacity-40"
            >
              <Wand2 className="size-3" /> Sample: legitimate
            </button>
            <button
              type="button"
              onClick={() => handleSample(SAMPLE_FRAUD)}
              disabled={isDisabled}
              className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-rose-400/30 hover:text-rose-300 disabled:pointer-events-none disabled:opacity-40"
            >
              <Wand2 className="size-3" /> Sample: fraud-like
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:max-w-md">
          {(["Time", "Amount"] as const).map((col) => (
            <div key={col} className="flex flex-col gap-1.5">
              <Label htmlFor={col} className="text-xs text-muted-foreground">
                {col}
              </Label>
              <Input
                id={col}
                type="number"
                step="any"
                value={values[col]}
                onChange={(e) => handleChange(col, e.target.value)}
                disabled={isDisabled}
                className="h-10 border-white/10 bg-white/[0.03] text-base font-medium focus-visible:ring-cyan-400/30"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5 text-xs tracking-[0.2em] text-cyan-300/70 uppercase">
          <Waypoints className="size-3.5" />
          PCA Components · V1–V28
          <Tooltip>
            <TooltipTrigger
              aria-label="What are PCA components?"
              className="text-muted-foreground/60 normal-case transition hover:text-cyan-300"
            >
              <Info className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent className="max-w-64 normal-case">
              V1–V28 are anonymised, PCA-transformed transaction features from the original
              dataset — protecting cardholder privacy while preserving predictive signal.
              V14 is the strongest fraud indicator.
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-7">
          {PCA_COLUMNS.map((col) => (
            <div key={col} className="flex flex-col gap-1">
              <Label htmlFor={col} className="font-mono text-[11px] text-muted-foreground">
                {col}
              </Label>
              <Input
                id={col}
                type="number"
                step="any"
                value={values[col]}
                onChange={(e) => handleChange(col, e.target.value)}
                disabled={isDisabled}
                className="h-8 border-white/10 bg-white/[0.03] font-mono text-xs focus-visible:ring-cyan-400/30"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <MagneticButton
            type="submit"
            disabled={isDisabled}
            className="glow-ring border-0 bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 hover:from-cyan-300 hover:to-sky-400"
          >
            Predict
          </MagneticButton>
          <Button type="button" variant="outline" onClick={handleReset} disabled={isDisabled}>
            <RotateCcw />
            Reset
          </Button>
        </div>
        {disabled && (
          <p className="text-xs text-rose-300/80">
            API offline — start the backend to run predictions.
          </p>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <PredictLoadingOverlay key="scanning" model={model} />
        ) : result ? (
          <PredictionResult key="result" result={result} />
        ) : null}
      </AnimatePresence>
    </form>
  );
}
