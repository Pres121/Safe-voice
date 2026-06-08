import { useEffect, useState } from "react";

const STORAGE_KEY = "safevoice:home-loader-shown";

export function HomeLoader() {
  const [show, setShow] = useState(false);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setShow(true);
    document.body.style.overflow = "hidden";
    const fadeT = window.setTimeout(() => setHide(true), 2400);
    const endT = window.setTimeout(() => {
      setShow(false);
      document.body.style.overflow = "";
    }, 3000);
    return () => {
      window.clearTimeout(fadeT);
      window.clearTimeout(endT);
      document.body.style.overflow = "";
    };
  }, []);

  if (!show) return null;

  const words = ["You're", "not", "alone"];

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-background via-secondary/40 to-accent/30 transition-opacity duration-500 ${
        hide ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={hide}
    >
      <div className="bg-dotted absolute inset-0 opacity-50" />
      <div className="relative flex flex-col items-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 shadow-soft ring-1 ring-primary/30 animate-scale-in p-2">
          <img
            src="/logo.jpg"
            alt="Mzuzu University Logo"
            className="h-full w-full object-contain animate-pulse"
          />
        </div>
        <h1 className="flex flex-wrap items-baseline justify-center gap-x-3 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          {words.map((w, i) => (
            <span
              key={i}
              className="inline-block opacity-0 animate-fade-in"
              style={{
                animationDelay: `${i * 280 + 200}ms`,
                animationFillMode: "forwards",
              }}
            >
              {w === "not" ? <span className="text-primary">{w}</span> : w}
            </span>
          ))}
        </h1>
        <p
          className="text-sm text-muted-foreground opacity-0 animate-fade-in"
          style={{ animationDelay: "1300ms", animationFillMode: "forwards" }}
        >
          SafeVoice — we hear you.
        </p>
      </div>
    </div>
  );
}
