import { useState, useEffect, useRef } from "react";
import { Link, useRouterState } from "@tanstack/react-router";

const nav = [
  { to: "/", label: "Home" },
  { to: "/report", label: "Report" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

function BrandMark() {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-white shadow-card ring-1 ring-border">
      <span className="grid grid-cols-2 gap-[3px]">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        <span className="h-1.5 w-1.5 rounded-full bg-foreground/85" />
        <span className="h-1.5 w-1.5 rounded-full bg-foreground/85" />
        <span className="h-1.5 w-1.5 rounded-full bg-foreground/85" />
      </span>
    </span>
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

export function SiteHeader() {
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
    <header className="relative z-50 w-full bg-transparent">
      <div className="mx-auto grid h-20 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6 sm:px-10">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-semibold tracking-tight text-foreground"
        >
          <BrandMark />
          <span className="text-lg">SafeVoice</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-3 sm:gap-5">
          <Link
            to="/admin"
            className="hidden text-sm font-medium text-foreground hover:opacity-70 sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            to="/report"
            className="hidden sm:inline-flex items-center rounded-full border border-foreground/80 bg-transparent px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Get started
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
              to="/admin"
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              to="/report"
              className="mt-1 inline-flex items-center justify-center rounded-full border border-foreground/80 bg-transparent px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Get started
            </Link>
          </nav>
        </div>
      </div>

    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} SafeVoice — Student Welfare Reporting System.</p>
        <p>Built for student wellbeing.</p>
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main key={pathname} className="flex-1 animate-page-in">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
