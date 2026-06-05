import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site-layout";
import { Mail, Phone, MapPin } from "lucide-react";
import { Reveal } from "@/components/reveal";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — SafeVoice" },
      { name: "description", content: "Get in touch with the SafeVoice student welfare team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Contact us</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          If you are in immediate danger, please call your local emergency services.
          For non-urgent welfare support, reach out to our team below.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            { icon: Mail, label: "Email", value: "welfare@safevoice.edu" },
            { icon: Phone, label: "Phone", value: "+1 (555) 010-2030" },
            { icon: MapPin, label: "Office", value: "Student Center, Room 204" },
          ].map((c, i) => (
            <Reveal key={c.label} delay={i * 80}>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <c.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-3 text-sm font-medium text-muted-foreground">{c.label}</h3>
                <p className="mt-1 font-medium">{c.value}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
