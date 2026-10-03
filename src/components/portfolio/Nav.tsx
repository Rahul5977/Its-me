import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Command, Menu, Volume2, VolumeX, X } from "lucide-react";
import { scrollToId } from "@/components/fx/primitives";
import { sound, useSoundEnabled } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

// `pill: false` keeps a section out of the desktop pill bar (still in the mobile menu and ⌘K).
export const SECTIONS = [
  { id: "home", label: "home", pill: false },
  { id: "about", label: "about", pill: true },
  { id: "work", label: "work", pill: true },
  { id: "students", label: "vision", pill: true },
  { id: "internship", label: "internship", pill: true },
  { id: "interiit", label: "inter iit", pill: true },
  { id: "journey", label: "journey", pill: true },
  { id: "stack", label: "stack", pill: false },
  { id: "terminal", label: "terminal", pill: false },
  { id: "contact", label: "contact", pill: true },
];

export function SoundToggle({ className }: { className?: string }) {
  const on = useSoundEnabled();
  return (
    <button
      onClick={() => {
        sound.unlock();
        sound.setEnabled(!on);
      }}
      aria-label={on ? "Mute sound effects" : "Enable sound effects"}
      title={on ? "Sound: on" : "Sound: off"}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/40 text-muted-foreground transition hover:border-primary hover:text-primary",
        className,
      )}
    >
      {on ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      {on && (
        <span className="absolute -bottom-0.5 flex gap-[2px]">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-[2px] rounded bg-primary"
              animate={{ height: [2, 6, 2] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </span>
      )}
    </button>
  );
}

export function Nav({ onOpenPalette }: { onOpenPalette: () => void }) {
  const [active, setActive] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  const go = (id: string) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-3 z-50 flex justify-center px-4"
      >
        <nav
          className={cn(
            "flex w-full max-w-5xl items-center justify-between gap-2 rounded-full border px-3 py-2 transition-all duration-500",
            scrolled ? "glass border-white/10 shadow-[0_8px_40px_-12px_hsl(var(--primary)/0.35)]" : "border-transparent",
          )}
        >
          <button onClick={() => go("home")} className="group flex items-center gap-2 pl-2 font-mono text-sm">
            <Logo className="h-8 w-8 transition-transform duration-500 group-hover:rotate-[360deg] group-hover:drop-shadow-[0_0_10px_hsl(var(--primary)/0.7)]" />
            <span className="hidden text-muted-foreground transition group-hover:text-foreground sm:inline">
              rahul<span className="text-primary">.</span>dev
            </span>
          </button>

          <ul className="hidden items-center gap-1 md:flex">
            {SECTIONS.filter((s) => s.pill).map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => go(s.id)}
                  className={cn(
                    "relative rounded-full px-3.5 py-1.5 font-mono text-xs transition-colors",
                    active === s.id ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active === s.id && (
                    <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-primary" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                  )}
                  {s.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPalette}
              className="hidden items-center gap-1.5 rounded-full border border-border bg-background/40 px-3 py-1.5 font-mono text-xs text-muted-foreground transition hover:border-primary hover:text-primary sm:flex"
            >
              <Command className="h-3 w-3" /> K
            </button>
            <SoundToggle />
            <button
              onClick={() => {
                setOpen((o) => !o);
                sound.play(open ? "close" : "open");
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border md:hidden"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "circle(0% at 100% 0%)" }}
            animate={{ clipPath: "circle(150% at 100% 0%)" }}
            exit={{ clipPath: "circle(0% at 100% 0%)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-center bg-background/95 px-8 backdrop-blur-xl md:hidden"
          >
            {SECTIONS.map((s, i) => (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                onClick={() => go(s.id)}
                className="py-2 text-left font-display text-4xl font-bold"
              >
                <span className="mr-3 font-mono text-sm text-primary">{String(i).padStart(2, "0")}</span>
                {s.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
