import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site-layout";
import { HomeLoader } from "@/components/home-loader";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import {
  Shield, Lock, Zap, HeartHandshake, ShieldCheck,
  ArrowRight, Send, Cpu, ClipboardCheck, CheckCircle2,
  Check, Clock, Pin, Heart, MessageCircle, Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SafeVoice — Student Welfare Reporting System" },
      { name: "description", content: "Report welfare concerns safely and confidentially. Your voice matters." },
      { property: "og:title", content: "SafeVoice — Student Welfare Reporting System" },
      { property: "og:description", content: "Report welfare concerns safely and confidentially. Your voice matters." },
    ],
  }),
  component: HomePage,
});

const features = [
  { icon: Shield, title: "Anonymous Reporting", desc: "Share your concerns without revealing your identity. Ever." },
  { icon: Lock, title: "Confidential Support", desc: "End-to-end privacy. Only welfare officers can review reports." },
  { icon: Zap, title: "Fast Response", desc: "Urgent reports are flagged and escalated within minutes." },
  { icon: HeartHandshake, title: "Wellbeing Focus", desc: "Built around care, empathy, and meaningful follow-through." },
  { icon: ShieldCheck, title: "Secure Process", desc: "Encrypted submissions and a full audit trail you can trust." },
];

const steps = [
  { icon: Send, title: "Submit", desc: "Share your concern through a simple, supportive form." },
  { icon: Cpu, title: "Analyze", desc: "Our system gauges urgency and routes the report appropriately." },
  { icon: ClipboardCheck, title: "Review", desc: "Trained administrators review and prioritize every report." },
  { icon: CheckCircle2, title: "Action", desc: "Welfare officers take meaningful, timely action." },
];

function HomePage() {
  return (
    <PublicLayout>
      <HomeLoader />
      {/* Hero */}
      <section className="relative overflow-hidden bg-dotted">
        {/* === Mobile + tablet floating layer (small, corner-anchored) === */}
        <div className="pointer-events-none absolute inset-0 lg:hidden">
          {/* Top-left sticky note */}
          <div
            className="absolute left-2 top-6 w-28 rotate-[-6deg] animate-float sm:left-6 sm:top-10 sm:w-36"
            style={{ ["--tilt" as never]: "-6deg" }}
          >
            <div className="relative rounded-sm bg-[oklch(0.94_0.11_95)] p-2.5 shadow-soft sm:p-3">
              <Pin className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-12 text-[oklch(0.55_0.2_25)]" fill="currentColor" />
              <p className="font-[cursive] text-[10px] leading-snug text-foreground/80 sm:text-[12px]">
                Speak up. Stay<br />safe & supported.
              </p>
            </div>
          </div>

          {/* Top-right reminders tile */}
          <div
            className="absolute right-2 top-6 w-36 rotate-[5deg] animate-float sm:right-6 sm:top-10 sm:w-44"
            style={{ ["--tilt" as never]: "5deg", animationDelay: "0.6s" }}
          >
            <div className="rounded-2xl bg-white p-2.5 shadow-card ring-1 ring-border sm:p-3">
              <div className="flex items-center gap-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-secondary sm:h-7 sm:w-7">
                  <Clock className="h-3 w-3 text-foreground/80 sm:h-3.5 sm:w-3.5" />
                </div>
                <p className="text-[11px] font-semibold text-foreground sm:text-xs">Reminders</p>
              </div>
            </div>
          </div>

          {/* Check tile — left mid */}
          <div
            className="absolute left-3 top-44 flex h-11 w-11 rotate-[-4deg] items-center justify-center rounded-2xl bg-white shadow-soft ring-1 ring-border animate-float sm:left-10 sm:top-52 sm:h-14 sm:w-14"
            style={{ ["--tilt" as never]: "-4deg", animationDelay: "1s" }}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary text-primary-foreground sm:h-9 sm:w-9">
              <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={3} />
            </span>
          </div>

          {/* Chat sticky — right mid */}
          <div
            className="absolute right-3 top-48 w-32 rotate-[6deg] animate-float sm:right-10 sm:top-56 sm:w-40"
            style={{ ["--tilt" as never]: "6deg", animationDelay: "1.4s" }}
          >
            <div className="rounded-sm bg-[oklch(0.92_0.09_180)] p-2.5 shadow-soft sm:p-3">
              <div className="flex items-center gap-1.5">
                <MessageCircle className="h-3 w-3 text-teal sm:h-3.5 sm:w-3.5" />
                <p className="text-[10px] font-semibold text-foreground/80 sm:text-xs">Anonymous</p>
              </div>
              <p className="mt-0.5 font-[cursive] text-[10px] leading-snug text-foreground/70 sm:text-[12px]">
                Share what's on<br />your mind safely.
              </p>
            </div>
          </div>

          {/* Bottom-left heart card */}
          <div
            className="absolute bottom-4 left-2 w-32 rotate-[3deg] animate-float sm:left-6 sm:w-40"
            style={{ ["--tilt" as never]: "3deg", animationDelay: "1.8s" }}
          >
            <div className="rounded-sm bg-[oklch(0.93_0.07_15)] p-2.5 shadow-soft sm:p-3">
              <div className="flex items-center gap-1.5">
                <Heart className="h-3 w-3 text-[oklch(0.55_0.2_25)] sm:h-3.5 sm:w-3.5" fill="currentColor" />
                <p className="text-[10px] font-semibold text-foreground/80 sm:text-xs">You matter</p>
              </div>
              <p className="mt-0.5 font-[cursive] text-[10px] leading-snug text-foreground/70 sm:text-[12px]">
                Every voice<br />is heard.
              </p>
            </div>
          </div>

          {/* Bottom-right confidential card */}
          <div
            className="absolute bottom-4 right-2 w-36 rotate-[-3deg] animate-float sm:right-6 sm:w-44"
            style={{ ["--tilt" as never]: "-3deg", animationDelay: "2.2s" }}
          >
            <div className="rounded-2xl bg-white p-2.5 shadow-card ring-1 ring-border sm:p-3">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-success sm:h-3.5 sm:w-3.5" />
                <p className="text-[11px] font-semibold text-foreground sm:text-xs">100% Private</p>
              </div>
            </div>
          </div>
        </div>

        {/* === Desktop floating decoration layer === */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block">

          {/* Sticky note — top-left */}
          <div
            className="absolute left-[3%] top-24 w-48 rotate-[-7deg] animate-float"
            style={{ ["--tilt" as never]: "-7deg" }}
          >
            <div className="relative rounded-sm bg-[oklch(0.94_0.11_95)] p-5 shadow-soft">
              <Pin className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-12 text-[oklch(0.55_0.2_25)]" fill="currentColor" />
              <p className="font-[cursive] text-[14px] leading-snug text-foreground/80">
                Speak up to keep<br />our community safe<br />and supported.
              </p>
            </div>
          </div>

          {/* Check tile — left middle */}
          <div
            className="absolute left-[14%] top-[280px] flex h-16 w-16 rotate-[-4deg] items-center justify-center rounded-2xl bg-white shadow-soft ring-1 ring-border animate-float"
            style={{ ["--tilt" as never]: "-4deg", animationDelay: "0.8s" }}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Check className="h-5 w-5" strokeWidth={3} />
            </span>
          </div>

          {/* Heart sticky note — far left lower */}
          <div
            className="absolute left-[4%] top-[370px] w-44 rotate-[4deg] animate-float"
            style={{ ["--tilt" as never]: "4deg", animationDelay: "1.4s" }}
          >
            <div className="rounded-sm bg-[oklch(0.93_0.07_15)] p-4 shadow-soft">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-[oklch(0.55_0.2_25)]" fill="currentColor" />
                <p className="text-xs font-semibold text-foreground/80">You matter</p>
              </div>
              <p className="mt-1 font-[cursive] text-[13px] leading-snug text-foreground/70">
                Every voice deserves<br />to be heard.
              </p>
            </div>
          </div>

          {/* Reminders card — top-right */}
          <div
            className="absolute right-[4%] top-20 w-64 rotate-[5deg] animate-float"
            style={{ ["--tilt" as never]: "5deg", animationDelay: "0.4s" }}
          >
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary">
                  <Clock className="h-4 w-4 text-foreground/80" />
                </div>
                <p className="text-sm font-semibold text-foreground">Reminders</p>
              </div>
            </div>
          </div>

          {/* Check-in card — right upper */}
          <div
            className="absolute right-[2%] top-[200px] w-64 rotate-[-3deg] animate-float"
            style={{ ["--tilt" as never]: "-3deg", animationDelay: "1.1s" }}
          >
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border">
              <p className="text-[11px] text-muted-foreground">Today's Check-in</p>
              <p className="mt-0.5 text-sm font-medium text-foreground">Wellbeing follow-up</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Counsellor session</p>
              <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
                <Clock className="h-3 w-3" /> 13:00 – 13:45
              </div>
            </div>
          </div>

          {/* Chat sticky — right lower */}
          <div
            className="absolute right-[10%] top-[380px] w-52 rotate-[6deg] animate-float"
            style={{ ["--tilt" as never]: "6deg", animationDelay: "1.7s" }}
          >
            <div className="rounded-sm bg-[oklch(0.92_0.09_180)] p-4 shadow-soft">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-teal" />
                <p className="text-xs font-semibold text-foreground/80">Anonymous</p>
              </div>
              <p className="mt-1 font-[cursive] text-[13px] leading-snug text-foreground/70">
                Share what's on<br />your mind — safely.
              </p>
            </div>
          </div>

          {/* Bottom-left peeking card */}
          <div
            className="absolute bottom-6 left-[6%] w-60 rotate-[-3deg] animate-float"
            style={{ ["--tilt" as never]: "-3deg", animationDelay: "2s" }}
          >
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">Today's reports</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">3 new submissions awaiting review</p>
            </div>
          </div>

          {/* Bottom-right peeking card */}
          <div
            className="absolute bottom-6 right-[6%] w-60 rotate-[3deg] animate-float"
            style={{ ["--tilt" as never]: "3deg", animationDelay: "2.4s" }}
          >
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success" />
                <p className="text-sm font-semibold text-foreground">100% Confidential</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Anonymous reporting always available</p>
            </div>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative mx-auto max-w-5xl px-4 pb-40 pt-16 text-center sm:px-6 sm:pt-24 lg:pt-28">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-soft ring-1 ring-border animate-scale-in">
            <span className="grid grid-cols-2 gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="h-2.5 w-2.5 rounded-full bg-foreground/85" />
              <span className="h-2.5 w-2.5 rounded-full bg-foreground/85" />
              <span className="h-2.5 w-2.5 rounded-full bg-foreground/85" />
            </span>
          </div>

          <h1 className="mx-auto max-w-4xl text-balance text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl animate-rise-in">
            Speak up, be heard,
            <br />
            <span className="text-muted-foreground/70">be supported here</span>
          </h1>

          <p
            className="mx-auto mt-8 max-w-xl text-base text-muted-foreground sm:text-lg animate-rise-in"
            style={{ animationDelay: "120ms" }}
          >
            Safely report welfare concerns and help us care for every student.
          </p>

          <div
            className="mt-8 flex justify-center animate-rise-in"
            style={{ animationDelay: "240ms" }}
          >
            <Button
              asChild
              size="lg"
              className="rounded-full bg-primary px-7 py-6 text-base font-medium text-primary-foreground shadow-soft transition-transform hover:bg-primary/90 hover:-translate-y-0.5"
            >
              <Link to="/report">Report an issue</Link>
            </Button>
          </div>
        </div>
      </section>


      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built for care, trust, and safety</h2>
          <p className="mt-3 text-muted-foreground">
            Everything you need to feel confident sharing what's on your mind.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 80}>
              <div className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-teal/20 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
            <p className="mt-3 text-muted-foreground">Four simple steps from concern to resolution.</p>
          </Reveal>
          <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal key={s.title} as="li" delay={i * 90} className="relative">
                <div className="relative rounded-2xl border border-border bg-card p-6 shadow-card">
                  <div className="absolute -top-3 left-6 inline-flex h-6 items-center rounded-full bg-primary px-2.5 text-xs font-semibold text-primary-foreground">
                    Step {i + 1}
                  </div>
                  <div className="mt-2 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal/20 to-success/20 text-teal">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary to-teal p-10 text-primary-foreground shadow-soft sm:p-14">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to share what's on your mind?
              </h2>
              <p className="mt-3 text-primary-foreground/85">
                Your report is confidential. Submit anonymously or include contact info — it's entirely your choice.
              </p>
              <Button asChild size="lg" variant="secondary" className="mt-6 rounded-full px-6">
                <Link to="/report">
                  Start a report <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

    </PublicLayout>
  );
}
