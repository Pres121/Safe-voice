export type Urgency = "Critical" | "High" | "Medium" | "Low";
export type ReportStatus = "New" | "Under Review" | "In Progress" | "Resolved" | "Escalated";
export type ReportingType = "Anonymous" | "Non-Anonymous";
export type ContactMethod = "Phone Call" | "SMS" | "WhatsApp" | "Email";

export const WELFARE_CATEGORIES = [
  "Mental Health",
  "Academic Stress",
  "Financial Difficulties",
  "Harassment",
  "Bullying",
  "Abuse",
  "Housing Problems",
  "Health Concerns",
  "Discrimination",
  "Safety Concerns",
  "Other",
] as const;
export type WelfareCategory = (typeof WELFARE_CATEGORIES)[number];

export const STATUSES: ReportStatus[] = [
  "New",
  "Under Review",
  "In Progress",
  "Resolved",
  "Escalated",
];

export interface Report {
  id: string;
  createdAt: string;
  category: WelfareCategory;
  text: string;
  reportingType: ReportingType;
  fullName?: string;
  phone?: string;
  email?: string;
  preferredContact?: ContactMethod;
  incidentDate?: string;
  incidentLocation?: string;
  urgency: Urgency;
  status: ReportStatus;
  notes: { id: string; author: string; createdAt: string; text: string }[];
  assignedTo?: string;
  auditLog: { id: string; at: string; action: string; by: string }[];
}
