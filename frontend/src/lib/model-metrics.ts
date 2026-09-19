export interface ModelMetric {
  key: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  rocAuc: number;
  note: string;
}

// Evaluated on a held-out 20% stratified split of the Kaggle "Credit Card Fraud
// Detection" dataset (283,726 transactions, 473 fraudulent after de-duplication).
export const MODEL_METRICS: ModelMetric[] = [
  {
    key: "logistic_regression",
    accuracy: 97.58,
    precision: 6,
    recall: 87,
    f1: 11,
    rocAuc: 96.55,
    note: "Highest recall, but too many false alarms for production.",
  },
  {
    key: "random_forest",
    accuracy: 99.94,
    precision: 89,
    recall: 75,
    f1: 81,
    rocAuc: 96.5,
    note: "Best precision/F1 balance — recommended for deployment.",
  },
  {
    key: "xgboost",
    accuracy: 99.87,
    precision: 59,
    recall: 80,
    f1: 68,
    rocAuc: 97.34,
    note: "Highest ROC AUC with native class-imbalance handling.",
  },
];
