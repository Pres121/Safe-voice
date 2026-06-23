import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout, PageIntro } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { z } from "zod";
import {
  WELFARE_CATEGORIES, type WelfareCategory, type ReportingType, type ContactMethod,
} from "@/lib/reports/types";
import { addReport } from "@/lib/reports-store";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { FASTAPI_BASE_URL } from "@/lib/api/backend";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report an Issue — SafeVoice" },
      { name: "description", content: "Submit a welfare concern safely and confidentially." },
    ],
  }),
  component: ReportPage,
});

const baseSchema = z.object({
  category: z.enum(WELFARE_CATEGORIES as unknown as [string, ...string[]]),
  text: z.string().trim().min(20, "Please share at least 20 characters so we can help.").max(5000),
  reportingType: z.enum(["Anonymous", "Non-Anonymous"]),
  fullName: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(30).optional(),
  email: z.string().trim().email("Enter a valid email").max(160).optional().or(z.literal("")),
  preferredContact: z.enum(["Phone Call", "SMS", "WhatsApp", "Email"]).optional(),
  incidentDate: z.string().optional(),
  incidentLocation: z.string().trim().max(200).optional(),
});

function ReportPage() {
  const [category, setCategory] = useState<WelfareCategory | "">("");
  const [text, setText] = useState("");
  const [reportingType, setReportingType] = useState<ReportingType>("Anonymous");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [preferredContact, setPreferredContact] = useState<ContactMethod | "">("");
  const [incidentDate, setIncidentDate] = useState("");
  const [incidentLocation, setIncidentLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ id: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = baseSchema.safeParse({
      category, text, reportingType, fullName, phone, email,
      preferredContact: preferredContact || undefined, incidentDate, incidentLocation,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please review your report.");
      return;
    }
    if (reportingType === "Non-Anonymous" && !fullName.trim()) {
      toast.error("Please enter your full name or choose anonymous.");
      return;
    }

    setSubmitting(true);
    try {
      // Send report to backend which will run prediction and store it
      const res = await fetch(`${FASTAPI_BASE_URL}/api/v1/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          text: text.trim(),
          reporting_type: reportingType,
          full_name: reportingType === "Non-Anonymous" ? fullName.trim() : undefined,
          phone: reportingType === "Non-Anonymous" ? phone.trim() || undefined : undefined,
          email: reportingType === "Non-Anonymous" ? email.trim() || undefined : undefined,
          preferred_contact: reportingType === "Non-Anonymous" ? (preferredContact || undefined) as ContactMethod | undefined : undefined,
          incident_date: incidentDate || undefined,
          incident_location: incidentLocation.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit report");
      const json = await res.json();
      const id = json.report_id;
      const urgency = (json.urgency ?? json.severity ?? "Low") as "Critical" | "High" | "Medium" | "Low";
      // mirror into local store for admin UI
      addReport({
        id,
        createdAt: new Date().toISOString(),
        category: category as WelfareCategory,
        text: text.trim(),
        reportingType,
        fullName: reportingType === "Non-Anonymous" ? fullName.trim() : undefined,
        phone: reportingType === "Non-Anonymous" ? phone.trim() || undefined : undefined,
        email: reportingType === "Non-Anonymous" ? email.trim() || undefined : undefined,
        preferredContact: reportingType === "Non-Anonymous" ? (preferredContact || undefined) as ContactMethod | undefined : undefined,
        incidentDate: incidentDate || undefined,
        incidentLocation: incidentLocation.trim() || undefined,
        urgency,
        status: "New",
        notes: [],
        auditLog: [
          { id: crypto.randomUUID(), at: new Date().toISOString(), action: "Report submitted", by: "Student" },
        ],
      });
      setSubmitted({ id });
    } catch (err) {
      toast.error("Failed to submit report. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <PublicLayout>
        <section className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
          <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success/15 text-success">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight">Thank you</h1>
            <p className="mt-3 text-muted-foreground">
              Your report has been received and will be reviewed.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Reference ID: <span className="font-mono font-medium text-foreground">{submitted.id}</span>
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild className="rounded-full">
                <Link to="/">Back to home</Link>
              </Button>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setSubmitted(null);
                  setCategory(""); setText(""); setReportingType("Anonymous");
                  setFullName(""); setPhone(""); setEmail(""); setPreferredContact("");
                  setIncidentDate(""); setIncidentLocation("");
                }}
              >
                Submit another <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <PageIntro
        eyebrow="Confidential & secure"
        title="Report a concern"
        description="Take your time. Share as much or as little as you're comfortable with."
      />

      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <form
          onSubmit={onSubmit}
          className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
        >
          <div className="space-y-2">
            <Label htmlFor="category">Welfare category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as WelfareCategory)}>
              <SelectTrigger id="category" className="h-11">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {WELFARE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="text">Please describe your concern</Label>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder="Share what happened, how you're feeling, and what kind of support you'd like…"
              className="resize-y"
            />
            <p className="text-xs text-muted-foreground">{text.length} characters · minimum 20</p>
          </div>

          <div className="space-y-2">
            <Label>Reporting type</Label>
            <RadioGroup
              value={reportingType}
              onValueChange={(v) => setReportingType(v as ReportingType)}
              className="grid gap-3 sm:grid-cols-2"
            >
              {(["Anonymous", "Non-Anonymous"] as ReportingType[]).map((t) => (
                <Label
                  key={t}
                  htmlFor={`rt-${t}`}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <RadioGroupItem id={`rt-${t}`} value={t} className="mt-0.5" />
                  <div>
                    <div className="font-medium">{t}</div>
                    <div className="text-xs text-muted-foreground">
                      {t === "Anonymous"
                        ? "We won't know who you are."
                        : "Share contact info so we can follow up."}
                    </div>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {reportingType === "Non-Anonymous" && (
            <div className="grid gap-4 rounded-2xl border border-dashed border-border bg-secondary/40 p-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="contact">Preferred contact method</Label>
                <Select value={preferredContact} onValueChange={(v) => setPreferredContact(v as ContactMethod)}>
                  <SelectTrigger id="contact" className="h-11">
                    <SelectValue placeholder="How should we reach you?" />
                  </SelectTrigger>
                  <SelectContent>
                    {(["Phone Call", "SMS", "WhatsApp", "Email"] as ContactMethod[]).map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date of incident <span className="text-muted-foreground">(optional)</span></Label>
              <Input id="date" type="date" value={incidentDate} onChange={(e) => setIncidentDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loc">Location of incident <span className="text-muted-foreground">(optional)</span></Label>
              <Input id="loc" value={incidentLocation} onChange={(e) => setIncidentLocation(e.target.value)} placeholder="e.g. Library, Dorm B" />
            </div>
          </div>

          <Button type="submit" size="lg" disabled={submitting} className="w-full rounded-full">
            {submitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</>) : "Submit Report"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            By submitting, you trust us to handle your information with care.
          </p>
        </form>
      </section>
    </PublicLayout>
  );
}
