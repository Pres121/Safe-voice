import type { Urgency } from "./reports/types";

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
    const res = await fetch("http://localhost:8000/predict", {
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
