import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Github, Lock, Radio } from "lucide-react";
import { Reveal, ScrambleText, SectionHeading, useSpotlight } from "@/components/fx/primitives";
import { featuredProjects, moreProjects, nowBuilding, type Project, type ProjectCategory } from "@/data/portfolio";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { PROJECT_VISUALS } from "./ProjectVisuals";

const STATUS_STYLE: Record<Project["status"], string> = {
  Live: "border-accent/40 bg-accent/10 text-accent",
  Building: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  Shipped: "border-primary/40 bg-primary/10 text-primary",
  "Design phase": "border-secondary/40 bg-secondary/10 text-secondary",
};

function StatusPill({ status }: { status: Project["status"] }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider", STATUS_STYLE[status])}>
      <span className={cn("h-1.5 w-1.5 rounded-full bg-current", status !== "Shipped" && "animate-pulse")} />
      {status}
    </span>
  );
}

function ProjectLinks({ p, size = "md" }: { p: Project; size?: "sm" | "md" }) {
  const cls =
    size === "md"
      ? "inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm transition hover:border-primary hover:text-primary"
      : "inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-primary";
  return (
    <div className="flex flex-wrap items-center gap-3">
      {p.links.live && (
        <a href={p.links.live} target="_blank" rel="noreferrer" className={cn(cls, size === "md" && "border-primary/50 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground")}>
          {p.links.live.includes("youtube") ? "Demo" : "Live"} <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      )}
      {p.links.github && (
        <a href={p.links.github} target="_blank" rel="noreferrer" className={cls}>
          <Github className="h-3.5 w-3.5" /> Code
        </a>
      )}
      {p.links.note && (
        <span className={cn("inline-flex items-center gap-1.5 font-mono text-muted-foreground", size === "md" ? "text-xs" : "text-[10px]")}>
          <Lock className="h-3 w-3" /> {p.links.note}
        </span>
      )}
    </div>
  );
}

/* ───────── now building: VeriMem ───────── */

function NowBuilding() {
  const [hot, setHot] = useState(0);
  const pipeRef = useRef<HTMLDivElement>(null);
  const inView = useInView(pipeRef, { margin: "-80px" });
  useEffect(() => {
    if (!inView) return;
    const iv = setInterval(() => setHot((h) => (h + 1) % (nowBuilding.pipeline.length + 2)), 900);
    return () => clearInterval(iv);
  }, [inView]);
  return (
    <Reveal className="mb-24">
      <div className="border-beam relative overflow-hidden rounded-3xl bg-card/60 p-6 backdrop-blur md:p-10">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-400/10 blur-[100px]" />
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
          <div className="lg:w-1/2">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 font-mono text-xs text-amber-300">
              <Radio className="h-3.5 w-3.5 animate-pulse" /> currently building
            </div>
            <h3 className="font-display text-4xl font-bold md:text-5xl">
              <ScrambleText text={nowBuilding.name} />
            </h3>
            <p className="mt-1 font-mono text-sm text-primary">{nowBuilding.kicker}</p>
            <p className="mt-4 leading-relaxed text-muted-foreground">{nowBuilding.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {nowBuilding.stack.map((s) => (
                <span key={s} className="rounded-md bg-white/5 px-2 py-1 font-mono text-[11px] text-foreground/80">
                  {s}
                </span>
              ))}
            </div>
            <a href={nowBuilding.github} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm text-primary hover:underline">
              <Github className="h-4 w-4" /> follow the build
            </a>
          </div>

          {/* animated verification pipeline */}
          <div className="lg:w-1/2">
            <div ref={pipeRef} className="relative flex flex-col gap-3">
              {nowBuilding.pipeline.map((step, i) => (
                <div key={step} className="flex items-center gap-4">
                  <motion.div
                    animate={{
                      scale: hot === i ? 1.12 : 1,
                      backgroundColor: hot >= i ? "hsl(188 86% 53% / 0.18)" : "hsl(0 0% 100% / 0.03)",
                      borderColor: hot >= i ? "hsl(188 86% 53% / 0.7)" : "hsl(0 0% 100% / 0.08)",
                    }}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border font-mono text-xs"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </motion.div>
                  <div className="flex-1">
                    <div className={cn("font-mono text-sm transition-colors", hot >= i ? "text-foreground" : "text-muted-foreground")}>{step}</div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded bg-white/5">
                      <motion.div className="h-full bg-gradient-to-r from-primary to-amber-300" animate={{ width: hot > i ? "100%" : hot === i ? "55%" : "0%" }} transition={{ duration: 0.7 }} />
                    </div>
                  </div>
                  <span className={cn("font-mono text-[10px]", hot > i ? "text-accent" : "text-muted-foreground/40")}>{hot > i ? "✔ ok" : "…"}</span>
                </div>
              ))}
              <div className="mt-2 rounded-lg border border-white/5 bg-background/60 px-4 py-3 font-mono text-xs">
                <span className="text-muted-foreground">verdict ›</span>{" "}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={hot >= nowBuilding.pipeline.length ? "done" : "wait"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={hot >= nowBuilding.pipeline.length ? "text-accent" : "text-amber-300"}
                  >
                    {hot >= nowBuilding.pipeline.length ? "SUPPORTED · confidence 0.91 · 4 graded sources" : "verifying claim…"}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ───────── featured: sticky stacked cards ───────── */

function FeaturedCard({ p, i, total }: { p: Project; i: number; total: number }) {
  const wrap = useRef<HTMLDivElement>(null);
  const spot = useSpotlight<HTMLDivElement>();
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1 - (total - i) * 0.025]);
  const Visual = PROJECT_VISUALS[p.id];

  return (
    <div ref={wrap} className="md:sticky md:h-[110vh]" style={{ top: `${96 + i * 22}px` }}>
      <motion.article
        ref={spot.ref}
        onMouseMove={spot.onMouseMove}
        style={{ scale, ["--glow" as string]: p.glow }}
        initial={{ y: 60 }}
        whileInView={{ y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="spotlight group relative origin-top overflow-hidden rounded-3xl border border-white/[0.08] bg-card p-6 shadow-[0_-20px_60px_-30px_rgba(0,0,0,0.9)] md:p-10"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-40 blur-[90px] transition-opacity group-hover:opacity-70" style={{ background: `hsl(${p.glow})` }} />
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12 [&>*]:min-w-0">
          <div className="flex flex-col">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="font-mono text-sm" style={{ color: `hsl(${p.glow})` }}>
                {String(i + 1).padStart(2, "0")} /
              </span>
              <StatusPill status={p.status} />
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{p.category}</span>
            </div>
            <h3 className="font-display text-3xl font-bold tracking-tight md:text-5xl">{p.name}</h3>
            <p className="mt-2 font-mono text-xs text-muted-foreground md:text-sm">{p.kicker}</p>
            <p className="mt-5 leading-relaxed text-foreground/80">{p.description}</p>
            <ul className="mt-5 space-y-2.5">
              {p.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="mt-2 h-1 w-3 shrink-0 rounded" style={{ background: `hsl(${p.glow})` }} />
                  {h}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-1.5">
              {p.stack.map((s) => (
                <span key={s} className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-1 font-mono text-[11px] text-foreground/75">
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-auto pt-7">
              <ProjectLinks p={p} />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {Visual && <Visual />}
            {p.metrics && (
              <div className="grid grid-cols-3 gap-3">
                {p.metrics.map((m) => (
                  <div key={m.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                    <div className="font-display text-xl font-bold md:text-2xl" style={{ color: `hsl(${p.glow})` }}>
                      {m.value}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{m.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.article>
    </div>
  );
}

/* ───────── more projects: filterable grid ───────── */

const FILTERS: ("All" | ProjectCategory)[] = ["All", "AI Agents", "Full Stack", "NLP / ML", "Systems"];

function MiniCard({ p }: { p: Project }) {
  const spot = useSpotlight<HTMLDivElement>();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.35 }}
      style={{ perspective: 800 }}
    >
      <motion.div
        ref={spot.ref}
        onMouseMove={(e) => {
          spot.onMouseMove(e);
          const r = spot.ref.current!.getBoundingClientRect();
          setTilt({ x: -((e.clientY - r.top) / r.height - 0.5) * 8, y: ((e.clientX - r.left) / r.width - 0.5) * 8 });
        }}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        style={{ ["--glow" as string]: p.glow }}
        className="spotlight glass group flex h-full flex-col rounded-2xl p-6 transition-colors hover:border-white/15"
      >
        <div className="mb-4 flex items-center justify-between">
          <StatusPill status={p.status} />
          <span className="font-mono text-[10px] text-muted-foreground">{p.year}</span>
        </div>
        <h4 className="font-display text-xl font-semibold transition-colors group-hover:text-primary">{p.name}</h4>
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">{p.kicker}</p>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {p.stack.slice(0, 5).map((s) => (
            <span key={s} className="font-mono text-[10px] text-foreground/60">
              #{s.replace(/\s+/g, "").toLowerCase()}
            </span>
          ))}
        </div>
        <div className="mt-4 border-t border-white/5 pt-4">
          <ProjectLinks p={p} size="sm" />
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Work() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const shown = filter === "All" ? moreProjects : moreProjects.filter((p) => p.category === filter);

  return (
    <section id="work" className="relative py-28 md:py-36">
      <div className="container">
        <SectionHeading
          index="02"
          label="selected.work"
          title={
            <>
              Things I&apos;ve <span className="text-gradient">shipped</span>
              <br /> &amp; am shipping.
            </>
          }
          sub="Production-minded projects: agents with guardrails, judges with sandboxes, and AI pipelines that degrade gracefully instead of melting the bill."
        />

        <NowBuilding />

        <div className="relative space-y-10 md:space-y-0">
          {featuredProjects.map((p, i) => (
            <FeaturedCard key={p.id} p={p} i={i} total={featuredProjects.length} />
          ))}
        </div>

        <div className="mt-28">
          <Reveal>
            <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.3em] text-primary">more.builds</div>
                <h3 className="mt-3 font-display text-3xl font-bold md:text-4xl">The lab notebook</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFilter(f);
                      sound.play("toggle");
                    }}
                    className={cn(
                      "relative rounded-full border px-4 py-1.5 font-mono text-xs transition-colors",
                      filter === f ? "border-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {filter === f && <motion.span layoutId="filter-pill" className="absolute inset-0 -z-10 rounded-full bg-primary" />}
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {shown.map((p) => (
                <MiniCard key={p.id} p={p} />
              ))}
            </AnimatePresence>
          </motion.div>

          <Reveal className="mt-12 text-center">
            <a
              href="https://github.com/Rahul5977?tab=repositories"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground transition hover:text-primary"
            >
              <Github className="h-4 w-4" /> 70+ more repositories on GitHub <ArrowUpRight className="h-4 w-4" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
