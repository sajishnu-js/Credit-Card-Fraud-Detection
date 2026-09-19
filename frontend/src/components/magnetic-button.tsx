"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MagneticButton({
  className,
  children,
  strength = 0.35,
  ...props
}: React.ComponentProps<typeof Button> & { strength?: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 250, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 250, damping: 18, mass: 0.4 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      className="inline-block"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Button className={cn("transition-shadow active:scale-95", className)} {...props}>
        {children}
      </Button>
    </motion.div>
  );
}
