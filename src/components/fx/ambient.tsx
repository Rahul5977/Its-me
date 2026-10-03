import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { sound } from "@/lib/sound";

/* ───────── custom cursor ───────── */

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);
    document.body.classList.add("has-custom-cursor");

    let x = window.innerWidth / 2,
      y = window.innerHeight / 2,
      rx = x,
      ry = y,
      raf = 0;
    let hovering = false,
      down = false;

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = e.target as HTMLElement;
      hovering = !!t.closest("a, button, [role='button'], input, textarea, [data-cursor]");
    };
    const pd = () => (down = true);
    const pu = () => (down = false);
    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      if (ring.current) {
        const s = (hovering ? 1.9 : 1) * (down ? 0.75 : 1);
        ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${s})`;
        ring.current.style.borderColor = hovering ? "hsl(var(--accent))" : "hsl(var(--primary) / 0.6)";
        ring.current.style.backgroundColor = hovering ? "hsl(var(--accent) / 0.08)" : "transparent";
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", pd);
    window.addEventListener("pointerup", pu);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", pd);
      window.removeEventListener("pointerup", pu);
      document.body.classList.remove("has-custom-cursor");
    };
  }, []);

  if (!enabled) return null;
  return (
    <>
      <div
        ref={ring}
        className="pointer-events-none fixed left-0 top-0 z-[100] h-9 w-9 rounded-full border transition-[background-color,border-color] duration-200"
      />
      <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[100] h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))]" />
    </>
  );
}

/* ───────── neural network background (canvas) ───────── */

export function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0,
      h = 0,
      dpr = 1,
      raf = 0;
    const mouse = { x: -9999, y: -9999 };
    type P = { x: number; y: number; vx: number; vy: number; r: number; hue: number };
    let pts: P[] = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(110, Math.floor((w * h) / 14000));
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.6 + 0.4,
        hue: Math.random() < 0.7 ? 188 : 258,
      }));
    };

    const LINK = 130;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        if (!reduced) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
          const dx = mouse.x - p.x,
            dy = mouse.y - p.y;
          const d = Math.hypot(dx, dy);
          if (d < 180) {
            p.x -= (dx / d) * 0.6;
            p.y -= (dy / d) * 0.6;
          }
        }
      }
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            ctx.strokeStyle = `hsla(${a.hue}, 86%, 60%, ${(1 - d / LINK) * 0.18})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (md < 220) {
          ctx.strokeStyle = `hsla(84, 81%, 55%, ${(1 - md / 220) * 0.35})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
        ctx.fillStyle = `hsla(${a.hue}, 90%, 65%, 0.8)`;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduced && !document.hidden) raf = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (reduced) draw();
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="grid-bg absolute inset-0" />
      <div className="absolute -left-40 top-[-10%] h-[520px] w-[520px] rounded-full bg-primary/10 blur-[140px]" />
      <div className="absolute -right-40 top-[40%] h-[520px] w-[520px] rounded-full bg-secondary/10 blur-[140px]" />
    </div>
  );
}

/* ───────── scroll progress bar ───────── */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-primary via-secondary to-accent"
    />
  );
}

/* ───────── boot sequence ───────── */

const BOOT_LINES = [
  "[ OK ] mounting /dev/rahul ............ IIT Bhilai · DSAI",
  "[ OK ] loading kernel modules ......... react · node · python",
  "[ OK ] spinning up agents ............. miniclaw · verimem",
  "[ OK ] warming caches ................. redis · cloudfront",
  "[ OK ] connecting to github.com/Rahul5977",
  "[ OK ] compiling 1,430 contributions",
  "[ ** ] all systems nominal",
];

export function BootLoader({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      const line = BOOT_LINES[i];
      setLines((l) => [...l, line]);
      sound.play("key");
      i++;
      setProgress(Math.round((i / BOOT_LINES.length) * 100));
      if (i >= BOOT_LINES.length) {
        clearInterval(iv);
        setTimeout(() => setReady(true), 250);
      }
    }, 230);
    return () => clearInterval(iv);
  }, []);

  const enter = (withSound: boolean) => {
    if (leaving) return;
    if (!withSound) sound.setEnabled(false);
    else {
      sound.unlock();
      sound.play("boot");
    }
    setLeaving(true);
    setTimeout(onDone, 750);
  };

  useEffect(() => {
    if (!ready) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") enter(sound.enabled);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background px-4"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="scanlines pointer-events-none absolute inset-0 opacity-40" />
          <div className="w-full max-w-xl font-mono text-xs sm:text-sm">
            <div className="mb-6 flex items-center gap-3 text-muted-foreground">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              rahul@portfolio:~$ ./boot --env=production
            </div>
            <div className="min-h-[190px] space-y-1.5">
              {lines.map((l, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={l.startsWith("[ **") ? "text-accent" : "text-foreground/80"}
                >
                  <span className={l.startsWith("[ **") ? "" : "text-primary"}>{l.slice(0, 6)}</span>
                  {l.slice(6)}
                </motion.div>
              ))}
            </div>
            <div className="mt-6 h-1 w-full overflow-hidden rounded bg-muted">
              <motion.div className="h-full bg-gradient-to-r from-primary via-secondary to-accent" animate={{ width: `${progress}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-muted-foreground">
              <span>booting portfolio v2026</span>
              <span>{progress}%</span>
            </div>

            <AnimatePresence>
              {ready && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <button
                    onClick={() => enter(true)}
                    className="group relative overflow-hidden rounded-full border border-primary/50 bg-primary/10 px-7 py-3 font-mono text-sm text-primary transition hover:bg-primary hover:text-primary-foreground"
                  >
                    <span className="relative z-10">▶ enter with sound</span>
                    <span className="absolute inset-0 -z-0 animate-pulse bg-primary/10" />
                  </button>
                  <button onClick={() => enter(false)} className="font-mono text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                    enter silently
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ───────── infinite marquee ───────── */

export function Marquee({ items, reverse = false, duration = 40 }: { items: string[]; reverse?: boolean; duration?: number }) {
  const row = [...items, ...items];
  return (
    <div className="relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
      <div
        className="flex shrink-0 animate-marquee gap-4 pr-4 hover:[animation-play-state:paused]"
        style={{ ["--marquee-duration" as string]: `${duration}s`, animationDirection: reverse ? "reverse" : "normal" }}
      >
        {row.map((t, i) => (
          <span
            key={i}
            className="glass whitespace-nowrap rounded-full px-5 py-2 font-mono text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
