"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface Chip {
  amount: string;
  risk: string;
  flagged: boolean;
  className: string;
  depth: number;
  delay: number;
  duration: number;
  rotate: number;
}

const CHIPS: Chip[] = [
  {
    amount: "$1,204.50",
    risk: "2%",
    flagged: false,
    className: "top-[14%] left-[6%]",
    depth: 0.9,
    delay: 0,
    duration: 7,
    rotate: -8,
  },
  {
    amount: "$89.99",
    risk: "1%",
    flagged: false,
    className: "top-[62%] left-[10%]",
    depth: 0.7,
    delay: 1.2,
    duration: 8.5,
    rotate: 6,
  },
  {
    amount: "$5,430.00",
    risk: "94%",
    flagged: true,
    className: "top-[24%] right-[7%]",
    depth: 1,
    delay: 0.6,
    duration: 6.5,
    rotate: 7,
  },
  {
    amount: "$14.20",
    risk: "3%",
    flagged: false,
    className: "top-[70%] right-[12%]",
    depth: 0.6,
    delay: 1.8,
    duration: 9,
    rotate: -5,
  },
  {
    amount: "$2,999.00",
    risk: "88%",
    flagged: true,
    className: "top-[42%] left-[3%]",
    depth: 0.5,
    delay: 2.4,
    duration: 7.5,
    rotate: -10,
  },
];

export function FloatingTransactionChips() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[1] hidden lg:block">
      {CHIPS.map((chip, i) => (
        <motion.div
          key={i}
          className={cn("absolute", chip.className)}
          style={{
            opacity: chip.depth,
            filter: `blur(${(1 - chip.depth) * 1.5}px)`,
            transform: `perspective(600px) rotateY(${chip.rotate}deg)`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: chip.depth,
            y: [0, -14, 0],
          }}
          transition={{
            opacity: { duration: 1, delay: 0.6 + chip.delay * 0.3 },
            y: {
              duration: chip.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: chip.delay,
            },
          }}
        >
          <div
            className={cn(
              "glass-panel flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] shadow-lg",
              chip.flagged ? "border-rose-400/25" : "border-emerald-400/20"
            )}
            style={{ transform: `scale(${0.85 + chip.depth * 0.25})` }}
          >
            <span
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                chip.flagged ? "bg-rose-400" : "bg-emerald-400"
              )}
            />
            <span className="font-mono text-foreground/80">{chip.amount}</span>
            <span
              className={cn(
                "font-mono",
                chip.flagged ? "text-rose-300" : "text-emerald-300/80"
              )}
            >
              {chip.risk}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
