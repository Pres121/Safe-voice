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
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 250));

  const t = text.toLowerCase();
  const critical = [
    "suicide", "kill myself", "self harm", "self-harm", "abuse", "assault",
    "rape", "weapon", "danger", "emergency", "dying", "overdose",
  ];
  const high = [
    "harassment", "bullying", "threat", "scared", "afraid", "anxiety attack",
    "panic", "depressed", "discrimination", "unsafe",
  ];
  const medium = [
    "stress", "stressed", "worried", "financial", "rent", "tired",
    "exhausted", "struggle", "struggling", "lonely",
  ];

  if (critical.some((k) => t.includes(k))) return "Critical";
  if (high.some((k) => t.includes(k))) return "High";
  if (medium.some((k) => t.includes(k))) return "Medium";
  return "Low";
}
