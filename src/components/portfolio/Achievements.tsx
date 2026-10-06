import { motion } from "framer-motion";
import { ArrowUpRight, BarChart3, Code2, Medal, Target, Trophy } from "lucide-react";
import { SectionHeading, useSpotlight } from "@/components/fx/primitives";
import { honors } from "@/data/portfolio";

const ICONS = { trophy: Trophy, target: Target, chart: BarChart3, code: Code2, medal: Medal };

type Honor = (typeof honors)[number];

function HonorCard({ h, i }: { h: Honor; i: number }) {
  const spot = useSpotlight<HTMLDivElement>();
  const Icon = ICONS[h.icon];
  const href = "href" in h ? h.href : undefined;
  const year = "year" in h ? h.year : undefined;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: (i % 3) * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <div
        ref={spot.ref}
        onMouseMove={spot.onMouseMove}
        className="spotlight glass group relative flex h-full flex-col overflow-hidden rounded-2xl p-6 transition-colors hover:border-primary/40"
      >
        <div className="mb-6 flex items-center justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
            <Icon className="h-5 w-5 text-primary transition group-hover:scale-110 group-hover:text-accent" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {h.tag}
            {year && ` · ${year}`}
          </span>
        </div>
        <div className="text-gradient font-display text-4xl font-bold tracking-tight md:text-5xl">{h.stat}</div>
        <h3 className="mt-3 font-display text-lg font-semibold">{h.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{h.detail}</p>
        {href && (
          <a href={href} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline">
            view profile <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </motion.div>
  );
}

export function Achievements() {
  return (
    <section id="achievements" className="relative py-28 md:py-36">
      <div className="container">
        <SectionHeading
          index="06"
          label="achievements"
          title={
            <>
              Ranks, wins &amp; <span className="text-gradient">receipts.</span>
            </>
          }
          sub="Competitions, contests and exams where the scoreboard did the talking."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {honors.map((h, i) => (
            <HonorCard key={h.title} h={h} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
