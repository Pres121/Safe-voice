import { useSyncExternalStore } from "react";
import type { Report, ReportStatus, WelfareCategory } from "./reports/types";
import { deleteReportFromApi, fetchReportsFromApi, mapApiReportToReport } from "./api/backend";

const STORAGE_KEY = "swrs:reports:v1";

function loadInitial(): Report[] {
  if (typeof window === "undefined") return seedReports();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Report[];
  } catch {}
  const seeded = seedReports();
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  } catch {}
  return seeded;
}

let state: Report[] = [];
let initialized = false;
const listeners = new Set<() => void>();

function ensureInit() {
  if (!initialized) {
    state = loadInitial();
    initialized = true;
  }
}

function persist() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  ensureInit();
  listeners.add(l);
  return () => listeners.delete(l);
}

function getSnapshot() {
  ensureInit();
  return state;
}

function getServerSnapshot() {
  return [] as Report[];
}

export function useReports() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useReport(id: string) {
  const list = useReports();
  return list.find((r) => r.id === id);
}

export function addReport(r: Report) {
  ensureInit();
  state = [r, ...state];
  persist();
}

export function updateReport(id: string, updater: (r: Report) => Report) {
  ensureInit();
  state = state.map((r) => (r.id === id ? updater(r) : r));
  persist();
}

export function setStatus(id: string, status: ReportStatus, by = "Admin") {
  updateReport(id, (r) => ({
    ...r,
    status,
    auditLog: [
      { id: crypto.randomUUID(), at: new Date().toISOString(), action: `Status changed to ${status}`, by },
      ...r.auditLog,
    ],
  }));
}

export function addNote(id: string, text: string, author = "Admin") {
  updateReport(id, (r) => ({
    ...r,
    notes: [
      { id: crypto.randomUUID(), author, createdAt: new Date().toISOString(), text },
      ...r.notes,
    ],
    auditLog: [
      { id: crypto.randomUUID(), at: new Date().toISOString(), action: "Added note", by: author },
      ...r.auditLog,
    ],
  }));
}

export function assign(id: string, officer: string, by = "Admin") {
  updateReport(id, (r) => ({
    ...r,
    assignedTo: officer,
    auditLog: [
      { id: crypto.randomUUID(), at: new Date().toISOString(), action: `Assigned to ${officer}`, by },
      ...r.auditLog,
    ],
  }));
}

export async function syncReportsFromApi(): Promise<{ ok: boolean; error?: string; count?: number }> {
  try {
    const rows = await fetchReportsFromApi();
    ensureInit();
    const existingById = new Map(state.map((r) => [r.id, r]));

    if (rows.length > 0) {
      state = rows.map((row) => mapApiReportToReport(row, existingById.get(row.report_id)));
    }

    persist();
    return { ok: true, count: rows.length };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to sync reports" };
  }
}

export async function deleteReport(id: string): Promise<{ ok: boolean; error?: string }> {
  ensureInit();
  const isApiReport = !id.startsWith("SWR-");

  if (isApiReport) {
    try {
      await deleteReportFromApi(id);
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to delete report from server",
      };
    }
  }

  state = state.filter((r) => r.id !== id);
  persist();
  return { ok: true };
}

export function generateReportId() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `SWR-${n}`;
}

function seedReports(): Report[] {
  const now = Date.now();
  const day = 86400000;
  const mk = (i: number, partial: Partial<Report>): Report => ({
    id: `SWR-${100000 + i}`,
    createdAt: new Date(now - i * day * 1.4).toISOString(),
    category: "Mental Health" as WelfareCategory,
    text: "",
    reportingType: "Anonymous",
    urgency: "Medium",
    status: "New",
    notes: [],
    auditLog: [],
    ...partial,
  });
  return [
    mk(1, { category: "Mental Health", text: "I have been feeling overwhelming anxiety and panic attacks before exams.", urgency: "High", status: "Under Review" }),
    mk(2, { category: "Bullying", text: "A group of classmates have been bullying me online for weeks.", urgency: "High", reportingType: "Non-Anonymous", fullName: "Anonymous Student", email: "s@example.edu", preferredContact: "Email", status: "In Progress" }),
    mk(3, { category: "Financial Difficulties", text: "I am struggling with rent and tuition payments this semester.", urgency: "Medium", status: "New" }),
    mk(4, { category: "Abuse", text: "I am in immediate danger at home and need urgent support.", urgency: "Critical", status: "Escalated" }),
    mk(5, { category: "Academic Stress", text: "Workload is heavy but manageable, would like study tips.", urgency: "Low", status: "Resolved" }),
    mk(6, { category: "Harassment", text: "A staff member has been making me feel unsafe.", urgency: "High", status: "Under Review" }),
    mk(7, { category: "Health Concerns", text: "I have a persistent cough and limited access to clinics.", urgency: "Medium", status: "New" }),
    mk(8, { category: "Discrimination", text: "I feel discriminated against during group work.", urgency: "Medium", status: "Under Review" }),
    mk(9, { category: "Housing Problems", text: "My dorm has mold and the landlord is unresponsive.", urgency: "Medium", status: "In Progress" }),
    mk(10, { category: "Safety Concerns", text: "Poor lighting around the science building at night.", urgency: "Low", status: "Resolved" }),
    mk(11, { category: "Mental Health", text: "Lately I have felt extremely lonely and hopeless.", urgency: "High", status: "Under Review" }),
    mk(12, { category: "Other", text: "Suggestion to add more counselors at the wellness center.", urgency: "Low", status: "New" }),
  ];
}
