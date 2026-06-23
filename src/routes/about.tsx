import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout, PageIntro } from "@/components/site-layout";
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
      <PageIntro
        eyebrow="Our mission"
        title="About SafeVoice"
        description="A student welfare reporting system designed to make it easy, safe, and supportive for students to share what they're going through — and to help institutions respond with care."
      />

      <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            { icon: ShieldCheck, title: "Privacy first", desc: "Anonymous by default. Contact info is only stored when you opt in." },
            { icon: HeartHandshake, title: "Compassionate care", desc: "Every report is reviewed by trained welfare officers." },
            { icon: Sparkles, title: "Smart triage", desc: "Reports are prioritized so urgent concerns get fast attention." },
            { icon: Users, title: "For every student", desc: "Designed to be accessible, calm, and inclusive for everyone." },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 80}>
              <div className="group h-full rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-soft">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
