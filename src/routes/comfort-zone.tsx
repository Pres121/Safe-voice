import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/site-layout";
import { Heart, Lightbulb, Users, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/comfort-zone")({
  head: () => ({
    meta: [
      { title: "Comfort Zone — SafeVoice" },
      { name: "description", content: "A safe space for wellness, resources, and community support." },
    ],
  }),
  component: ComfortZonePage,
});

function ComfortZonePage() {
  const resources = [
    {
      icon: Heart,
      title: "Mental Health Support",
      description: "Access to counseling services, mental health resources, and crisis support contacts.",
    },
    {
      icon: Users,
      title: "Peer Support Groups",
      description: "Connect with fellow students in supportive communities where you can share experiences.",
    },
    {
      icon: Lightbulb,
      title: "Wellness Resources",
      description: "Tips for managing stress, self-care guides, and strategies for wellbeing.",
    },
    {
      icon: ShieldCheck,
      title: "Safety Information",
      description: "Know your rights, campus safety resources, and emergency contact information.",
    },
  ];

  return (
    <div className="space-y-12">
      <PageIntro
        title="Your Comfort Zone"
        description="A dedicated space for wellness, support resources, and community care. You are never alone."
      />

      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-12 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Welcome to Your Safe Space</h2>
          <p className="text-muted-foreground leading-relaxed">
            This section is designed to provide you with resources, support, and community. Whether you're looking for 
            mental health support, wellness tips, or just need to connect with others, we're here for you. Your wellbeing matters.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {resources.map((resource, idx) => {
            const Icon = resource.icon;
            return (
              <div key={idx} className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{resource.title}</h3>
                <p className="text-sm text-muted-foreground">{resource.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold mb-8">Helpful Resources</h2>
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h4 className="font-semibold mb-2">Campus Counseling Center</h4>
            <p className="text-sm text-muted-foreground mb-3">Professional counselors available for individual and group sessions.</p>
            <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">Learn more →</a>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h4 className="font-semibold mb-2">24/7 Crisis Hotline</h4>
            <p className="text-sm text-muted-foreground mb-3">If you're in immediate distress, our crisis hotline is always available.</p>
            <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">Get help now →</a>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h4 className="font-semibold mb-2">Wellness Programs</h4>
            <p className="text-sm text-muted-foreground mb-3">Join workshops, meditation sessions, and fitness classes designed for student wellness.</p>
            <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">Browse programs →</a>
          </div>
        </div>
      </section>
    </div>
  );
}
