"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

export function AnimatedNumber({
  value,
  duration = 900,
  decimals,
}: {
  value: number;
  duration?: number;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  const places = decimals ?? (Number.isInteger(value) ? 0 : 2);

  useEffect(() => {
    if (!inView) return;

    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  const formatted =
    places === 0
      ? Math.round(display).toLocaleString("en-US")
      : display.toFixed(places);

  return <span ref={ref}>{formatted}</span>;
}
