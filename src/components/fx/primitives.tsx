import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useInView, useMotionValue, useSpring } from "framer-motion";
import Lenis from "lenis";
import { cn } from "@/lib/utils";
import { sound } from "@/lib/sound";

/* ───────── smooth scroll ───────── */

let lenis: Lenis | null = null;

export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    let id = 0;
    const raf = (t: number) => {
      lenis?.raf(t);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(id);
      lenis?.destroy();
      lenis = null;
    };
  }, []);
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  sound.play("whoosh");
  if (lenis) lenis.scrollTo(el, { offset: -20, duration: 1.4 });
  else el.scrollIntoView({ behavior: "smooth" });
}

/* ───────── text scramble / decrypt ───────── */

const GLYPHS = "!<>-_\\/[]{}—=+*^?#01アイウエオカキクケコ";

export function ScrambleText({
  text,
  className,
  delay = 0,
  speed = 28,
  trigger = "view",
}: {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
  trigger?: "view" | "mount" | "hover";
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [out, setOut] = useState(trigger === "hover" ? text : "");
  const running = useRef(false);

  const run = () => {
    if (running.current) return;
    running.current = true;
    let frame = 0;
    const total = text.length * 2 + 8;
    const tick = () => {
      frame++;
      const revealed = Math.floor((frame / total) * text.length);
      setOut(
        text
          .split("")
          .map((c, i) => (c === " " ? " " : i < revealed ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(""),
      );
      if (frame < total) setTimeout(tick, speed);
      else {
        setOut(text);
        running.current = false;
      }
    };
    tick();
  };

  useEffect(() => {
    if (trigger === "mount" || (trigger === "view" && inView)) {
      const t = setTimeout(run, delay);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, trigger]);

  return (
    <span
      ref={ref}
      className={className}
      aria-label={text}
      onMouseEnter={trigger === "hover" ? run : undefined}
    >
      <span aria-hidden>{out || " "}</span>
    </span>
  );
}

/* ───────── reveal on scroll ───────── */

export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ───────── section heading ───────── */

export function SectionHeading({ index, label, title, sub }: { index: string; label: string; title: ReactNode; sub?: string }) {
  return (
    <div className="mb-14 md:mb-20">
      <Reveal>
        <div className="mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-primary">
          <span className="text-muted-foreground">{index}</span>
          <span className="h-px w-10 bg-gradient-to-r from-primary to-transparent" />
          <ScrambleText text={label} />
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">{title}</h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.16}>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">{sub}</p>
        </Reveal>
      )}
    </div>
  );
}

/* ───────── magnetic wrapper ───────── */

export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.3 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.3 });
  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x, y }}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ───────── animated counter ───────── */

export function Counter({ to, suffix = "", className }: { to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 2, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setVal(Math.round(v)) });
    return () => c.stop();
  }, [inView, to]);
  return (
    <span ref={ref} className={className}>
      {val.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

/* ───────── pointer spotlight for cards ───────── */

export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const onMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return { ref, onMouseMove };
}
