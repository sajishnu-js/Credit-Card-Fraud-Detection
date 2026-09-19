export const FEATURE_COLUMNS = [
  "Time",
  ...Array.from({ length: 28 }, (_, i) => `V${i + 1}`),
  "Amount",
] as const;

export type FeatureColumn = (typeof FEATURE_COLUMNS)[number];

export const MODEL_LABELS: Record<string, string> = {
  logistic_regression: "Logistic Regression",
  random_forest: "Random Forest",
  xgboost: "XGBoost",
};

export function labelForModel(key: string): string {
  return MODEL_LABELS[key] ?? key;
}
