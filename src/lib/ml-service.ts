import type { Urgency } from "./reports/types";

const FASTAPI_BASE_URL =
  (import.meta.env.VITE_FASTAPI_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:8000";

/**
 * Placeholder ML service for urgency classification.
 * Replace the body of `predictUrgency` with a real `fetch("/api/predict", ...)`
 * call once the backend Machine Learning API is available.
 *
 * Expected backend contract:
 *   POST /predict   { text: string }  ->  { urgency: "Critical" | "High" | "Medium" | "Low" }
 */
export async function predictUrgency(text: string): Promise<Urgency> {
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/v1/ml/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error("Prediction failed");
    const json = await res.json();
    const u = json.urgency ?? json.label;
    // ensure matches Urgency type
    return (u as Urgency) || "Low";
  } catch (e) {
    return "Low";
  }
}
