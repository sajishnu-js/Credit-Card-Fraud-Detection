"use client";

import { useId, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  Download,
  Upload,
  FileSpreadsheet,
  Layers,
  ShieldCheck,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { predictBatch, ApiError, type PredictBatchResponse } from "@/lib/api";
import { parseCsv, toCsv, downloadCsv, type ParsedCsv } from "@/lib/csv";
import { FEATURE_COLUMNS } from "@/lib/constants";
import { cn, delay } from "@/lib/utils";
import { emitSignal } from "@/lib/signal-bus";

const MAX_SIGNAL_PULSES_PER_OUTCOME = 6;
const SIGNAL_PULSE_STAGGER_MS = 140;

/** Fires a staggered burst of live-signal pulses representing a batch result (capped, so a
 * CSV with thousands of rows doesn't spam the strip — it's a representative sample). */
async function emitBatchSignal(legitCount: number, fraudCount: number) {
  const outcomes: Array<"legit" | "fraud"> = [
    ...Array(Math.min(legitCount, MAX_SIGNAL_PULSES_PER_OUTCOME)).fill("legit"),
    ...Array(Math.min(fraudCount, MAX_SIGNAL_PULSES_PER_OUTCOME)).fill("fraud"),
  ];
  for (const outcome of outcomes) {
    emitSignal({ outcome });
    await delay(SIGNAL_PULSE_STAGGER_MS);
  }
}

export function CsvUploadPanel({
  model,
  disabled = false,
}: {
  model: string;
  disabled?: boolean;
}) {
  const inputId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [loading, setLoading] = useState(false);
  const [batchResult, setBatchResult] = useState<PredictBatchResponse | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setBatchResult(null);
    setParsed(null);

    if (!selected) return;

    setParsing(true);
    try {
      const text = await selected.text();
      setParsed(parseCsv(text));
    } catch {
      toast.error("Couldn't read that file.");
      setFile(null);
    } finally {
      setParsing(false);
    }
  }

  const missingColumns = parsed
    ? FEATURE_COLUMNS.filter((c) => !parsed.headers.includes(c))
    : [];
  const hasRows = (parsed?.rows.length ?? 0) > 0;
  const canRunPredictions =
    !disabled && !loading && !parsing && hasRows && missingColumns.length === 0;

  async function handleRunPredictions() {
    if (!file || !canRunPredictions) return;
    setLoading(true);
    setBatchResult(null);

    try {
      const response = await predictBatch(model, file);
      setBatchResult(response);
      void emitBatchSignal(response.legit_count, response.fraud_count);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to reach the API.";
      toast.error(message);
      emitSignal({ outcome: "error" });
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!parsed || !batchResult) return;

    const headers = [...parsed.headers, "Prediction", "Fraud Probability (%)", "Result"];
    const rows = parsed.rows.map((row, i) => {
      const r = batchResult.results[i];
      return [...row, String(r?.prediction ?? ""), String(r?.fraud_probability ?? ""), r?.result ?? ""];
    });

    downloadCsv("fraud_predictions.csv", toCsv(headers, rows));
  }

  const timeIdx = parsed?.headers.indexOf("Time") ?? -1;
  const amountIdx = parsed?.headers.indexOf("Amount") ?? -1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor={inputId}
          className="flex items-center gap-1.5 text-xs tracking-[0.2em] text-cyan-300/70 uppercase"
        >
          <FileSpreadsheet className="size-3.5" /> CSV file
        </Label>

        <label
          htmlFor={inputId}
          className={cn(
            "glass-panel-hover group relative flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-8 text-center transition",
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          )}
        >
          <span className="glow-ring flex size-11 items-center justify-center rounded-full bg-cyan-400/10">
            <Upload className="size-5 text-cyan-300" />
          </span>
          <span className="text-sm font-medium">
            {file ? file.name : "Click to choose a CSV file"}
          </span>
          <span className="text-xs text-muted-foreground">
            Must contain columns: Time, V1–V28, Amount
          </span>
          <input
            id={inputId}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={disabled}
            className="sr-only"
          />
        </label>
        {disabled && (
          <p className="text-xs text-rose-300/80">
            API offline — start the backend to run predictions.
          </p>
        )}
      </div>

      {parsing && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-40 bg-white/5" />
          <Skeleton className="h-32 w-full rounded-2xl bg-white/5" />
        </div>
      )}

      {parsed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-3"
        >
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Layers className="size-4 text-cyan-300/70" />
            Loaded {parsed.rows.length} transaction{parsed.rows.length === 1 ? "" : "s"}
          </p>

          {missingColumns.length > 0 && (
            <p className="flex items-center gap-1.5 text-sm text-rose-300">
              <TriangleAlert className="size-4 shrink-0" />
              Missing required column{missingColumns.length === 1 ? "" : "s"}:{" "}
              <span className="font-mono text-xs">{missingColumns.join(", ")}</span>
            </p>
          )}

          {!hasRows && missingColumns.length === 0 && (
            <p className="flex items-center gap-1.5 text-sm text-amber-300">
              <TriangleAlert className="size-4 shrink-0" />
              This file has headers but no data rows.
            </p>
          )}

          {parsed.rows.length > 0 && (
            <div className="glass-panel overflow-hidden rounded-2xl">
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      {parsed.headers.map((h) => (
                        <TableHead key={h} className="font-mono text-[11px] text-muted-foreground">
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsed.rows.slice(0, 5).map((row, i) => (
                      <TableRow key={i} className="border-white/5 hover:bg-white/[0.03]">
                        {row.map((cell, j) => (
                          <TableCell key={j} className="font-mono text-xs">
                            {cell}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}

          <div>
            <Button
              onClick={handleRunPredictions}
              disabled={!canRunPredictions}
              className="glow-ring border-0 bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 hover:from-cyan-300 hover:to-sky-400"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Upload />}
              Run Predictions
            </Button>
          </div>
        </motion.div>
      )}

      {batchResult && parsed && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-5"
        >
          <div className="grid grid-cols-3 gap-3">
            <StatTile
              label="Total Transactions"
              value={batchResult.rows_processed}
              icon={<Layers className="size-4" />}
              tone="cyan"
            />
            <StatTile
              label="Legitimate"
              value={batchResult.legit_count}
              icon={<ShieldCheck className="size-4" />}
              tone="emerald"
            />
            <StatTile
              label="Fraudulent"
              value={batchResult.fraud_count}
              icon={<ShieldAlert className="size-4" />}
              tone="rose"
            />
          </div>

          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-semibold">Prediction Results</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              className="border-white/10 bg-white/[0.03] backdrop-blur hover:border-cyan-400/40 hover:bg-white/[0.06]"
            >
              <Download />
              Download Results as CSV
            </Button>
          </div>

          <div className="glass-panel overflow-hidden rounded-2xl">
            <ScrollArea className="h-80 w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Time</TableHead>
                    <TableHead className="text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-muted-foreground">Fraud Probability (%)</TableHead>
                    <TableHead className="text-muted-foreground">Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchResult.results.map((r) => (
                    <TableRow key={r.row} className="border-white/5 hover:bg-white/[0.03]">
                      <TableCell className="font-mono text-xs">
                        {timeIdx >= 0 ? parsed.rows[r.row]?.[timeIdx] : "-"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {amountIdx >= 0 ? parsed.rows[r.row]?.[amountIdx] : "-"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {r.fraud_probability.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "rounded-full border px-2.5 py-0.5 text-[11px]",
                            r.result === "Fraud"
                              ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                              : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                          )}
                        >
                          {r.result}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "cyan" | "emerald" | "rose";
}) {
  const toneClasses = {
    cyan: "text-cyan-300 bg-cyan-400/10",
    emerald: "text-emerald-300 bg-emerald-400/10",
    rose: "text-rose-300 bg-rose-400/10",
  }[tone];

  return (
    <div className="glass-panel flex flex-col gap-2 rounded-2xl p-4">
      <span className={cn("flex size-8 items-center justify-center rounded-lg", toneClasses)}>
        {icon}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-heading text-2xl font-semibold">{value}</span>
    </div>
  );
}
