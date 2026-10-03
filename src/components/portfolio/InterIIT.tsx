import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Activity, ArrowUpRight, Eye, Scale, TrendingDown, TrendingUp } from "lucide-react";
import { PhotoStrip } from "@/components/fx/Photos";
import { Reveal, SectionHeading, useSpotlight } from "@/components/fx/primitives";
import { interIIT } from "@/data/portfolio";
import { cn } from "@/lib/utils";

const DEBATE = [
  { side: "bull", text: "RL signal BUY: momentum breakout, RSI 68, volume above its 20-day average." },
  { side: "bear", text: "News stream, T+12 min: guidance cut reported. Social sentiment flipping negative." },
  { side: "bull", text: "Fundamentals still strong. The dip may be noise." },
  { side: "bear", text: "Signals disagree on fresh data. Exposure risk is too high right now." },
  { side: "judge", text: "Validator: RL and agents disagree → HOLD. Trade blocked at the MCP risk gate." },
] as const;

/** Illustrative loop of the HP3 Bull-vs-Bear validation debate. */
function Debate() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const iv = setInterval(() => setN((x) => (x + 1) % (DEBATE.length + 3)), 1300);
    return () => clearInterval(iv);
  }, [inView]);

  return (
    <div ref={ref} className="flex min-h-[300px] flex-col rounded-xl border border-white/5 bg-background/60 p-4">
      <div className="mb-3 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
        <span>agentic-cell · $TICKER · round 3</span>
        <span className="text-muted-foreground/60">illustrative</span>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <AnimatePresence initial={false}>
          {DEBATE.slice(0, Math.min(n, DEBATE.length)).map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                "flex max-w-[92%] items-start gap-2 rounded-xl px-3 py-2 text-xs leading-relaxed",
                m.side === "bull" && "self-start bg-accent/10 text-foreground/90",
                m.side === "bear" && "self-end bg-destructive/10 text-foreground/90",
                m.side === "judge" && "mt-1 self-stretch border border-primary/40 bg-primary/10 font-mono text-primary",
              )}
            >
              {m.side === "bull" && <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />}
              {m.side === "bear" && <TrendingDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />}
              {m.side === "judge" && <Scale className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
              {m.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FlowRail({ steps }: { steps: readonly string[] }) {
  const [hot, setHot] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setHot((h) => (h + 1) % steps.length), 900);
    return () => clearInterval(iv);
  }, [steps.length]);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {steps.map((s, i) => (
        <span key={s} className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-md border px-2 py-1 font-mono text-[11px] transition-all duration-300",
              i === hot ? "border-primary bg-primary/15 text-primary shadow-[0_0_16px_-4px_hsl(var(--primary))]" : "border-white/10 text-muted-foreground",
            )}
          >
            {s}
          </span>
          {i < steps.length - 1 && <span className="text-muted-foreground/40">→</span>}
        </span>
      ))}
    </div>
  );
}

export function InterIIT() {
  const { hp3, np2 } = interIIT;
  const spot = useSpotlight<HTMLDivElement>();

  return (
    <section id="interiit" className="relative py-28 md:py-36">
      <div className="container">
        <SectionHeading
          index="05"
          label="inter.iit.14"
          title={
            <>
              Inter IIT Tech Meet <span className="text-gradient">14.0</span>
            </>
          }
          sub={interIIT.blurb}
        />

        <PhotoStrip id="interiit" photos={interIIT.photos} className="mx-auto mb-20 max-w-4xl px-2" />

        {/* HP3 */}
        <Reveal>
          <div
            ref={spot.ref}
            onMouseMove={spot.onMouseMove}
            style={{ ["--glow" as string]: "188 86% 53%" }}
            className="spotlight relative overflow-hidden rounded-3xl border border-white/[0.08] bg-card p-6 md:p-10"
          >
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-[100px]" />
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-primary px-2 py-0.5 font-mono text-xs font-bold text-primary-foreground">{hp3.code}</span>
              <span className="font-mono text-xs text-muted-foreground">high-prep · problem statement by {hp3.sponsor}</span>
              <Activity className="ml-auto h-4 w-4 text-primary" />
            </div>
            <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] [&>*]:min-w-0">
              <div>
                <h3 className="font-display text-3xl font-bold tracking-tight md:text-5xl">{hp3.name}</h3>
                <p className="mt-2 font-mono text-xs text-primary md:text-sm">{hp3.title}</p>
                <p className="mt-5 leading-relaxed text-foreground/80">{hp3.description}</p>
                <div className="mt-6">
                  <FlowRail steps={hp3.flow} />
                </div>
                <ul className="mt-6 space-y-2.5">
                  {hp3.highlights.map((h) => (
                    <li key={h} className="flex gap-3 text-sm text-muted-foreground">
                      <span className="mt-2 h-1 w-3 shrink-0 rounded bg-primary" />
                      {h}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-1.5">
                  {hp3.stack.map((s) => (
                    <span key={s} className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-1 font-mono text-[11px] text-foreground/75">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Debate />
                <div className="grid grid-cols-2 gap-3">
                  {hp3.metrics.map((m) => (
                    <div key={m.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                      <div className="font-display text-2xl font-bold text-primary">{m.value}</div>
                      <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{m.label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-center font-mono text-[10px] text-muted-foreground">{hp3.note}</p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* NP2 */}
        <Reveal className="mt-6">
          <div className="glass group grid gap-6 rounded-3xl p-6 transition-colors hover:border-pink-400/30 md:grid-cols-[auto_1fr_auto] md:items-center md:p-8">
            <div className="flex items-center gap-3 md:flex-col md:items-start">
              <span className="rounded-md bg-pink-400 px-2 py-0.5 font-mono text-xs font-bold text-background">{np2.code}</span>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-400/10 text-pink-300 transition group-hover:scale-110">
                <Eye className="h-6 w-6" />
              </span>
            </div>
            <div>
              <div className="font-mono text-xs text-muted-foreground">no-prep · problem statement by {np2.sponsor}</div>
              <h3 className="mt-1 font-display text-2xl font-bold">{np2.name}</h3>
              <p className="font-mono text-xs text-pink-300">{np2.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{np2.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {np2.stack.map((s) => (
                  <span key={s} className="font-mono text-[11px] text-foreground/60">
                    #{s.replace(/[^a-z0-9]/gi, "").toLowerCase()}
                  </span>
                ))}
              </div>
            </div>
            <a
              href={np2.live}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 self-start rounded-full border border-pink-400/40 px-4 py-2 text-sm text-pink-300 transition hover:bg-pink-400 hover:text-background md:self-center"
            >
              Live MVP <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
