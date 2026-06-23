import type { Report, ReportingType, Urgency, WelfareCategory } from "@/lib/reports/types";

export const FASTAPI_BASE_URL =
  (import.meta.env.VITE_FASTAPI_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:8000";

/** Map backend canonical categories back to frontend display names. */
const BACKEND_TO_FRONTEND_CATEGORY: Record<string, WelfareCategory> = {
  "Mental & Academic Well-being": "Mental Health",
  "Economic & Housing Support": "Financial Difficulties",
  "Health & Personal Care": "Health Concerns",
  "Safety, Abuse & Harassment": "Harassment",
  "Discrimination & Social Inclusion": "Discrimination",
  Bullying: "Bullying",
  Other: "Other",
};

export interface ApiReportRow {
  report_id: string;
  category: string;
  text: string;
  severity: string;
  reporting_type?: string | null;
  incident_date?: string | null;
  incident_location?: string | null;
  created_at: string;
}

export interface SystemStatus {
  api: {
    status: string;
    version: string;
    title: string;
    uptime_seconds: number;
  };
  database: {
    status: string;
    report_count?: number;
    path?: string;
    error?: string;
  };
  model: {
    path: string;
    file_exists: boolean;
    loaded: boolean;
    file_size_bytes?: number;
    model_type?: string;
    classes?: string[];
    pipeline_steps?: string[];
    health: {
      status: string;
      smoke_test?: {
        sample_text: string;
        predicted_severity: string;
        latency_ms: number;
        ok: boolean;
      };
      error?: string;
    };
    label_map: Record<string, string>;
    predictions_served: number;
  };
  reports: {
    total: number;
    by_severity: Record<string, number>;
    by_category: Record<string, number>;
    by_reporting_type: Record<string, number>;
  };
  endpoints: { method: string; path: string; description: string }[];
}

export interface MetricsResponse {
  reports: SystemStatus["reports"];
  severity_distribution: { severity: string; count: number }[];
  model: SystemStatus["model"];
  database: SystemStatus["database"];
  api_uptime_seconds: number;
}

export function mapApiReportToReport(row: ApiReportRow, existing?: Report): Report {
  const reportingType = (row.reporting_type === "Non-Anonymous"
    ? "Non-Anonymous"
    : "Anonymous") as ReportingType;

  return {
    id: row.report_id,
    createdAt: row.created_at,
    category: BACKEND_TO_FRONTEND_CATEGORY[row.category] ?? (row.category as WelfareCategory),
    text: row.text,
    reportingType,
    incidentDate: row.incident_date ?? undefined,
    incidentLocation: row.incident_location ?? undefined,
    urgency: (row.severity as Urgency) || "Low",
    status: existing?.status ?? "New",
    notes: existing?.notes ?? [],
    assignedTo: existing?.assignedTo,
    auditLog: existing?.auditLog ?? [
      {
        id: crypto.randomUUID(),
        at: row.created_at,
        action: "Report submitted via API",
        by: "System",
      },
    ],
    fullName: existing?.fullName,
    phone: existing?.phone,
    email: existing?.email,
    preferredContact: existing?.preferredContact,
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${FASTAPI_BASE_URL}${path}`, init);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function fetchReportsFromApi(): Promise<ApiReportRow[]> {
  const json = await apiFetch<{ count: number; data: ApiReportRow[] }>("/api/v1/reports");
  return json.data;
}

export async function deleteReportFromApi(reportId: string): Promise<void> {
  await apiFetch(`/api/v1/reports/${encodeURIComponent(reportId)}`, { method: "DELETE" });
}

export async function fetchSystemStatus(): Promise<SystemStatus> {
  return apiFetch<SystemStatus>("/api/v1/system/status");
}

export async function fetchMetrics(): Promise<MetricsResponse> {
  return apiFetch<MetricsResponse>("/api/v1/metrics");
}

export async function checkApiHealth(): Promise<{ ok: boolean; status?: string }> {
  try {
    const json = await apiFetch<{ status: string }>("/health");
    return { ok: json.status === "ok", status: json.status };
  } catch {
    return { ok: false };
  }
}
