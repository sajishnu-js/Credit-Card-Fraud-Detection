import Link from "next/link";
import { ShieldHalf, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh w-full flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="glow-ring flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-indigo-500/20">
        <ShieldHalf className="size-7 text-cyan-300" />
      </span>
      <div className="flex flex-col gap-2">
        <p className="font-heading gradient-text text-6xl font-semibold">404</p>
        <h1 className="font-heading text-xl font-semibold">Signal not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          This transaction path doesn&apos;t exist in the Sentinel console. Let&apos;s get
          you back to the dashboard.
        </p>
      </div>
      <Button
        render={<Link href="/" />}
        nativeButton={false}
        className="glow-ring border-0 bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 hover:from-cyan-300 hover:to-sky-400"
      >
        <ArrowLeft />
        Back to dashboard
      </Button>
    </main>
  );
}
