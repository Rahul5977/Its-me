import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { AlertTriangle, ArrowRight, ArrowUpRight, Github, GraduationCap, ListChecks, MessagesSquare, Quote, Stethoscope, Target } from "lucide-react";
import { Magnetic, Reveal, SectionHeading, useSpotlight } from "@/components/fx/primitives";
import { forTheStudents as fts } from "@/data/portfolio";
import { cn } from "@/lib/utils";

const PILLAR_ICONS = [Target, ListChecks, MessagesSquare];
const TAG_STYLE: Record<string, string> = {
  Safe: "bg-accent/15 text-accent",
  Target: "bg-primary/15 text-primary",
  Reach: "bg-secondary/15 text-secondary",
};

/** Animated "List Doctor": choices fill in, then the checker flags the classic mistakes. */
function ListDoctor() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const total = fts.doctor.length;
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const iv = setInterval(() => setStep((s) => (s + 1) % (total + 6)), 650);
    return () => clearInterval(iv);
  }, [inView, total]);

  const shown = Math.min(step, total);
  const diagnosing = step > total;
  const flags = fts.doctor.filter((d) => d.flag).length;

  return (
    <div ref={ref} className="glass overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 font-mono text-xs">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Stethoscope className="h-4 w-4 text-primary" /> list-doctor · my JoSAA choices
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={diagnosing ? "diag" : "edit"}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className={diagnosing ? "text-amber-300" : "text-muted-foreground"}
          >
            {diagnosing ? `⚠ ${flags} issues found` : "drafting…"}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="min-h-[330px] space-y-2 p-4">
        {fts.doctor.slice(0, shown).map((d, i) => (
          <motion.div key={i} layout initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} className="rounded-lg bg-white/[0.03] px-3 py-2">
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="w-5 text-muted-foreground">{i + 1}.</span>
              <span className="flex-1 truncate">{d.choice}</span>
              <span className={cn("rounded px-1.5 py-0.5 text-[10px]", TAG_STYLE[d.tag])}>{d.tag}</span>
            </div>
            <AnimatePresence>
              {diagnosing && d.flag && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-8 mt-1.5 flex items-center gap-1.5 overflow-hidden text-[11px] text-amber-300"
                >
                  <AlertTriangle className="h-3 w-3 shrink-0" /> {d.flag}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PrincipleCard({ p, i }: { p: (typeof fts.principles)[number]; i: number }) {
  const spot = useSpotlight<HTMLDivElement>();
  return (
    <motion.div
      ref={spot.ref}
      onMouseMove={spot.onMouseMove}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: i * 0.08 }}
      style={{ ["--glow" as string]: "84 81% 55%" }}
      className="spotlight glass rounded-xl p-5"
    >
      <div className="mb-1 flex items-center gap-2 font-display font-semibold">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {p.title}
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{p.body}</p>
    </motion.div>
  );
}

export function ForTheStudents() {
  return (
    <section id="students" className="relative py-28 md:py-36">
      <div className="container">
        <SectionHeading
          index="03"
          label="for.the.students"
          title={
            <>
              A project with a <span className="text-gradient">mission.</span>
            </>
          }
        />

        {/* mission + story */}
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
          <Reveal>
            <div className="border-beam relative h-full overflow-hidden rounded-3xl bg-card/70 p-7 backdrop-blur md:p-10">
              <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-accent/10 blur-[90px]" />
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-xs text-accent">
                <GraduationCap className="h-3.5 w-3.5" /> {fts.name} · JEE / JoSAA counselling
              </div>
              <Quote className="mb-3 h-8 w-8 text-accent/60" />
              <p className="font-display text-2xl font-semibold leading-snug md:text-4xl">{fts.mission}</p>
              <p className="mt-6 leading-relaxed text-muted-foreground">{fts.story}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Magnetic>
                  <a
                    href={fts.live}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground shadow-[0_0_40px_-10px_hsl(var(--accent))]"
                  >
                    Try the predictor <ArrowUpRight className="h-4 w-4" />
                  </a>
                </Magnetic>
                <Magnetic>
                  <a
                    href={fts.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm transition hover:border-accent hover:text-accent"
                  >
                    <Github className="h-4 w-4" /> Architecture
                  </a>
                </Magnetic>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 gap-4">
            {fts.numbers.map((n, i) => (
              <motion.div
                key={n.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 200, damping: 20 }}
                className="glass flex flex-col justify-center rounded-2xl p-5"
              >
                <div className="font-display text-3xl font-bold text-accent md:text-4xl">{n.value}</div>
                <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{n.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* pillars */}
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {fts.pillars.map((p, i) => {
            const Icon = PILLAR_ICONS[i];
            return (
              <Reveal key={p.name} delay={i * 0.1} className="relative">
                <div className="glass group h-full rounded-2xl p-6 transition-colors hover:border-accent/40">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent transition group-hover:scale-110">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">step 0{i + 1}</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold">{p.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </div>
                {i < 2 && (
                  <motion.span
                    animate={{ x: [0, 6, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-accent/40 bg-background p-1 text-accent md:block"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </motion.span>
                )}
              </Reveal>
            );
          })}
        </div>

        {/* list doctor + principles */}
        <div className="mt-16 grid gap-8 lg:grid-cols-2 [&>*]:min-w-0">
          <Reveal>
            <ListDoctor />
          </Reveal>
          <div>
            <Reveal>
              <div className="mb-5 font-mono text-xs uppercase tracking-[0.3em] text-accent">design.principles</div>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              {fts.principles.map((p, i) => (
                <PrincipleCard key={p.title} p={p} i={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
