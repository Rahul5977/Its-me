import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { GitMerge, GitPullRequest } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/fx/primitives";
import { experience, openSource, profile } from "@/data/portfolio";

function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 25 });

  return (
    <div ref={ref} className="relative">
      <div className="absolute bottom-0 left-[11px] top-0 w-px bg-border md:left-1/2" />
      <motion.div style={{ scaleY }} className="absolute bottom-0 left-[11px] top-0 w-px origin-top bg-gradient-to-b from-primary via-secondary to-accent md:left-1/2" />

      <div className="space-y-12">
        {experience.map((e, i) => {
          const left = i % 2 === 0;
          return (
            <div key={e.role + e.org} className="relative md:grid md:grid-cols-2 md:gap-16">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, margin: "-40% 0px" }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="absolute left-0 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-primary bg-background md:left-1/2 md:-translate-x-1/2"
              >
                <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))]" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: left ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={`ml-10 md:ml-0 ${left ? "md:col-start-1 md:text-right" : "md:col-start-2"}`}
              >
                <div className="glass group rounded-2xl p-6 transition-colors hover:border-primary/30">
                  <div className={`mb-2 flex flex-wrap items-center gap-2 font-mono text-[11px] ${left ? "md:justify-end" : ""}`}>
                    <span className="text-primary">{e.period}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="rounded bg-white/5 px-1.5 py-0.5 uppercase tracking-wider text-muted-foreground">{e.type}</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold">{e.role}</h3>
                  <div className="text-sm text-secondary">{e.org}</div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{e.summary}</p>
                  <div className={`mt-4 flex flex-wrap gap-1.5 ${left ? "md:justify-end" : ""}`}>
                    {e.tags.map((t) => (
                      <span key={t} className="rounded-md bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-foreground/70">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type Day = { date: string; count: number; level: number };

function ContributionGraph() {
  const [days, setDays] = useState<Day[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`https://github-contributions-api.jogruber.de/v4/${profile.handle}?y=last`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { contributions: Day[]; total: Record<string, number> }) => {
        setDays(d.contributions);
        setTotal(d.total?.lastYear ?? d.contributions.reduce((a, c) => a + c.count, 0));
      })
      .catch(() => setDays([]));
    return () => ctrl.abort();
  }, []);

  // Empty grid while loading or if the API is unreachable — never invent activity.
  const failed = days !== null && days.length === 0;
  const cells = useMemo<Day[]>(
    () => {
      if (!days || !days.length) return Array.from({ length: 364 }, () => ({ date: "", count: 0, level: 0 }));
      // Start on a Sunday so each column is a real calendar week, like GitHub's graph.
      const recent = days.slice(-371);
      const start = recent.findIndex((d) => new Date(`${d.date}T00:00:00`).getDay() === 0);
      return recent.slice(Math.max(start, 0));
    },
    [days],
  );

  const weeks: Day[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const shade = ["bg-white/[0.04]", "bg-primary/25", "bg-primary/45", "bg-primary/70", "bg-primary"];

  return (
    <div className="glass overflow-hidden rounded-2xl p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">github.activity</div>
        <div className="font-mono text-sm">
          <span className="text-primary">{(total ?? 1430).toLocaleString("en-IN")}</span>
          <span className="text-muted-foreground"> contributions in the last year</span>
        </div>
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="flex w-max gap-[3px]">
          {weeks.map((w, wi) => (
            <motion.div
              key={wi}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: wi * 0.015 }}
              className="flex flex-col gap-[3px]"
            >
              {w.map((d, di) => (
                <div
                  key={di}
                  title={d.date ? `${d.count} contributions on ${d.date}` : undefined}
                  className={`h-[10px] w-[10px] rounded-[2px] ${shade[d.level]} transition-transform hover:scale-150`}
                />
              ))}
            </motion.div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 font-mono text-[10px] text-muted-foreground">
        {failed && (
          <a href={profile.socials.github} target="_blank" rel="noreferrer" className="mr-auto hover:text-primary">
            live graph unavailable · view on GitHub ↗
          </a>
        )}
        less {shade.map((s) => <span key={s} className={`h-[10px] w-[10px] rounded-[2px] ${s}`} />)} more
      </div>
    </div>
  );
}

function GitLog() {
  return (
    <div className="glass rounded-2xl p-6 font-mono text-xs">
      <div className="mb-4 flex items-center gap-2 text-muted-foreground">
        <GitPullRequest className="h-4 w-4 text-secondary" />$ git log --author=rahul --merged
      </div>
      <div className="space-y-3">
        {openSource.map((pr, i) => (
          <motion.a
            key={pr.title}
            href={`https://github.com/${pr.repo}/pulls?q=is%3Apr+author%3A${profile.handle}`}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="group flex items-start gap-3 rounded-lg p-2 transition hover:bg-white/[0.03]"
          >
            <GitMerge className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" />
            <div className="min-w-0">
              <div className="truncate text-foreground/90 group-hover:text-primary">{pr.title}</div>
              <div className="text-[10px] text-muted-foreground">{pr.repo}</div>
            </div>
            <span className="ml-auto shrink-0 rounded bg-secondary/15 px-1.5 text-[10px] text-secondary">{pr.state}</span>
          </motion.a>
        ))}
      </div>
    </div>
  );
}

export function Journey() {
  return (
    <section id="journey" className="relative py-28 md:py-36">
      <div className="container">
        <SectionHeading
          index="06"
          label="journey.log"
          title={
            <>
              Where I&apos;ve been <span className="text-gradient">committing.</span>
            </>
          }
          sub="Internship, open source, clubs, and the campus where it all compiles."
        />
        <Timeline />

        <div className="mt-24 grid gap-6 lg:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
          <Reveal>
            <ContributionGraph />
          </Reveal>
          <Reveal delay={0.1}>
            <GitLog />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
