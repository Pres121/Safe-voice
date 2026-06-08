import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — SafeVoice" },
      { name: "description", content: "Contact page removed" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  useEffect(() => {
    // Redirect removed contact page to home
    window.location.replace("/");
  }, []);

  return null;
}
