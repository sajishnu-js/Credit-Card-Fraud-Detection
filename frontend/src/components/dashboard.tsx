"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldHalf, WifiOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ApiStatusBadge } from "@/components/api-status-badge";
import { ModelSelector } from "@/components/model-selector";
import { ManualEntryForm } from "@/components/manual-entry-form";
import { CsvUploadPanel } from "@/components/csv-upload-panel";
import { ModelMetricsPanel } from "@/components/model-metrics-panel";
import { HeroSection } from "@/components/hero-section";
import { PulseMonitor } from "@/components/pulse-monitor";
import { SpotlightPanel } from "@/components/spotlight-panel";
import { HudCorners } from "@/components/hud-corners";
import { useHealth } from "@/hooks/use-health";
import { MODEL_LABELS, labelForModel } from "@/lib/constants";

export function Dashboard() {
  const { status, health } = useHealth();
  const [model, setModel] = useState<string>(Object.keys(MODEL_LABELS)[0]);

  const availableModels = health?.models_loaded ?? [];
  const activeModel = availableModels.includes(model) ? model : (availableModels[0] ?? model);

  return (
    <div className="relative flex min-h-dvh w-full flex-col">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="glow-ring flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-indigo-500/20">
              <ShieldHalf className="size-5 text-cyan-300" />
            </span>
            <div className="leading-tight">
              <p className="font-heading text-sm font-semibold tracking-[0.2em] text-foreground uppercase">
                Sentinel
              </p>
              <p className="text-[11px] text-muted-foreground">
                Fraud Intelligence Console
              </p>
            </div>
          </div>
          <ApiStatusBadge status={status} health={health} />
        </div>
      </header>

      <AnimatePresence>
        {status === "offline" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-b border-rose-500/20 bg-rose-500/[0.06]"
          >
            <div className="mx-auto flex w-full max-w-5xl items-center gap-2.5 px-4 py-2.5 text-sm text-rose-200 sm:px-6">
              <WifiOff className="size-4 shrink-0" />
              <span>
                Can&apos;t reach the inference API at{" "}
                <code className="font-mono text-xs text-rose-100">
                  {process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5001"}
                </code>
                . Start it with{" "}
                <code className="font-mono text-xs text-rose-100">python api.py</code>.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <HeroSection />

      <main
        id="console"
        className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <SpotlightPanel className="glass-panel rounded-3xl p-5 sm:p-8">
            <HudCorners />
            <div className="mb-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="font-heading text-lg font-semibold">Transaction Check</h2>
                <p className="text-sm text-muted-foreground">
                  Run predictions manually or in bulk via CSV upload.
                </p>
              </div>
              <PulseMonitor status={status} />
            </div>

            <div className="flex flex-col gap-6">
              <ModelSelector
                value={activeModel}
                onChange={setModel}
                availableModels={availableModels}
              />

              <Separator className="bg-white/10" />

              <Tabs defaultValue="manual">
                <TabsList className="border border-white/10 bg-white/5 backdrop-blur">
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  <TabsTrigger value="csv">Upload CSV</TabsTrigger>
                </TabsList>
                <TabsContent value="manual" className="pt-6">
                  <ManualEntryForm model={activeModel} disabled={status === "offline"} />
                </TabsContent>
                <TabsContent value="csv" className="pt-6">
                  <CsvUploadPanel model={activeModel} disabled={status === "offline"} />
                </TabsContent>
              </Tabs>
            </div>
          </SpotlightPanel>
        </motion.div>

        <ModelMetricsPanel selectedModel={activeModel} />

        <p className="pb-4 text-center text-xs text-muted-foreground">
          Model: {labelForModel(activeModel)} · Sentinel Fraud Intelligence Console
        </p>
      </main>
    </div>
  );
}
