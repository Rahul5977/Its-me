import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { formatDate, posts } from "@/lib/blog/posts";
import { sound } from "@/lib/sound";

const DISMISS_KEY = "rr-blog-popout-dismissed";
const DELAY_MS = 3500;

/**
 * Floating "new on the blog" card on the home page. Dismissing it is remembered per post,
 * so it comes back once a newer post is published.
 */
export function LatestPostPopout({ ready }: { ready: boolean }) {
  const latest = posts.find((p) => !p.draft) ?? (import.meta.env.DEV ? posts[0] : undefined);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ready || !latest) return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === latest.slug) return;
    } catch {
      /* storage blocked: still show */
    }
    const t = setTimeout(() => {
      setOpen(true);
      sound.play("open");
    }, DELAY_MS);
    return () => clearTimeout(t);
  }, [ready, latest]);

  // Hide while the blog section itself is on screen; the cards there say the same thing.
  useEffect(() => {
    const el = document.getElementById("writing");
    if (!el || !open) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setOpen(false), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [open]);

  const dismiss = () => {
    setOpen(false);
    sound.play("close");
    try {
      if (latest) localStorage.setItem(DISMISS_KEY, latest.slug);
    } catch {
      /* ignore */
    }
  };

  return (
    <AnimatePresence>
      {open && latest && (
        <motion.aside
          initial={{ opacity: 0, y: 40, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="fixed bottom-4 left-4 right-4 z-[55] sm:left-auto sm:w-[360px]"
          aria-label="Latest blog post"
        >
          <div className="border-beam glass relative overflow-hidden rounded-2xl shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.45)]">
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <Link to={`/blog/${latest.slug}`} onClick={dismiss} className="group flex items-center gap-4 p-4 pr-10">
              <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-3xl">
                <span className="transition duration-300 group-hover:-rotate-12 group-hover:scale-110">{latest.mood || "✍️"}</span>
                <span className="absolute -right-1 -top-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
                </span>
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-accent">new on the blog · {formatDate(latest.date, "short")}</span>
                <span className="mt-1 line-clamp-2 block font-display font-semibold leading-snug transition group-hover:text-primary">{latest.title}</span>
                <span className="mt-1.5 inline-flex items-center gap-1 font-mono text-xs text-primary">
                  see latest blog <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:rotate-45" />
                </span>
              </span>
            </Link>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
