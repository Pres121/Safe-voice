import type { Urgency } from "./reports/types";
import { FASTAPI_BASE_URL } from "./api/backend";

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
