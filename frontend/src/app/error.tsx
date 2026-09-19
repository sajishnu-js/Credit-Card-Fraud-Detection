"use client";

import { useEffect } from "react";
import { ShieldAlert, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh w-full flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="glow-ring-danger flex size-14 items-center justify-center rounded-2xl bg-rose-500/10">
        <ShieldAlert className="size-7 text-rose-400" />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-xl font-semibold">Something broke the signal</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The console hit an unexpected error. You can try again, or reload the page.
        </p>
      </div>
      <Button
        onClick={reset}
        className="glow-ring border-0 bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 hover:from-cyan-300 hover:to-sky-400"
      >
        <RotateCcw />
        Try again
      </Button>
    </main>
  );
}
