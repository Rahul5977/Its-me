import { useEffect, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { PenLine, Rss } from "lucide-react";
import { Cursor, ScrollProgress } from "@/components/fx/ambient";
import { scrollToTop, useSmoothScroll } from "@/components/fx/primitives";
import { Logo } from "@/components/portfolio/Logo";
import { SoundToggle } from "@/components/portfolio/Nav";
import { useGlobalUiSounds } from "@/hooks/use-ui-sounds";
import { profile } from "@/data/portfolio";
import { asset, cn } from "@/lib/utils";
import { hasVault } from "@/lib/blog/github";

export function usePageTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title;
    return () => {
      document.title = prev;
    };
  }, [title]);
}

/** Soft aurora + grid behind blog pages: calmer than the home page's neural net, so text stays readable. */
function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="grid-bg absolute inset-0 opacity-60" />
      <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute -right-40 top-1/3 h-[480px] w-[480px] rounded-full bg-secondary/10 blur-[120px]" />
      <div className="absolute bottom-0 left-1/3 h-[360px] w-[360px] rounded-full bg-accent/[0.06] blur-[120px]" />
    </div>
  );
}

export function BlogShell({ children }: { children: ReactNode }) {
  useSmoothScroll();
  useGlobalUiSounds();
  // The studio link only shows on devices holding your encrypted token (or in dev).
  const canWrite = import.meta.env.DEV || hasVault();

  useEffect(() => scrollToTop(), []);

  const link = ({ isActive }: { isActive: boolean }) =>
    cn("rounded-full px-3.5 py-1.5 font-mono text-xs transition-colors", isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground");

  return (
    <div className="noise relative min-h-screen">
      <Aurora />
      <Cursor />
      <ScrollProgress />
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-3 z-50 flex justify-center px-4"
      >
        <nav className="glass flex w-full max-w-5xl items-center justify-between gap-2 rounded-full px-3 py-2 shadow-[0_8px_40px_-12px_hsl(var(--primary)/0.35)]">
          <Link to="/" className="group flex items-center gap-2 pl-2 font-mono text-sm">
            <Logo className="h-8 w-8 transition-transform duration-500 group-hover:rotate-[360deg]" />
            <span className="hidden text-muted-foreground transition group-hover:text-foreground sm:inline">
              rahul<span className="text-primary">.</span>dev<span className="text-primary">/</span>blog
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <NavLink to="/" end className={link}>
              portfolio
            </NavLink>
            <NavLink to="/blog" end className={link}>
              blog
            </NavLink>
            {canWrite && (
              // Full page load on purpose: the studio starts clean, without the analytics script (see main.tsx).
              <a href={asset("blog/write")} className={link({ isActive: false })}>
                <span className="inline-flex items-center gap-1">
                  <PenLine className="h-3 w-3" /> write
                </span>
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a
              href={asset("feed.xml")}
              target="_blank"
              rel="noreferrer"
              title="RSS feed"
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-border bg-background/40 text-muted-foreground transition hover:border-primary hover:text-primary sm:flex"
            >
              <Rss className="h-4 w-4" />
            </a>
            <SoundToggle />
          </div>
        </nav>
      </motion.header>

      <main className="relative pb-24 pt-32 md:pt-40">{children}</main>

      <footer className="border-t border-white/5">
        <div className="container flex flex-col items-center justify-between gap-3 py-8 font-mono text-xs text-muted-foreground md:flex-row">
          <span>
            © {new Date().getFullYear()} {profile.name} · written between commits ✍️
          </span>
          <div className="flex items-center gap-4">
            <Link to="/" className="transition hover:text-primary">
              ← back to portfolio
            </Link>
            <a href={asset("feed.xml")} className="transition hover:text-primary">
              rss
            </a>
            <a href={profile.socials.github} target="_blank" rel="noreferrer" className="transition hover:text-primary">
              github
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
