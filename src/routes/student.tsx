import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageIntro, PublicLayout } from "@/components/site-layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useReports, addReport, generateReportId } from "@/lib/reports-store";
import {
  getCurrentStudent,
  signInStudent,
  signOutStudent,
  signUpStudent,
  updateStudentProfile,
  validateMzuniEmail,
  type StudentSession,
} from "@/lib/student-auth";
import { ArrowRight, CheckCircle2, LogOut, UserCheck } from "lucide-react";
import { toast } from "sonner";

const categories = [
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

type Category = (typeof categories)[number];

type AuthMode = "signin" | "signup";

export const Route = createFileRoute("/student")({
  head: () => ({
    meta: [
      { title: "Student Login — SafeVoice" },
      { name: "description", content: "Student sign in, sign up, and dashboard for SafeVoice." },
    ],
  }),
  component: StudentPage,
});

function getUrgencyForCategory(category: Category) {
  if (category === "Abuse" || category === "Harassment" || category === "Bullying") return "High";
  if (category === "Mental Health" || category === "Health Concerns" || category === "Safety Concerns") return "Medium";
  return "Low";
}

function StudentPage() {
  const reports = useReports();
  const [currentStudent, setCurrentStudent] = useState<StudentSession | null>(null);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [studentEmail, setStudentEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [studentName, setStudentName] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileEmail, setProfileEmail] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [reportText, setReportText] = useState("");
  const [reportType, setReportType] = useState<"Anonymous" | "Non-Anonymous">("Anonymous");
  const [reportPhone, setReportPhone] = useState("");
  const [reportEmail, setReportEmail] = useState("");
  const [reportPreferredContact, setReportPreferredContact] = useState<"Phone Call" | "SMS" | "WhatsApp" | "Email" | "">("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string>("");
  const [capturingLocation, setCapturingLocation] = useState(false);

  useEffect(() => {
    setCurrentStudent(getCurrentStudent());
  }, []);

  useEffect(() => {
    if (!currentStudent) return;
    setProfileEmail(currentStudent.email);
    setProfileName(currentStudent.fullName ?? "");
    setStudentEmail(currentStudent.email);
  }, [currentStudent]);

  const studentReports = useMemo(() => {
    if (!currentStudent) return [];
    return reports
      .filter(
        (report) =>
          report.studentId === currentStudent.studentId || report.email === currentStudent.email,
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [currentStudent, reports]);

  const reportTotals = useMemo(() => {
    const total = studentReports.length;
    const open = studentReports.filter((report) => report.status === "New" || report.status === "Under Review").length;
    const inProgress = studentReports.filter((report) => report.status === "In Progress").length;
    const resolved = studentReports.filter((report) => report.status === "Resolved").length;
    return { total, open, inProgress, resolved };
  }, [studentReports]);

  const handleSignUp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");

    if (!validateMzuniEmail(studentEmail)) {
      setAuthError("Student email must end with @mzuni.ac.mw.");
      return;
    }
    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

    const result = signUpStudent({
      email: studentEmail,
      password,
      fullName: studentName.trim() || undefined,
    });

    if (!result.ok) {
      setAuthError(result.error);
      return;
    }

    setCurrentStudent(result.session);
    setAuthError("");
    toast.success("Student account created. Welcome!");
  };

  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");

    const result = signInStudent(studentEmail, password);
    if (!result.ok) {
      setAuthError(result.error);
      return;
    }

    setCurrentStudent(result.session);
    setAuthError("");
    toast.success("Signed in successfully.");
  };

  const handleLogout = () => {
    signOutStudent();
    setCurrentStudent(null);
    setCategory("");
    setReportText("");
    setReportType("Anonymous");
    setReportPhone("");
    setReportEmail("");
    setReportPreferredContact("");
  };

  const handleProfileSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentStudent) return;

    setIsSavingProfile(true);
    const result = updateStudentProfile({
      studentId: currentStudent.studentId,
      email: profileEmail,
      password: profilePassword || undefined,
      fullName: profileName.trim() || undefined,
    });

    if (!result.ok) {
      toast.error(result.error);
      setIsSavingProfile(false);
      return;
    }

    setCurrentStudent(result.session);
    setProfilePassword("");
    toast.success("Profile updated.");
    setIsSavingProfile(false);
  };

  const handleGetLocation = () => {
    setCapturingLocation(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setCapturingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationLat(position.coords.latitude);
        setLocationLng(position.coords.longitude);
        setCapturingLocation(false);
        toast.success("Location captured successfully.");
      },
      (error) => {
        let message = "Failed to get location.";
        if (error.code === error.PERMISSION_DENIED) message = "Permission denied. Please enable location access.";
        else if (error.code === error.POSITION_UNAVAILABLE) message = "Location information is unavailable.";
        else if (error.code === error.TIMEOUT) message = "Request timed out.";
        setLocationError(message);
        setCapturingLocation(false);
        toast.error(message);
      }
    );
  };

  const handleSubmitReport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentStudent) return;
    if (!category) {
      toast.error("Pick a category for your report.");
      return;
    }
    if (reportText.trim().length < 20) {
      toast.error("Please describe your concern with at least 20 characters.");
      return;
    }
    if (reportType === "Non-Anonymous") {
      // non-anonymous reports are linked to your student ID only
    }

    setSubmittingReport(true);
    try {
      addReport({
        id: generateReportId(),
        createdAt: new Date().toISOString(),
        category,
        text: reportText.trim(),
        reportingType: reportType,
        incidentDate: undefined,
        incidentLocation: undefined,
        locationLat: locationLat ?? undefined,
        locationLng: locationLng ?? undefined,
        urgency: getUrgencyForCategory(category),
        status: "New",
        notes: [],
        auditLog: [
          {
            id: crypto.randomUUID(),
            at: new Date().toISOString(),
            action: "Report submitted by student",
            by: currentStudent.studentId,
          },
        ],
        studentId: currentStudent.studentId,
      } as any);

      toast.success("Your report is submitted.");
      setCategory("");
      setReportText("");
      setReportType("Anonymous");
      setReportPhone("");
      setReportEmail("");
      setReportPreferredContact("");
      setLocationLat(null);
      setLocationLng(null);
      setLocationError("");
    } catch (error) {
      toast.error("There was an issue submitting your report.");
    } finally {
      setSubmittingReport(false);
    }
  };

  if (!currentStudent) {
    return (
      <PublicLayout>
        <section className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-md">
            <div className="mb-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">SafeVoice</p>
              <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-gray-900">
                {mode === "signin" ? "Welcome back" : "Get started"}
              </h1>
              <p className="mt-3 text-base text-gray-600">
                {mode === "signin" 
                  ? "Sign in to your student account" 
                  : "Create an account to share your concerns"}
              </p>
            </div>

            <div className="space-y-5">
              {/* Privacy Bubble - Signup Mode */}
              {mode === "signup" && (
                <div className="rounded-3xl border-2 border-emerald-200 bg-white p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <svg className="h-5 w-5 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Your privacy matters</p>
                      <p className="mt-1 text-sm text-gray-600">
                        A unique student ID will be generated. Your personal info stays private.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Bubble */}
              <div className="rounded-3xl border-2 border-emerald-200 bg-white p-8 shadow-lg">
                <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-email" className="text-sm font-semibold text-gray-700">
                      Student email
                    </Label>
                    <Input
                      id="student-email"
                      type="email"
                      value={studentEmail}
                      onChange={(event) => setStudentEmail(event.target.value)}
                      placeholder="your.email@mzuni.ac.mw"
                      className="rounded-xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="student-password" className="text-sm font-semibold text-gray-700">
                      Password
                    </Label>
                    <Input
                      id="student-password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      className="rounded-xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-sm font-semibold text-gray-700">
                        Confirm password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="••••••••"
                        className="rounded-xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                  )}

                  {authError && (
                    <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-4 text-sm text-red-700">
                      {authError}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full rounded-xl bg-emerald-500 py-3 text-base font-bold text-white hover:bg-emerald-600 transition-colors shadow-md hover:shadow-lg"
                  >
                    {mode === "signin" ? "Sign in" : "Create account"}
                  </Button>
                </form>
              </div>

              {/* Toggle Mode Bubble */}
              <div className="rounded-3xl border-2 border-emerald-200 bg-white p-5 text-center shadow-lg">
                <p className="text-sm text-gray-600">
                  {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === "signin" ? "signup" : "signin");
                      setAuthError("");
                    }}
                    className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    {mode === "signin" ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>

              {/* Back Home Bubble */}
              <Button 
                variant="outline" 
                asChild 
                className="w-full rounded-xl border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 font-semibold py-2.5"
              >
                <Link to="/">← Back home</Link>
              </Button>
            </div>

            {/* Comfort Message Bubble - Bottom */}
            <div className="mt-8 rounded-3xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50 p-6 shadow-lg">
              <div className="text-center space-y-3">
                <svg className="h-8 w-8 text-emerald-600 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
                <h3 className="font-bold text-gray-900">You're safe here</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Your voice matters. Share your concerns confidentially with a team that cares about your wellbeing.
                </p>
              </div>
            </div>
          </div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout heroHeader>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 rounded-3xl border border-border bg-card p-8 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Student dashboard</p>
              <h1 className="mt-4 text-3xl font-semibold">Hello, {currentStudent.fullName || currentStudent.studentId}</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Submit reports, track status, and update your profile in one secure student workspace.
              </p>
            </div>
            <div className="grid gap-3 sm:auto-cols-max sm:grid-flow-col">
              <Button variant="secondary" onClick={handleLogout} className="rounded-full">
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </Button>
              <Button asChild className="rounded-full">
                <Link to="/">Home</Link>
              </Button>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-border/60 bg-muted p-4">
            <p className="text-sm">Welcome back — you're safe here. If you need immediate help, reach out to campus welfare.</p>
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="report">Submit report</TabsTrigger>
            <TabsTrigger value="reports">My reports</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
              <StatCard label="Total reports" value={reportTotals.total} />
              <StatCard label="Open" value={reportTotals.open} />
              <StatCard label="In progress" value={reportTotals.inProgress} />
              <StatCard label="Resolved" value={reportTotals.resolved} />
            </div>
          </TabsContent>

          <TabsContent value="report">
            <section className="rounded-3xl border border-border bg-card p-8 shadow-soft">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Submit report</p>
                  <h2 className="mt-2 text-2xl font-semibold">Report a concern</h2>
                </div>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Only authenticated students
                </span>
              </div>

              <form onSubmit={handleSubmitReport} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="report-category">Category</Label>
                    <Select value={category} onValueChange={(value) => setCategory(value as Category)}>
                      <SelectTrigger id="report-category" className="h-11">
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="report-type">Report type</Label>
                    <Select value={reportType} onValueChange={(value) => setReportType(value as "Anonymous" | "Non-Anonymous")}> 
                      <SelectTrigger id="report-type" className="h-11">
                        <SelectValue placeholder="Choose report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Anonymous">Anonymous</SelectItem>
                        <SelectItem value="Non-Anonymous">Non-Anonymous</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-text">Describe the issue</Label>
                  <Textarea
                    id="report-text"
                    value={reportText}
                    onChange={(event) => setReportText(event.target.value)}
                    rows={6}
                    placeholder="Share what happened and how you would like to be supported."
                    className="resize-y"
                  />
                  <p className="text-xs text-muted-foreground">Minimum 20 characters.</p>
                </div>

                {reportType === "Non-Anonymous" && (
                  <div className="rounded-3xl border border-dashed border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">Privacy note</p>
                    <p className="mt-2">
                      Choosing non-anonymous links this report to your generated student ID only. Personal contact details are not stored in the report record.
                    </p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="report-contact">Preferred contact</Label>
                    <Select value={reportPreferredContact} onValueChange={(value) => setReportPreferredContact(value as any)}>
                      <SelectTrigger id="report-contact" className="h-11">
                        <SelectValue placeholder="Choose a method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Phone Call">Phone Call</SelectItem>
                        <SelectItem value="SMS">SMS</SelectItem>
                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3 rounded-3xl border border-dashed border-border bg-secondary/40 p-4">
                  <div>
                    <Label className="text-sm font-semibold text-foreground">Current location (optional)</Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Share your current location to help us better understand the context of your concern. This works with both anonymous and non-anonymous reports.
                    </p>
                  </div>
                  {locationError && <p className="text-xs text-destructive">{locationError}</p>}
                  {locationLat !== null && locationLng !== null && (
                    <div className="rounded-2xl bg-background/60 p-3 text-sm">
                      <p className="font-medium text-foreground">Location captured</p>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {locationLat.toFixed(6)}, {locationLng.toFixed(6)}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setLocationLat(null);
                          setLocationLng(null);
                          setLocationError("");
                        }}
                        className="mt-2 rounded-full text-xs"
                      >
                        Clear location
                      </Button>
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGetLocation}
                    disabled={capturingLocation || (locationLat !== null && locationLng !== null)}
                    className="w-full rounded-full"
                  >
                    {capturingLocation ? "Capturing location..." : locationLat !== null ? "Location added" : "Get current location"}
                  </Button>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button type="submit" className="w-full rounded-full sm:w-auto" disabled={submittingReport}>
                    {submittingReport ? "Submitting..." : "Submit report"}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Reports are stored securely and reviewed by welfare staff.
                  </p>
                </div>
              </form>
            </section>
          </TabsContent>

          <TabsContent value="reports">
            <section className="rounded-3xl border border-border bg-card p-8 shadow-soft">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Your report status</p>
                  <h2 className="mt-2 text-2xl font-semibold">Recent reports</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                  {studentReports.length} items
                </div>
              </div>

              {studentReports.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/80 bg-secondary/50 p-8 text-center text-sm text-muted-foreground">
                  No reports yet. Submit your first concern above.
                </div>
              ) : (
                <div className="space-y-4">
                  {studentReports.slice(0, 6).map((report) => (
                    <article key={report.id} className="rounded-3xl border border-border bg-background/80 p-4 shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{report.category}</p>
                          <p className="text-xs text-muted-foreground">{new Date(report.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          {report.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{report.text}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>Urgency: {report.urgency}</span>
                        <span>Type: {report.reportingType}</span>
                        <span>ID: {report.id}</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="profile">
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Profile</p>
                      <p className="mt-1 text-sm text-muted-foreground">Manage your student details and sign-in email.</p>
                    </div>
                  </div>

                  <form onSubmit={handleProfileSave} className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <Label>Student ID</Label>
                      <Input value={currentStudent.studentId} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-name">Full name</Label>
                      <Input
                        id="profile-name"
                        value={profileName}
                        onChange={(event) => setProfileName(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-email">Email</Label>
                      <Input
                        id="profile-email"
                        value={profileEmail}
                        onChange={(event) => setProfileEmail(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-password">New password</Label>
                      <Input
                        id="profile-password"
                        type="password"
                        value={profilePassword}
                        onChange={(event) => setProfilePassword(event.target.value)}
                        placeholder="Leave blank to keep current password"
                      />
                    </div>
                    <Button type="submit" className="w-full rounded-full" disabled={isSavingProfile}>
                      {isSavingProfile ? "Saving..." : "Update profile"}
                    </Button>
                  </form>
                </div>
              </div>

              <aside>
                <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-success">Good to know</p>
                      <p className="mt-1 text-sm text-muted-foreground">All reports you submit here are linked to your dashboard and visible only to you and welfare staff.</p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </PublicLayout>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 text-center shadow-soft">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}
