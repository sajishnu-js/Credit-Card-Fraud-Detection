export function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0b1330] via-background to-background" />

      <div className="animate-float-slow absolute -top-40 -left-32 size-[36rem] rounded-full bg-cyan-500/25 blur-[120px]" />
      <div className="animate-float-slow-reverse absolute top-1/3 -right-40 size-[32rem] rounded-full bg-indigo-500/20 blur-[130px]" />
      <div className="animate-pulse-glow absolute bottom-[-10rem] left-1/4 size-[30rem] rounded-full bg-violet-500/15 blur-[140px]" />

      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in oklch, white 6%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklch, white 6%, transparent) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 90%)",
        }}
      />

      <div className="noise-overlay absolute inset-0 opacity-[0.04] mix-blend-overlay" />
    </div>
  );
}
