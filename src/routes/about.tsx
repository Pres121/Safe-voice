import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site-layout";
import { HeartHandshake, ShieldCheck, Users, Sparkles } from "lucide-react";
import { Reveal } from "@/components/reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — SafeVoice" },
      { name: "description", content: "Learn how SafeVoice helps students share welfare concerns safely." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">About SafeVoice</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          SafeVoice is a student welfare reporting system designed to make it easy, safe, and supportive
          for students to share what they're going through — and to help institutions respond with care.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {[
            { icon: ShieldCheck, title: "Privacy first", desc: "Anonymous by default. Contact info is only stored when you opt in." },
            { icon: HeartHandshake, title: "Compassionate care", desc: "Every report is reviewed by trained welfare officers." },
            { icon: Sparkles, title: "Smart triage", desc: "Reports are prioritized so urgent concerns get fast attention." },
            { icon: Users, title: "For every student", desc: "Designed to be accessible, calm, and inclusive for everyone." },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 80}>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <f.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
