import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { scrollToId } from "@/components/fx/primitives";
import { profile } from "@/data/portfolio";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/5 pt-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="select-none text-center font-display text-[18vw] font-bold leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_hsl(var(--border))] transition-all duration-700 hover:[-webkit-text-stroke:1px_hsl(var(--primary))] lg:text-[13rem]"
          data-cursor
        >
          RAHUL RAJ
        </motion.div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 py-8 font-mono text-xs text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} {profile.name} · crafted with React, Framer Motion &amp; too much chai ☕</span>
          <span className="hidden md:inline">
            press <kbd className="rounded border border-border px-1.5 py-0.5">⌘</kbd> <kbd className="rounded border border-border px-1.5 py-0.5">K</kbd> anywhere
          </span>
          <button onClick={() => scrollToId("home")} className="group inline-flex items-center gap-2 transition hover:text-primary">
            back to top <ArrowUp className="h-3.5 w-3.5 transition group-hover:-translate-y-1" />
          </button>
        </div>
      </div>
    </footer>
  );
}
