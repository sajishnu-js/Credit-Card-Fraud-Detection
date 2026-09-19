const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5001";

export class ApiError extends Error {
  details?: unknown;
  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.details = details;
  }
}

export interface HealthResponse {
  status: string;
  models_loaded: string[];
  scaler_loaded: boolean;
  load_errors: string[];
}

export interface PredictResponse {
  model_used: string;
  prediction: 0 | 1;
  result: "Fraud" | "Legitimate";
  fraud_probability: number;
}

export interface BatchResultRow {
  row: number;
  prediction: 0 | 1;
  result: "Fraud" | "Legitimate";
  fraud_probability: number;
}

export interface PredictBatchResponse {
  model_used: string;
  rows_processed: number;
  fraud_count: number;
  legit_count: number;
  results: BatchResultRow[];
}

async function parseErrorBody(res: Response): Promise<string> {
  try {
    const body = await res.json();
    const base: string = body.error ?? JSON.stringify(body);
    if (Array.isArray(body.missing) && body.missing.length > 0) {
      return `${base} (${body.missing.join(", ")})`;
    }
    return base;
  } catch {
    return res.statusText || "Unknown error";
  }
}

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
  if (!res.ok) throw new ApiError(await parseErrorBody(res));
  return res.json();
}

export async function predict(
  model: string,
  features: Record<string, number>
): Promise<PredictResponse> {
  const res = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, features }),
  });
  if (!res.ok) throw new ApiError(await parseErrorBody(res));
  return res.json();
}

export async function predictBatch(
  model: string,
  file: File
): Promise<PredictBatchResponse> {
  const formData = new FormData();
  formData.append("model", model);
  formData.append("file", file);

  const res = await fetch(`${API_URL}/predict_batch`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new ApiError(await parseErrorBody(res));
  return res.json();
}
