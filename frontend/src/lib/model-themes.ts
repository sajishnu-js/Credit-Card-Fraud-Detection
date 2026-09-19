import { Activity, GitBranch, Rocket, type LucideIcon } from "lucide-react";

export interface ModelTheme {
  icon: LucideIcon;
  accent: string;
  accentSoft: string;
  gradient: string;
  glowShadow: string;
  motif: "linear" | "branch" | "surge";
  tagline: string;
}

export const MODEL_THEMES: Record<string, ModelTheme> = {
  logistic_regression: {
    icon: Activity,
    accent: "#38bdf8",
    accentSoft: "rgba(56, 189, 248, 0.12)",
    gradient: "from-sky-400/15 via-sky-400/0 to-transparent",
    glowShadow: "0 0 0 1px rgba(56,189,248,0.35), 0 0 30px -6px rgba(56,189,248,0.45)",
    motif: "linear",
    tagline: "The baseline",
  },
  random_forest: {
    icon: GitBranch,
    accent: "#34d399",
    accentSoft: "rgba(52, 211, 153, 0.12)",
    gradient: "from-emerald-400/15 via-emerald-400/0 to-transparent",
    glowShadow: "0 0 0 1px rgba(52,211,153,0.35), 0 0 30px -6px rgba(52,211,153,0.45)",
    motif: "branch",
    tagline: "The ensemble",
  },
  xgboost: {
    icon: Rocket,
    accent: "#c084fc",
    accentSoft: "rgba(192, 132, 252, 0.12)",
    gradient: "from-violet-400/15 via-fuchsia-400/0 to-transparent",
    glowShadow: "0 0 0 1px rgba(192,132,252,0.35), 0 0 30px -6px rgba(192,132,252,0.45)",
    motif: "surge",
    tagline: "The challenger",
  },
};

export function themeForModel(key: string): ModelTheme {
  return MODEL_THEMES[key] ?? MODEL_THEMES.logistic_regression;
}
