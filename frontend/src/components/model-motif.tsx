import type { ModelTheme } from "@/lib/model-themes";

export function ModelMotif({ motif }: { motif: ModelTheme["motif"] }) {
  if (motif === "linear") {
    return (
      <svg
        aria-hidden
        viewBox="0 0 200 100"
        className="absolute inset-0 h-full w-full opacity-[0.14]"
        preserveAspectRatio="none"
      >
        <polyline
          points="0,80 30,72 55,78 80,40 110,55 140,20 170,32 200,8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1={0}
            x2={200}
            y1={20 + i * 20}
            y2={20 + i * 20}
            stroke="currentColor"
            strokeWidth="0.5"
            opacity={0.4}
          />
        ))}
      </svg>
    );
  }

  if (motif === "branch") {
    return (
      <svg
        aria-hidden
        viewBox="0 0 200 100"
        className="absolute inset-0 h-full w-full opacity-[0.14]"
        preserveAspectRatio="none"
      >
        <g fill="none" stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke">
          <path d="M100,100 L100,60" />
          <path d="M100,60 L60,30" />
          <path d="M100,60 L140,30" />
          <path d="M100,60 L100,20" />
          <path d="M60,30 L40,5" />
          <path d="M60,30 L70,5" />
          <path d="M140,30 L130,5" />
          <path d="M140,30 L160,5" />
        </g>
        {[
          [100, 100],
          [100, 60],
          [60, 30],
          [140, 30],
          [100, 20],
          [40, 5],
          [70, 5],
          [130, 5],
          [160, 5],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={2.4} fill="currentColor" />
        ))}
      </svg>
    );
  }

  return (
    <svg
      aria-hidden
      viewBox="0 0 200 100"
      className="absolute inset-0 h-full w-full opacity-[0.14]"
      preserveAspectRatio="none"
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={i}
          d={`M ${-20 + i * 40},110 L ${20 + i * 40},-10`}
          stroke="currentColor"
          strokeWidth="6"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
