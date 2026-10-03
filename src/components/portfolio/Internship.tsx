import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { BarChart3, Boxes, Briefcase, Database, DownloadCloud, Mic, Server, Tags } from "lucide-react";
import { PhotoStrip } from "@/components/fx/Photos";
import { Reveal, SectionHeading, useSpotlight } from "@/components/fx/primitives";
import { internship } from "@/data/portfolio";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";

const STAGE_ICONS = [DownloadCloud, Database, Mic, Tags, Boxes, BarChart3, Server];

function Pipeline() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-100px" });
  const stages = internship.pipeline;

  useEffect(() => {
    if (!inView || paused) return;
    const iv = setInterval(() => setActive((a) => (a + 1) % stages.length), 2600);
    return () => clearInterval(iv);
  }, [inView, paused, stages.length]);

  const stage = stages[active];
  const Icon = STAGE_ICONS[active];

  return (
    <div ref={ref} className="glass relative overflow-hidden rounded-3xl p-6 md:p-10" onMouseLeave={() => setPaused(false)}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-muted-foreground">
        <span>
          <span className="text-accent">$</span> pipeline --trace{" "}
          <span className="text-foreground/60">ingest → serve</span>
        </span>
        <span className="flex items-center gap-2">
          <span className={cn("h-1.5 w-1.5 rounded-full", paused ? "bg-amber-300" : "animate-pulse bg-accent")} />
          {paused ? "inspecting" : "streaming"}
        </span>
      </div>

      {/* stage rail */}
      <div className="relative">
        <div className="absolute left-[7%] right-[7%] top-7 hidden h-px bg-white/10 md:block" />
        <motion.div
          className="absolute left-[7%] top-7 hidden h-px bg-gradient-to-r from-primary via-secondary to-accent md:block"
          animate={{ width: `${(active / (stages.length - 1)) * 86}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* data packets flowing along the rail */}
        {inView &&
          [0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute top-[26px] hidden h-[3px] w-6 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))] md:block"
              initial={{ left: "7%", opacity: 0 }}
              animate={{ left: ["7%", "91%"], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 3.6, repeat: Infinity, delay: i * 1.2, ease: "linear" }}
            />
          ))}

        <div className="relative grid grid-cols-4 gap-y-6 md:grid-cols-7">
          {stages.map((s, i) => {
            const SIcon = STAGE_ICONS[i];
            const on = i === active;
            const done = i < active;
            return (
              <button
                key={s.id}
                onMouseEnter={() => {
                  setPaused(true);
                  setActive(i);
                }}
                onClick={() => {
                  setPaused(true);
                  setActive(i);
                  sound.play("toggle");
                }}
                className="group flex flex-col items-center gap-3 text-center"
                aria-pressed={on}
              >
                <motion.span
                  animate={{ scale: on ? 1.12 : 1 }}
                  className={cn(
                    "relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border bg-background transition-colors duration-300",
                    on ? "border-primary text-primary shadow-[0_0_30px_-4px_hsl(var(--primary))]" : done ? "border-primary/40 text-primary/70" : "border-white/10 text-muted-foreground group-hover:border-white/30",
                  )}
                >
                  {on && <span className="absolute inset-0 animate-pulse-ring rounded-2xl border border-primary" />}
                  <SIcon className="h-5 w-5" />
                </motion.span>
                <span className={cn("font-mono text-[11px] transition-colors", on ? "text-foreground" : "text-muted-foreground")}>
                  <span className="text-muted-foreground/50">{String(i + 1).padStart(2, "0")} </span>
                  {s.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* stage detail */}
      <div className="mt-10 min-h-[150px] rounded-2xl border border-white/5 bg-background/60 p-5 md:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
            transition={{ duration: 0.35 }}
            className="flex flex-col gap-4 md:flex-row md:items-start"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h4 className="font-display text-xl font-semibold">{stage.name}</h4>
                <span className="font-mono text-xs text-secondary">{stage.tech}</span>
              </div>
              <p className="mt-2 max-w-3xl leading-relaxed text-muted-foreground">{stage.detail}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function DecisionCard({ d, i }: { d: (typeof internship.decisions)[number]; i: number }) {
  const spot = useSpotlight<HTMLDivElement>();
  return (
    <motion.div
      ref={spot.ref}
      onMouseMove={spot.onMouseMove}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
      whileHover={{ y: -5 }}
      className="spotlight glass group rounded-2xl p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-xs text-primary">0x{(i + 1).toString(16).padStart(2, "0")}</span>
        <span className="rounded-md bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-muted-foreground">{d.tag}</span>
      </div>
      <h4 className="font-display text-lg font-semibold transition-colors group-hover:text-primary">{d.title}</h4>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.body}</p>
    </motion.div>
  );
}

export function Internship() {
  return (
    <section id="internship" className="relative py-28 md:py-36">
      <div className="container">
        <SectionHeading
          index="04"
          label="internship.log"
          title={
            <>
              Engineering @ <span className="text-gradient">SuperLiving.</span>
            </>
          }
          sub={internship.summary}
        />

        <Reveal className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
                <Briefcase className="h-5 w-5" />
              </span>
              <div>
                <div className="font-display font-semibold">
                  {internship.role} · {internship.org}
                </div>
                <div className="font-mono text-xs text-muted-foreground">{internship.year} · AI platform engineering</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
              {internship.stats.map((s) => (
                <div key={s.label} className="bg-background/80 px-4 py-3 text-center">
                  <div className="font-display text-xl font-bold text-primary">{s.value}</div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <PhotoStrip id="superliving" photos={internship.photos} className="mx-auto mb-16 max-w-4xl px-2" />

        <Reveal>
          <Pipeline />
        </Reveal>

        <div className="mt-16">
          <Reveal>
            <div className="mb-8 font-mono text-xs uppercase tracking-[0.3em] text-primary">design.decisions</div>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {internship.decisions.map((d, i) => (
              <DecisionCard key={d.title} d={d} i={i} />
            ))}
          </div>
        </div>

        <Reveal className="mt-12">
          <div className="flex flex-wrap gap-2">
            {internship.stack.map((t) => (
              <span key={t} className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-muted-foreground transition hover:border-primary/50 hover:text-primary">
                {t}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
