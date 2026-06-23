import { useState, useEffect, useRef } from "react";
import { Link, useRouterState } from "@tanstack/react-router";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/comfort-zone", label: "Comfort Zone" },
] as const;

function BrandMark({ size = "sm" }: { size?: "sm" | "md" }) {
  return (
    <img
      src="/mzuni_logo.png"
      alt="Mzuzu University Logo"
      className={`object-contain ${size === "md" ? "h-11 w-11" : "h-9 w-9"}`}
    />
  );
}

function AnimatedHamburger({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-xl transition-colors hover:bg-muted md:hidden"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
    >
      <span
        className={`block h-0.5 w-5 rounded-full bg-foreground transition-all duration-300 ${
          open ? "translate-y-2 rotate-45" : ""
        }`}
      />
      <span
        className={`block h-0.5 w-5 rounded-full bg-foreground transition-all duration-300 ${
          open ? "opacity-0" : ""
        }`}
      />
      <span
        className={`block h-0.5 w-5 rounded-full bg-foreground transition-all duration-300 ${
          open ? "-translate-y-2 -rotate-45" : ""
        }`}
      />
    </button>
  );
}

export function SiteHeader({ className = "" }: { className?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      setMobileOpen(false);
    }
  };

  return (
    <header className={`relative z-50 w-full ${className}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:h-[4.5rem] sm:px-10">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-semibold tracking-tight text-foreground"
        >
          <BrandMark />
          <span className="text-lg">SafeVoice</span>
        </Link>

        {/* Desktop nav */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
              activeProps={{ className: "bg-primary/10 text-primary font-semibold" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-4">
          <Link
            to="/student"
            className="hidden rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 md:inline-flex"
          >
            Sign In
          </Link>
          <AnimatedHamburger
            open={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          />
        </div>
      </div>

      {/* Mobile drawer (always mounted for smooth transitions) */}
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className={`fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div
          className={`absolute right-4 top-4 w-64 origin-top-right rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-300 ease-out sm:right-10 ${
            mobileOpen
              ? "translate-y-0 scale-100 opacity-100"
              : "-translate-y-2 scale-95 opacity-0"
          }`}
        >
          <div className="flex items-center justify-between pb-4">
            <span className="text-sm font-semibold text-foreground">Menu</span>
            <AnimatedHamburger
              open={mobileOpen}
              onClick={() => setMobileOpen(false)}
            />
          </div>
          <nav className="flex flex-col gap-1">
            {nav.map((n) => {
              const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  activeOptions={{ exact: n.to === "/" }}
                  className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
            <hr className="my-2 border-border" />
            <Link
              to="/student"
              className="rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground text-center transition-colors hover:bg-primary/90"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </div>

    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 bg-secondary/30">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <div className="flex items-center gap-2.5">
          <BrandMark />
          <p>© {new Date().getFullYear()} SafeVoice</p>
        </div>
        <p className="text-center sm:text-right">Student welfare reporting — built for care and confidentiality.</p>
      </div>
    </footer>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 sm:py-14">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
      )}
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{title}</h1>
      {description && (
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export function PublicLayout({
  children,
  heroHeader = false,
}: {
  children: React.ReactNode;
  heroHeader?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen flex-col">
      {!heroHeader && (
        <div className="bg-dotted border-b border-border/40">
          <SiteHeader />
        </div>
      )}
      <main key={pathname} className="flex-1 animate-page-in">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
